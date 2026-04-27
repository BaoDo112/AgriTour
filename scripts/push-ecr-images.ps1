[CmdletBinding()]
param(
    [string]$AwsRegion = "us-east-1",
    [string]$AwsAccountId,
    [string]$Tag = "latest",
    [switch]$SkipRepoCreate
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
        $joinedArgs = $ArgumentList -join " "
        throw "Command failed: $FilePath $joinedArgs"
    }
}

$scriptDir = Split-Path -Parent $PSCommandPath
$projectRoot = Split-Path -Parent $scriptDir

$services = @(
    @{
        Repository = "agritour-tour-catalog"
        BuildPath = Join-Path $projectRoot "services/tour-catalog"
    },
    @{
        Repository = "agritour-booking-billing"
        BuildPath = Join-Path $projectRoot "services/booking-billing"
    },
    @{
        Repository = "agritour-identity-partner"
        BuildPath = Join-Path $projectRoot "services/identity-partner"
    }
)

Write-Host "Checking AWS credentials..."
$identityRaw = & aws sts get-caller-identity --output json

if ($LASTEXITCODE -ne 0) {
    throw "AWS credentials are not ready. Configure %UserProfile%\\.aws\\credentials first."
}

$identity = $identityRaw | ConvertFrom-Json

if (-not $AwsAccountId) {
    $AwsAccountId = [string]$identity.Account
}

$ecrRegistry = "$AwsAccountId.dkr.ecr.$AwsRegion.amazonaws.com"

Write-Host "Using account $AwsAccountId in region $AwsRegion"
Write-Host "Checking Docker..."
Invoke-ExternalCommand -FilePath "docker" -ArgumentList @("--version")

Write-Host "Logging Docker into ECR $ecrRegistry ..."
$loginPassword = & aws ecr get-login-password --region $AwsRegion

if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($loginPassword)) {
    throw "Could not fetch an ECR login password."
}

$loginPassword | docker login --username AWS --password-stdin $ecrRegistry

if ($LASTEXITCODE -ne 0) {
    throw "Docker login to ECR failed."
}

$publishedImages = @()

foreach ($service in $services) {
    $repository = [string]$service.Repository
    $buildPath = [string]$service.BuildPath

    if (-not (Test-Path $buildPath)) {
        throw "Missing service directory: $buildPath"
    }

    if (-not $SkipRepoCreate) {
        & aws ecr describe-repositories --repository-names $repository --region $AwsRegion --output json 2>$null | Out-Null

        if ($LASTEXITCODE -ne 0) {
            Write-Host "Creating ECR repository $repository ..."
            Invoke-ExternalCommand -FilePath "aws" -ArgumentList @(
                "ecr",
                "create-repository",
                "--repository-name",
                $repository,
                "--region",
                $AwsRegion
            )
        }
        else {
            Write-Host "ECR repository exists: $repository"
        }
    }

    $localImage = "${repository}:$Tag"
    $remoteImage = "$ecrRegistry/${repository}:$Tag"

    Write-Host "Building $repository from $buildPath ..."
    Invoke-ExternalCommand -FilePath "docker" -ArgumentList @("build", "-t", $localImage, $buildPath)

    Write-Host "Tagging $remoteImage ..."
    Invoke-ExternalCommand -FilePath "docker" -ArgumentList @("tag", $localImage, $remoteImage)

    Write-Host "Pushing $remoteImage ..."
    Invoke-ExternalCommand -FilePath "docker" -ArgumentList @("push", $remoteImage)

    $publishedImages += $remoteImage
}

Write-Host ""
Write-Host "Published images:"
$publishedImages | ForEach-Object { Write-Host $_ }
Write-Host ""
Write-Host "Paste these exact ECR image URIs into ECS task definitions."