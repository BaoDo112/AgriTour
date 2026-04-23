import React, { useState, useEffect } from "react";
import "./UserPanel.css";
import TourCard from "./TourCard";
import { useAuth } from "../../context-store/AuthContext";
import { bookingService, resolveAssetUrl } from "../../services/api";

// Hàm format ngày dd/mm/yyyy
const formatDate = (datetimeStr) => {
  const date = new Date(datetimeStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const UserPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [tours, setTours] = useState({
    upcoming: [],
    ongoing: [],
    completed: [],
    cancelled: []
  });

  useEffect(() => {
    if (!user) return;

    const fetchTours = async () => {
      try {
        const res = await fetch(`${bookingService.apiUrl}/bookings/user/${user.user_id}`);
        if (!res.ok) throw new Error("Failed to fetch tours");
        const data = await res.json();

        const categorized = {
          upcoming: [],
          ongoing: [],
          completed: [],
          cancelled: []
        };

        data.forEach((booking) => {
          const start = new Date(booking.tour_start_date);
          const end = new Date(booking.tour_end_date);
          const now = new Date();

          let status = booking.status === "cancelled" ? "cancelled" : "completed";
          if (status !== "cancelled") {
            if (now < start) status = "upcoming";
            else if (now >= start && now <= end) status = "ongoing";
          }

          categorized[status].push({
            tour: {
              id: booking.tour_id,
              tour_name: booking.tour_title,
              tour_image: resolveAssetUrl(bookingService.baseUrl, booking.tour_image_url),
              image_url: resolveAssetUrl(bookingService.baseUrl, booking.tour_image_url),
              start_date: formatDate(booking.tour_start_date),
              end_date: formatDate(booking.tour_end_date),
              price: booking.tour_unit_price,
            },
            passengerCount: booking.num_people,
            totalAmount: booking.total_price,
            startDate: formatDate(booking.tour_start_date),
            endDate: formatDate(booking.tour_end_date),
            bookingId: booking.booking_id,
          });
        });

        setTours(categorized);
      } catch (error) {
        console.error("Error fetching tours:", error);
      }
    };

    fetchTours();
  }, [user]);

  return (
    <div className="userpanel-container">
      <h2 className="userpanel-title">My Tours</h2>

      <div className="userpanel-tabs">
        {["upcoming", "ongoing", "completed", "cancelled"].map(t => (
          <button
            key={t}
            className={`tab-btn ${activeTab === t ? "active" : ""}`}
            onClick={() => setActiveTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="userpanel-content">
        {tours[activeTab].length === 0 ? (
          <p>No tours in this category.</p>
        ) : (
          tours[activeTab].map((item) => (
            <TourCard
              key={item.bookingId}
              item={item}
              status={activeTab}
              onCancel={() => console.log("Cancel", item)}
              onRate={() => console.log("Rate", item)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default UserPanel;
