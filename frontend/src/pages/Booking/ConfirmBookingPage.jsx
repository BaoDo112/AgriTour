
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ConfirmBookingPage.css";
import { useUserTours } from "../../context-store/UserToursContext";
import { useCart } from "../../context-store/CartContext";
import { useAuth } from "../../context-store/AuthContext";   //  ADD: Lấy user đang đăng nhập
import { bookingService } from "../../services/api";

const ConfirmBookingPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();  // ⭐ Lấy user từ login
  const { removeBooking } = useCart();
  const { addUpcomingTour } = useUserTours();

  const API_URL = bookingService.apiUrl;

  const formatDate = (dateStr) => {
    if (!dateStr) return "Updating...";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB"); // DD/MM/YYYY
  };
  if (!state) {
    return <h2 style={{ padding: 40 }}>No booking data found.</h2>;
  }

  


  const { tempId, tour, customer, passengers, paymentMethod, totalAmount } = state;

  //  HANDLE CONFIRM BOOKING + CONNECT BACKEND
  const handleConfirmPay = async () => {
    try {
      if (!user) {
        alert("You must be logged in to book a tour.");
        return navigate("/login");
      }

      const passengerCount =
        passengers.adults +
        passengers.children +
        passengers.smallChildren +
        passengers.infants;

      //  CALL BACKEND: CREATE BOOKING
      const response = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: user.user_id,   //  Dùng user thật
          tour_id: tour.id,
          num_people: passengerCount,
          total_price: totalAmount
        })
      });

      const data = await response.json();

      if (data.error) {
        alert("Booking failed: " + data.error);
        return;
      }

      //  DELETE TEMP CART BOOKING
      if (tempId) {
        removeBooking(tempId);
      }

      //  ADD TO UPCOMING TOUR LOCAL
      addUpcomingTour({
        bookingId: data.booking_id || Date.now(), // fallback nếu backend không trả ID
        tour,
        passengers,
        customer,
        totalAmount,
        startDate: formatDate(tour.start_date),
        passengerCount
      });

      alert("Booking created successfully!");
      navigate("/user/panel");

    } catch (err) {
      console.error(err);
      alert("Error connecting to server.");
    }
  };

  return (
    <div className="confirm-container">

      {/* ================= TOUR INFORMATION ================= */}
      <div className="confirm-section card">
        <h2 className="section-title">Tour Information</h2>

        <div className="tour-confirm-wrapper">
          <img
            src={tour.tour_image || tour.image_url}
            alt={tour.tour_name}
            className="tour-img"
          />

          <table className="tour-info-table">
            <tbody>
              <tr>
                <th scope="row" className="label">Tour ID</th>
                <td>{tour.id}</td>
              </tr>
              <tr>
                <th scope="row" className="label">Tour Name</th>
                <td>{tour.tour_name}</td>
              </tr>
              <tr>
                <th scope="row" className="label">Duration</th>
                <td>{tour.period}</td>
              </tr>
              <tr>
                <th scope="row" className="label">Price</th>
                <td>{tour.price} / person</td>
              </tr>
              <tr>
                <th scope="row" className="label">Start Date</th>
                <td>{formatDate(tour.start_date)}</td>
              </tr>
              <tr>
                <th scope="row" className="label">Departure</th>
                <td>Ho Chi Minh City</td>
              </tr>
              <tr>
                <th scope="row" className="label">Available Seats</th>
                <td>10</td>
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
              <td>{customer.fullName}</td>
            </tr>
            <tr>
              <th scope="row">Email</th>
              <td>{customer.email}</td>
            </tr>
            <tr>
              <th scope="row">Phone Number</th>
              <td>{customer.phone}</td>
            </tr>
            <tr>
              <th scope="row">Address</th>
              <td>{customer.address}</td>
            </tr>
            <tr>
              <th scope="row">Notes</th>
              <td>{customer.notes || "None"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ================= PASSENGERS ================= */}
      <div className="confirm-section card">
        <h2 className="section-title">Passenger Summary</h2>

        <table className="confirm-table">
          <thead>
            <tr>
              <th>Passenger Type</th>
              <th>Quantity</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Adults</td>
              <td>{passengers.adults}</td>
            </tr>
            <tr>
              <td>Children (5–11y)</td>
              <td>{passengers.children}</td>
            </tr>
            <tr>
              <td>Small Children (2–5y)</td>
              <td>{passengers.smallChildren}</td>
            </tr>
            <tr>
              <td>Infants (&lt;2y)</td>
              <td>{passengers.infants}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ================= PAYMENT ================= */}
      <div className="confirm-section card">
        <h2 className="section-title">Payment Method</h2>

        <p className="payment-method">
          <strong>Selected Method:</strong> {paymentMethod.toUpperCase()}
        </p>

        <h3>Total Amount:</h3>
        <div className="total-price">${totalAmount}</div>
      </div>

      {/* ================= BUTTONS ================= */}
      <div className="confirm-buttons">
        <button className="back-btn" onClick={() => navigate(-1)}>
          Go Back
        </button>

        <button className="confirm-btn" onClick={handleConfirmPay}>
          Confirm & Pay
        </button>
      </div>

    </div>
  );
};

export default ConfirmBookingPage;
