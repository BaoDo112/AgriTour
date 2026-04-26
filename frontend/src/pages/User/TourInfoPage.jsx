import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./TourInfoPage.css"; // dùng chung style confirm

const TourInfoPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) return <h2 style={{ padding: 40 }}>No tour data found.</h2>;

  const { item } = state;
  return (
    <div className="confirm-container">
      
      {/* ================= TOUR INFORMATION ================= */}
      <div className="confirm-section card">
        <h2 className="section-title">Tour Information</h2>

        <div className="tour-confirm-wrapper">
          <img
            src={item.tour.tour_image}
            alt={item.tour.tour_name}
            className="tour-img"
          />

          <table className="tour-info-table">
            <tbody>
              <tr>
                <th scope="row" className="label">Tour ID</th>
                <td>{item.tour.id}</td>
              </tr>
              <tr>
                <th scope="row" className="label">Tour Name</th>
                <td>{item.tour.tour_name}</td>
              </tr>
              <tr>
                <th scope="row" className="label">Passengers</th>
                <td>{item.passengerCount}</td>
              </tr>
              <tr>
                <th scope="row" className="label">Total Price</th>
                <td>${item.totalAmount}</td>
              </tr>
              <tr>
                <th scope="row" className="label">Start Date</th>
                <td>{item.startDate}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= CUSTOMER INFORMATION ================= */}
      <div className="confirm-section card">
        <h2 className="section-title">Customer Information</h2>

        <table className="confirm-table">
          <tbody>
            <tr>
              <th scope="row">Full Name</th>
              <td>{item.customer.fullName}</td>
            </tr>
            <tr>
              <th scope="row">Email</th>
              <td>{item.customer.email}</td>
            </tr>
            <tr>
              <th scope="row">Phone</th>
              <td>{item.customer.phone}</td>
            </tr>
            <tr>
              <th scope="row">Address</th>
              <td>{item.customer.address}</td>
            </tr>
            <tr>
              <th scope="row">Notes</th>
              <td>{item.customer.notes || "None"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ================= PASSENGERS ================= */}
      <div className="confirm-section card">
        <h2 className="section-title">Passenger Summary</h2>

        <table className="confirm-table">
          <tbody>
            <tr>
              <th scope="row">Adults</th>
              <td>{item.passengers.adults}</td>
            </tr>
            <tr>
              <th scope="row">Children (5–11y)</th>
              <td>{item.passengers.children}</td>
            </tr>
            <tr>
              <th scope="row">Small Children (2–5y)</th>
              <td>{item.passengers.smallChildren}</td>
            </tr>
            <tr>
              <th scope="row">Infants (&lt;2y)</th>
              <td>{item.passengers.infants}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ================= BUTTON ================= */}
      <div className="confirm-buttons">
        <button className="back-btn" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    </div>
  );
};

export default TourInfoPage;
