const TOUR_CATALOG_MOCK_DATA = {
	14: {
		tour_id: 14,
		tour_name: "Mekong Delta Fruit Garden Tour",
		image_url: "/mock/tours/mekong-fruit-garden.jpg",
		start_date: "2025-11-25",
		end_date: "2025-11-28",
		price: 45,
	},
	23: {
		tour_id: 23,
		tour_name: "Thanh Tien Paper Flower Craft & Village Tour",
		image_url: "/mock/tours/thanh-tien-paper-flower.jpg",
		start_date: "2025-12-17",
		end_date: "2025-12-22",
		price: 60,
	},
	38: {
		tour_id: 38,
		tour_name: "Vinh Long Farm & Lotus Experience",
		image_url: "/mock/tours/vinh-long-farm-lotus.jpg",
		start_date: "2025-12-05",
		end_date: "2025-12-07",
		price: 30,
	},
	40: {
		tour_id: 40,
		tour_name: "Dak Lak Mountain Adventure & Cultural Experience",
		image_url: "/mock/tours/dak-lak-mountain-adventure.jpg",
		start_date: "2025-11-30",
		end_date: "2025-12-03",
		price: 40,
	},
};

const normalizeTour = (tour) => {
	if (!tour) return null;
	const hasPrice = tour.price !== null && tour.price !== undefined;

	return {
		tour_id: Number(tour.tour_id),
		tour_name: tour.tour_name,
		image_url: tour.image_url || null,
		start_date: tour.start_date || null,
		end_date: tour.end_date || null,
		price: hasPrice ? Number(tour.price) : null,
	};
};

const getMockTourById = (tourId) => {
	const key = String(tourId);
	const direct = TOUR_CATALOG_MOCK_DATA[key] || TOUR_CATALOG_MOCK_DATA[Number(key)];
	if (direct) return normalizeTour(direct);

	const fallback = Object.values(TOUR_CATALOG_MOCK_DATA)[0];
	if (!fallback) return null;

	return {
		...normalizeTour(fallback),
		tour_id: Number(tourId),
	};
};

module.exports = { getMockTourById };
