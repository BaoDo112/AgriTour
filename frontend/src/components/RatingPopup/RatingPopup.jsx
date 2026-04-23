import React, { useState } from "react";
import PropTypes from "prop-types";
import "./RatingPopup.css";

const RatingPopup = ({ booking, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  return (
    <div className="rating-overlay">
      <div className="rating-box">

        <h2>Rate Your Tour</h2>
        <p className="tour-name">{booking.tour_name}</p>

        {/* ⭐⭐⭐⭐⭐ */}
        <div className="stars">
          {[1,2,3,4,5].map((n) => (
            <button
              type="button"
              key={n}
              className={`star ${rating >= n ? "active" : ""}`}
              onClick={() => setRating(n)}
              aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
            >★</button>
          ))}
        </div>

        {/* Comment */}
        <textarea
          className="rating-textarea"
          placeholder="Share your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className="rating-actions">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>

          <button
            className="submit-btn"
            onClick={() => onSubmit({ rating, comment })}
          >
            Submit Review
          </button>
        </div>

      </div>
    </div>
  )
}

RatingPopup.propTypes = {
  booking: PropTypes.shape({
    tour_name: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

export default RatingPopup
