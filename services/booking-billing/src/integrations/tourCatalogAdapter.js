const axios = require("axios");
const { getMockTourById } = require("../mocks/tourCatalogMock");

const PROVIDER_KEYS = Object.freeze({
	SERVICE: "service",
	REQUEST: "request",
	MOCK: "mock",
});

const PROVIDER_SOURCE = Object.freeze({
	[PROVIDER_KEYS.SERVICE]: "service-a",
	[PROVIDER_KEYS.REQUEST]: "request-fallback",
	[PROVIDER_KEYS.MOCK]: "mock-fallback",
});

const normalizeTourPayload = (raw, fallbackTourId) => {
	if (!raw || typeof raw !== "object") return null;

	const source = raw.data && typeof raw.data === "object" ? raw.data : raw;
	const normalized = {
		tour_id: source.tour_id ?? source.id ?? fallbackTourId,
		tour_name: source.tour_name ?? source.title ?? null,
		image_url: source.image_url ?? source.image ?? null,
		start_date: source.start_date ?? null,
		end_date: source.end_date ?? null,
		price: source.price != null ? Number(source.price) : null,
	};

	if (normalized.price != null && Number.isNaN(normalized.price)) {
		normalized.price = null;
	}

	return normalized;
};

const parseProviderOrder = (value) => {
	if (!value || typeof value !== "string") return [];

	const valid = new Set(Object.values(PROVIDER_KEYS));
	const unique = [];

	for (const item of value.split(",")) {
		const key = item.trim().toLowerCase();
		if (!valid.has(key)) continue;
		if (unique.includes(key)) continue;
		unique.push(key);
	}

	return unique;
};

const getProviderOrder = () => {
	const byOrderEnv = parseProviderOrder(process.env.TOUR_CATALOG_PROVIDER_ORDER);
	if (byOrderEnv.length > 0) return byOrderEnv;

	const fallbackMode = (process.env.TOUR_CATALOG_FALLBACK || "mock")
		.toLowerCase()
		.trim();

	if (fallbackMode === "none") {
		return [PROVIDER_KEYS.SERVICE, PROVIDER_KEYS.REQUEST];
	}

	return [
		PROVIDER_KEYS.SERVICE,
		PROVIDER_KEYS.REQUEST,
		PROVIDER_KEYS.MOCK,
	];
};

const fetchFromTourService = async (tourId) => {
	const baseUrl = process.env.TOUR_CATALOG_URL;
	if (!baseUrl) return null;

	const timeoutMs = Number(process.env.TOUR_FETCH_TIMEOUT_MS || 1500);
	const retries = Math.max(0, Number(process.env.TOUR_FETCH_RETRIES || 1));
	const attempts = retries + 1;

	for (let attempt = 1; attempt <= attempts; attempt += 1) {
		try {
			const response = await axios.get(
				`${baseUrl.replace(/\/$/, "")}/api/tours/${tourId}`,
				{
					timeout: timeoutMs,
					validateStatus: () => true,
				}
			);

			if (response.status === 404) {
				return null;
			}

			if (response.status >= 200 && response.status < 300) {
				return normalizeTourPayload(response.data, tourId);
			}
		} catch (err) {
			if (attempt === attempts) return null;
		}
	}

	return null;
};

const fetchFromRequestSnapshot = (tourId, requestBody) => {
	if (!requestBody || typeof requestBody !== "object") return null;

	const snapshot =
		typeof requestBody.tour_snapshot === "object" ? requestBody.tour_snapshot : {};

	const candidate = normalizeTourPayload(
		{
			tour_id: tourId,
			tour_name:
				requestBody.tour_title ?? requestBody.tour_name ?? snapshot.tour_name,
			image_url: requestBody.tour_image_url ?? snapshot.image_url,
			start_date: requestBody.tour_start_date ?? snapshot.start_date,
			end_date: requestBody.tour_end_date ?? snapshot.end_date,
			price:
				requestBody.tour_unit_price ?? requestBody.tour_price ?? snapshot.price,
		},
		tourId
	);

	if (!candidate) return null;

	const hasAnyField =
		candidate.tour_name ||
		candidate.image_url ||
		candidate.start_date ||
		candidate.end_date ||
		candidate.price != null;

	return hasAnyField ? candidate : null;
};

const fetchFromMockProvider = (tourId) => {
	return getMockTourById(tourId);
};

const PROVIDERS = {
	[PROVIDER_KEYS.SERVICE]: async ({ tourId }) => fetchFromTourService(tourId),
	[PROVIDER_KEYS.REQUEST]: async ({ tourId, requestBody }) =>
		fetchFromRequestSnapshot(tourId, requestBody),
	[PROVIDER_KEYS.MOCK]: async ({ tourId }) => fetchFromMockProvider(tourId),
};

const resolveTourSnapshot = async (tourId, requestBody) => {
	const providerOrder = getProviderOrder();

	for (const providerKey of providerOrder) {
		const provider = PROVIDERS[providerKey];
		if (!provider) continue;

		const tour = await provider({ tourId, requestBody });
		if (tour && tour.tour_name) {
			return {
				tour,
				source: PROVIDER_SOURCE[providerKey] || providerKey,
			};
		}
	}

	return { tour: null, source: "unavailable" };
};

module.exports = {
	resolveTourSnapshot,
};
