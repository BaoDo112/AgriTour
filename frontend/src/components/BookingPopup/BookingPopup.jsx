import React from 'react'
import PropTypes from 'prop-types'
import './BookingPopup.css'
const BookingPopup = ({ setShowBooking, selectedTour, user }) => {
  

  return (
      <div className="popup-overlay">
      <div className="popup-box">
        <h2>Tour Booking</h2>

        <p><b>Tour:</b> {selectedTour.tour_name}</p>
        <p><b>Customer:</b> {user.full_name}</p>
        <p><b>Email:</b> {user.email}</p>

        <input type="text" placeholder="Full Name" defaultValue={user.full_name} />
        <input type="text" placeholder="Phone Number" defaultValue={user.phone} />
        <input type="number" placeholder="Number of tickets" />

        <button className="confirm-btn">Confirm Booking</button>
        <button className="close-btn" onClick={() => setShowBooking(false)}>Close</button>
      </div>
    </div>
  )
}

BookingPopup.propTypes = {
  setShowBooking: PropTypes.func.isRequired,
  selectedTour: PropTypes.shape({
    tour_name: PropTypes.string,
  }).isRequired,
  user: PropTypes.shape({
    full_name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
  }).isRequired,
}

export default BookingPopup
