import React from "react";
import PropTypes from "prop-types";
import "./TourCard.css";
import { useNavigate } from "react-router-dom";
const TourCard = ({ item, status, onCancel, onRate }) => {
  const navigate = useNavigate();   

  return (
    <div className="tour-card">
      <img src={item.tour.tour_image} alt={item.tour.tour_name} className="tour-card-img" />

      <div className="tour-card-info">
        <h3 className="tour-name">{item.tour.tour_name}</h3>

        <p className="tour-detail"><b>Tour ID:</b> {item.tour.id}</p>
        <p className="tour-detail">
          <b>Passengers:</b> {item.passengerCount}
        </p>
        <p className="tour-detail"><b>Total Price:</b> ${item.totalAmount}</p>
        <p className="tour-detail"><b>Start Date:</b> {item.startDate}</p>
        <p className="tour-detail"><b>End Date:</b> {item.endDate}</p>
        

        <span className={`badge badge-${status}`}>{status.toUpperCase()}</span>

        <div className="tour-card-actions">
          <button
            className="view-btn"
            onClick={() =>
              navigate("/tour-info", { state: { item } })
            }
          >
            View
          </button>

          {status === "upcoming" && (
            <button className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
          )}

          {status === "completed" && (
            <button className="rate-btn" onClick={onRate}>
              Rate ★
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

TourCard.propTypes = {
  item: PropTypes.shape({
    passengerCount: PropTypes.number,
    totalAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    tour: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      tour_name: PropTypes.string,
      tour_image: PropTypes.string,
    }).isRequired,
  }).isRequired,
  status: PropTypes.string.isRequired,
  onCancel: PropTypes.func,
  onRate: PropTypes.func,
};

export default TourCard;
