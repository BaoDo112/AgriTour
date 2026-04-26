import React, { useEffect, useMemo, useState } from 'react';
import './Admin.css';
import { useAuth } from '../../context-store/AuthContext';
import { bookingService } from '../../services/api';

const formatBookingStatus = (status) => {
  if (!status) {
    return 'Pending';
  }

  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const formatBookingDate = (value) => {
  if (!value) {
    return 'N/A';
  }

  return new Date(value).toLocaleDateString('en-GB');
};

const BookingTour = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const headers = user?.token
          ? { Authorization: `Bearer ${user.token}` }
          : undefined;

        const response = await fetch(`${bookingService.apiUrl}/bookings`, { headers });
        const data = await response.json();

        if (!response.ok) {
          setErrorMessage(data.error || data.message || 'Failed to load bookings.');
          setBookings([]);
          return;
        }

        setBookings(data);
      } catch (error) {
        console.error('Load bookings error:', error);
        setErrorMessage('Failed to reach booking service.');
      } finally {
        setLoading(false);
      }
    };

    void loadBookings();
  }, [user?.token]);

  const filteredBookings = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesSearch = normalizedSearch
        ? `${booking.tour_name || ''} ${booking.customer_name || ''} ${booking.email || ''}`
            .toLowerCase()
            .includes(normalizedSearch)
        : true;
      const matchesStatus = statusFilter
        ? formatBookingStatus(booking.status) === statusFilter
        : true;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const hasBookings = filteredBookings.length > 0;

  return (
    <div className="booking-tour-container">
      <h2>Booking Tour Management</h2>

      <div className="partner-filter">
        <input
          type="text"
          placeholder="Find by tour, customer, email..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">All status</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {loading ? <p>Loading bookings...</p> : null}
      {errorMessage ? <p>{errorMessage}</p> : null}

      {!loading && !errorMessage ? (
        <table className="booking-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tour Name</th>
              <th>Customer</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Booking Date</th>
            </tr>
          </thead>
          <tbody>
            {!hasBookings ? (
              <tr>
                <td colSpan="6">No bookings found.</td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr key={booking.booking_id}>
                  <td>{booking.booking_id}</td>
                  <td>{booking.tour_name || `Tour #${booking.tour_id}`}</td>
                  <td>{booking.customer_name || booking.email || `User #${booking.user_id}`}</td>
                  <td>${Number(booking.total_price || 0).toFixed(2)}</td>
                  <td>
                    <span className={`status ${String(booking.status || 'pending').toLowerCase()}`}>
                      {formatBookingStatus(booking.status)}
                    </span>
                  </td>
                  <td>{formatBookingDate(booking.booking_date || booking.start_date)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      ) : null}
    </div>
  );
};

export default BookingTour;
