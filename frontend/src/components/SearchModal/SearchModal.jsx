import React, { useState } from "react";
import PropTypes from "prop-types";
import "./SearchModal.css";
import { tour, list_tour_1, list_tour_2 } from "../../assets/assets";
import { useNavigate } from "react-router-dom";
const SearchModal = ({ onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const allTours = [...tour, ...list_tour_1, ...list_tour_2];

  const filtered = allTours.filter((t) =>
    t.tour_name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="search-overlay">
      <div className="search-box">
        <button className="close-btn" onClick={onClose}>×</button>

        <h2>Search Tours</h2>
        
        <input
          type="text"
          placeholder="Search tour name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="search-results">
          {filtered.map((t) => (
            <button
              type="button"
              key={t.id}
              className="search-item"
              onClick={() => {
                navigate(`/tour-details/${t.id}`);
                onClose();
              }}
            >
              {/* LEFT SIDE */}
              <div className="search-left">
                <img src={t.tour_image} alt={t.tour_name} />

                <div className="search-info">
                  <h4>{t.tour_name}</h4>
                  <p>{t.start_date} — {t.period}</p>
      
                  {/* AVAILABLE STATUS */}
                  <p className={`search-status ${t.available ? "available" : "soldout"}`}>
                    {t.available ? "Available" : "Sold Out"}
                  </p>
                </div>
              </div>

              {/* RIGHT SIDE: PRICE */}
              <div className="search-price">
                {t.price}
              </div>
            </button>

          ))}

          {query !== "" && filtered.length === 0 && (
            <p className="no-result">No tours found.</p>
          )}
        </div>
      </div>
    </div>
  )
}

SearchModal.propTypes = {
  onClose: PropTypes.func.isRequired,
}

export default SearchModal
