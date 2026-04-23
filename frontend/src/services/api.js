const stripTrailingSlash = (value = "") => value.replace(/\/$/, "");

const stripApiSuffix = (value = "") => value.replace(/\/api$/, "");

const monolithApiUrl = stripTrailingSlash(import.meta.env.VITE_API_URL || "");
const monolithBaseUrl = stripTrailingSlash(
  import.meta.env.VITE_API_BASE || stripApiSuffix(monolithApiUrl)
);

const createServiceConfig = (apiEnvKey, baseEnvKey, localDefaultApiUrl) => {
  const apiUrl = stripTrailingSlash(
    import.meta.env[apiEnvKey] || monolithApiUrl || localDefaultApiUrl
  );
  const baseUrl = stripTrailingSlash(
    import.meta.env[baseEnvKey] || monolithBaseUrl || stripApiSuffix(apiUrl)
  );

  return {
    apiUrl,
    baseUrl,
  };
};

export const tourService = createServiceConfig(
  "VITE_TOUR_API_URL",
  "VITE_TOUR_API_BASE",
  "http://localhost:3001/api"
);

export const bookingService = createServiceConfig(
  "VITE_BOOKING_API_URL",
  "VITE_BOOKING_API_BASE",
  "http://localhost:3002/api"
);

export const identityService = createServiceConfig(
  "VITE_IDENTITY_API_URL",
  "VITE_IDENTITY_API_BASE",
  "http://localhost:3003/api"
);

export const resolveAssetUrl = (baseUrl, path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${baseUrl}${path}`;
};