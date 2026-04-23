import React, { useEffect, useState } from "react";
import "./Admin.css";
import { useAuth } from "../../context-store/AuthContext";
import { tourService } from "../../services/api";

const getPartnerLabel = (tour) => {
  if (tour.partner_name) return tour.partner_name;
  if (tour.partner_id) return `Partner #${tour.partner_id}`;
  return "Unknown";
};

const fetchManagedTours = async (token) => {
  const response = await fetch(`${tourService.apiUrl}/tours/admin/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch admin tours");
  }

  return response.json();
};

const ManageTours = () => {
  const { user } = useAuth();
  const [tours, setTours] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [partnerFilter, setPartnerFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user?.token) return;

    const loadTours = async () => {
      try {
        const data = await fetchManagedTours(user.token);
        setTours([...data]);
        setCurrentPage(1);
      } catch (error) {
        console.error("Error fetching tours:", error);
      }
    };

    void loadTours();
  }, [user?.token]);

  const handleReview = async (tour_id, action) => {
    const note = action === "rejected" ? prompt("Reason?") : "";

    setTours((prev) =>
      prev.map((tour) =>
        tour.tour_id === tour_id ? { ...tour, status: action } : tour
      )
    );

    try {
      const response = await fetch(`${tourService.apiUrl}/tours/review/${tour_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ action, note }),
      });

      if (!response.ok) {
        alert("Error while approving!");
        return;
      }

      const refreshedTours = await fetchManagedTours(user.token);
      setTours(refreshedTours);
      setCurrentPage(1);
    } catch (error) {
      console.error("Review error:", error);
      alert("Server error");
    }
  };

  const filteredTours = tours.filter((tour) => {
    const matchesSearch = tour.tour_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? tour.status === statusFilter : true;
    const matchesRegion = regionFilter ? tour.region_name === regionFilter : true;
    const matchesLocation = locationFilter
      ? tour.location?.toLowerCase().includes(locationFilter.toLowerCase())
      : true;
    const matchesPartner = partnerFilter
      ? getPartnerLabel(tour).toLowerCase().includes(partnerFilter.toLowerCase())
      : true;

    return matchesSearch && matchesStatus && matchesLocation && matchesPartner && matchesRegion;
  });

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredTours.length / itemsPerPage);
  const paginatedTours = filteredTours.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="booking-tour-container">
      <h2>Manage Tours</h2>

      <div className="partner-filter">
        <input
          type="text"
          placeholder="Search by tour name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <input
          type="text"
          placeholder="Search by location..."
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        />

        <input
          type="text"
          placeholder="Search by partner..."
          value={partnerFilter}
          onChange={(e) => setPartnerFilter(e.target.value)}
        />

        <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
          <option value="">All region</option>
          <option value="North">North</option>
          <option value="Central">Central</option>
          <option value="South">South</option>
        </select>
      </div>

      <table className="booking-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tour Name</th>
            <th>Location</th>
            <th>Start</th>
            <th>End</th>
            <th>Price</th>
            <th>Partner</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {paginatedTours.map((tour) => (
            <tr key={tour.tour_id}>
              <td>{tour.tour_id}</td>
              <td>{tour.tour_name}</td>
              <td>{tour.location}</td>
              <td>{tour.start_date?.split("T")[0]}</td>
              <td>{tour.end_date?.split("T")[0]}</td>
              <td>{tour.price}</td>
              <td>{getPartnerLabel(tour)}</td>
              <td>
                <span className={`status ${tour.status}`}>{tour.status}</span>
              </td>
              <td>
                <button
                  className="action-btn edit"
                  onClick={() => alert(`Edit flow is not implemented yet for tour ${tour.tour_id}`)}
                >
                  Edit
                </button>

                {tour.status === "pending" && (
                  <>
                    <button className="action-btn approve" onClick={() => handleReview(tour.tour_id, "approved")}>
                      Approve
                    </button>

                    <button className="action-btn reject" onClick={() => handleReview(tour.tour_id, "rejected")}>
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={currentPage === i + 1 ? "active" : ""}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ManageTours;
