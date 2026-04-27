[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$DbHost,

    [int]$DbPort = 3306,

    [string]$DbUser = "admin",

    [string]$DbPassword,

    [string]$CaFilePath,

    [string]$DockerImage = "mysql:8.4"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-ExternalCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath,

        [string[]]$ArgumentList = @()
    )

    & $FilePath @ArgumentList

    if ($LASTEXITCODE -ne 0) {
        $safeArgs = $ArgumentList | ForEach-Object {
            if ($_ -like "MYSQL_PWD=*") {
                "MYSQL_PWD=<redacted>"
            }
            else {
                $_
            }
        }

        $joinedArgs = $safeArgs -join " "
        throw "Command failed: $FilePath $joinedArgs"
    }
}

function ConvertTo-PlainText {
    param(
        [Parameter(Mandatory = $true)]
        [Security.SecureString]$SecureString
    )

    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureString)

    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
}

$scriptDir = Split-Path -Parent $PSCommandPath
$projectRoot = Split-Path -Parent $scriptDir
$tmpDir = Join-Path $scriptDir ".tmp"
$tempImportPath = Join-Path $tmpDir "rds-import.sql"
$tempCaPath = Join-Path $tmpDir "rds-ca.pem"

if (-not $CaFilePath) {
    $CaFilePath = Join-Path $projectRoot "global-bundle.pem"
}

if (-not (Test-Path $CaFilePath)) {
    throw "Missing CA bundle at $CaFilePath. Download it first with: curl.exe -o .\\global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem"
}

$schemaFiles = @(
    (Join-Path $projectRoot "shared/db-schemas/agritour_catalog.sql")
    (Join-Path $projectRoot "shared/db-schemas/agritour_booking.sql")
    (Join-Path $projectRoot "shared/db-schemas/agritour_identity.sql")
)

foreach ($schemaFile in $schemaFiles) {
    if (-not (Test-Path $schemaFile)) {
        throw "Missing schema file: $schemaFile"
    }
}

Invoke-ExternalCommand -FilePath "docker" -ArgumentList @("--version")

$netConnectionCommand = Get-Command -Name "Test-NetConnection" -ErrorAction SilentlyContinue

if ($netConnectionCommand) {
    $netConnection = Test-NetConnection -ComputerName $DbHost -Port $DbPort -WarningAction SilentlyContinue

    if (-not $netConnection.TcpTestSucceeded) {
        throw "Cannot reach ${DbHost}:$DbPort from this machine. Check that the RDS instance is Available, Public access is Yes, and the RDS security group allows inbound TCP 3306 from your current public IP."
    }
}

if (-not $DbPassword) {
    $securePassword = Read-Host "Enter the RDS password for $DbUser@$DbHost" -AsSecureString
    $DbPassword = ConvertTo-PlainText -SecureString $securePassword
}

if ([string]::IsNullOrWhiteSpace($DbPassword)) {
    throw "Database password cannot be empty."
}

New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null

$importCommands = @(
    "SOURCE /workspace/shared/db-schemas/agritour_catalog.sql;",
    "SOURCE /workspace/shared/db-schemas/agritour_booking.sql;",
    "SOURCE /workspace/shared/db-schemas/agritour_identity.sql;",
    "SHOW DATABASES;"
)

Set-Content -Path $tempImportPath -Value ($importCommands -join [Environment]::NewLine) -Encoding ascii
Copy-Item -Path $CaFilePath -Destination $tempCaPath -Force

$dockerShellCommand = "mysql --host=$DbHost --port=$DbPort --user=$DbUser --ssl-mode=VERIFY_IDENTITY --ssl-ca=/workspace/scripts/.tmp/rds-ca.pem < /workspace/scripts/.tmp/rds-import.sql"

Write-Host "Importing schemas into ${DbHost}:$DbPort using Docker image $DockerImage ..."

try {
    Invoke-ExternalCommand -FilePath "docker" -ArgumentList @(
        "run",
        "--rm",
        "-e",
        "MYSQL_PWD=$DbPassword",
        "-v",
        "${projectRoot}:/workspace",
        $DockerImage,
        "sh",
        "-c",
        $dockerShellCommand
    )
}
finally {
    if (Test-Path $tempImportPath) {
        Remove-Item $tempImportPath -Force
    }

    if (Test-Path $tempCaPath) {
        Remove-Item $tempCaPath -Force
    }
}

Write-Host ""
Write-Host "Schema import completed. Confirm that the databases exist:"
Write-Host "- agritour_catalog"
Write-Host "- agritour_booking"
Write-Host "- agritour_identity"