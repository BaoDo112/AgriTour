import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context-store/AuthContext";
import { resolveAssetUrl, tourService } from "../../services/api";
import "./PartnerTours.css";

const getStatusBadgeClass = (status) => {
  if (status === "approved") return "status-approved";
  if (status === "rejected") return "status-rejected";
  return "status-pending";
};

const PartnerTours = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user?.user_id) return;

    const loadTours = async () => {
      try {
        const response = await fetch(`${tourService.apiUrl}/tours/partner/${user.user_id}`);
        const data = await response.json();
        const sortedTours = [...data].sort((a, b) => b.tour_id - a.tour_id);
        setTours(sortedTours);
      } catch (error) {
        console.error("Fetch tours error:", error);
      }
    };

    void loadTours();
  }, [user?.user_id]);

  const filteredTours = useMemo(
    () => tours.filter((tour) => tour.tour_name.toLowerCase().includes(search.toLowerCase())),
    [search, tours]
  );

  return (
    <div className="partner-tours">
      <h1>Manage Your Tours</h1>

      <div className="top-bar">
        <input
          type="text"
          placeholder="Search tours..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={() => navigate("/partner/tours/create")}>Create New Tour</button>
      </div>

      <div className="tour-container">
        {filteredTours.length === 0 ? (
          <p>No tours found.</p>
        ) : (
          filteredTours.map((tour) => {
            const imageUrl = resolveAssetUrl(tourService.baseUrl, tour.image_url);
            const statusClass = getStatusBadgeClass(tour.status);

            return (
              <div key={tour.tour_id} className="tour-card">
                <div className="tour-info">
                  {tour.image_url ? <img src={imageUrl} alt={tour.tour_name} /> : "No Image"}

                  <div>
                    <h3>{tour.tour_name}</h3>
                    <p>Location: {tour.location}</p>
                    <p>Price: ${tour.price}</p>
                    <p>
                      Status: <span className={`status-badge ${statusClass}`}>{tour.status || "pending"}</span>
                    </p>
                  </div>
                </div>

                <div className="tour-actions">
                  <button onClick={() => alert(`Update flow is not implemented yet for tour ${tour.tour_id}`)}>
                    Update
                  </button>
                  <button onClick={() => alert(`Delete flow is not implemented yet for tour ${tour.tour_id}`)}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PartnerTours;
