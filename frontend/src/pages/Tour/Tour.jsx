import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import RegionSelector from "../../components/region/RegionSelector";
import { StoreContext } from "../../context-store/StoreContext";
import { resolveAssetUrl, tourService } from "../../services/api";
import "./Tour.css";

const REGION_MAP_DB = {
  1: "North",
  2: "Central",
  3: "South",
};

const calcPeriod = (startDate, endDate) => {
  if (!startDate || !endDate) return "Updating...";
  const start = new Date(startDate);
  const end = new Date(endDate);
  return `${Math.ceil((end - start) / (1000 * 3600 * 24))} days`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "Updating...";
  return new Date(dateStr).toLocaleDateString("en-GB");
};

const normalizeTourResponse = (tour) => ({
  id: tour.tour_id,
  tour_name: tour.tour_name,
  image_url: resolveAssetUrl(tourService.baseUrl, tour.image_url),
  start_date: formatDate(tour.start_date),
  end_date: formatDate(tour.end_date),
  period: calcPeriod(tour.start_date, tour.end_date),
  price: tour.price,
  region_name: REGION_MAP_DB[tour.region_id],
  available_slots: tour.available_slots,
});

const Tour = () => {
  const { region } = useContext(StoreContext);
  const regionSectionRef = useRef(null);
  const [dbTours, setDbTours] = useState([]);

  useEffect(() => {
    const loadTours = async () => {
      try {
        const response = await fetch(`${tourService.apiUrl}/tours`);
        const data = await response.json();
        const approvedTours = data.filter((tour) => tour.status?.toLowerCase() === "approved");
        setDbTours(approvedTours.map(normalizeTourResponse));
      } catch (error) {
        console.error(error);
      }
    };

    void loadTours();
  }, []);

  const hotTours = dbTours.slice(0, 4);
  const eduTours = dbTours.filter((tour) => tour.region_name === "Central");
  const filteredRegionTours =
    region === "All" ? [] : dbTours.filter((tour) => tour.region_name === region);

  useEffect(() => {
    if (region !== "All" && regionSectionRef.current) {
      regionSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [region]);

  return (
    <>
      <div className="explore-tour">
        <h1>Explore Tour</h1>

        <RegionSelector />

        <h2>Tour hot in all season !!!</h2>
        <div className="explore-tour-list">
          {hotTours.map((tour) => (
            <div key={tour.id} className="explore-tour-item">
              <img src={tour.image_url} alt={tour.tour_name} />

              <h3>{tour.tour_name}</h3>
              <p>Start Date: {tour.start_date}</p>
              <p>Period: {tour.period}</p>
              <p>Slot: {tour.available_slots}</p>

              <div className="tour-price-row">
                <p className="tour-price">{Number(tour.price)}$</p>
                <Link to={`/tour-details/${tour.id}`}>
                  <button className="view-details-btn">View Details</button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <h2>Tour with education</h2>
        <div className="explore-tour-list">
          {eduTours.length === 0 ? (
            <p>No education tours available.</p>
          ) : (
            eduTours.map((tour) => (
              <div key={tour.id} className="explore-tour-item">
                <img src={tour.image_url} alt={tour.tour_name} />

                <h3>{tour.tour_name}</h3>
                <p>Start Date: {tour.start_date}</p>
                <p>Period: {tour.period}</p>
                <p>Slot: {tour.available_slots}</p>

                <div className="tour-price-row">
                  <p className="tour-price">{Number(tour.price)}$</p>
                  <Link to={`/tour-details/${tour.id}`}>
                    <button className="view-details-btn">View Details</button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {region !== "All" && (
        <div className="main-region-tour" ref={regionSectionRef}>
          <h2>Tour in {region}</h2>

          <div className="main-tour-list">
            {filteredRegionTours.length === 0 ? (
              <p>No tours available in this region.</p>
            ) : (
              filteredRegionTours.map((tour) => (
                <div key={tour.id} className="main-tour-item">
                  <img src={tour.image_url} alt={tour.tour_name} />

                  <h3>{tour.tour_name}</h3>
                  <p>Start Date: {tour.start_date}</p>
                  <p>Period: {tour.period}</p>
                  <p>Slot: {tour.available_slots}</p>

                  <div className="tour-price-row">
                    <p className="tour-price">{Number(tour.price)}$</p>
                    <Link to={`/tour-details/${tour.id}`}>
                      <button className="view-details-btn">View Details</button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Tour;
