import React, { useState } from 'react';
import './Admin.css';
import { list_tour_1 } from '../../assets/assets';
const BookingTour = () => {
   
  const bookings = list_tour_1.map((tour, index) => ({
  id: index + 1,
  tourName: tour.tour_name,
  status: index % 3 === 0 ? "Confirmed" : index % 3 === 1 ? "Pending" : "Cancelled",
  date: tour.start_date,
  customerCount: Math.floor(Math.random() * 20) + 10,
  partnerName: tour.partner_name || ["Nguyen Van A", "Tran Thi B", "Le Van C"][index % 3],
}));
   

  //filter để filter dữ liệu 
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [partnerFilter, setPartnerFilter] = useState('');
  const filteredBookings = bookings.filter((booking) => {
  const matchesSearch = booking.tourName.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesStatus = statusFilter ? booking.status === statusFilter : true;
  const matchesPartner = partnerFilter
    ? booking.partnerName.toLowerCase().includes(partnerFilter.toLowerCase())
    : true;

  return matchesSearch && matchesStatus && matchesPartner;
  });


  return (
    <div className="booking-tour-container">
      <h2>Booking Tour Management</h2>
      <div className="partner-filter">
  <input
    type="text"
    placeholder="Find by name..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />

  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
    <option value="">All status</option>
    <option value="Confirmed">Confirmed</option>
    <option value="Pending">Pending</option>
    <option value="Cancelled">Cancelled</option>
  </select>

  <input
    type="text"
    placeholder="Find by partner..."
    value={partnerFilter}
    onChange={(e) => setPartnerFilter(e.target.value)}
  />
</div>

      <table className="booking-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tour Name</th>
            <th>Customers</th>
            <th>Status</th>
            <th>Date</th>
            <th>Partner</th>
          </tr>
        </thead>
        <tbody>
           {filteredBookings.map((booking) => (
  <tr key={booking.id}>
    <td>{booking.id}</td>
    <td>{booking.tourName}</td>
    <td>{booking.customerCount}</td>
    <td>
      <span className={`status ${booking.status.toLowerCase().replace(" ", "-")}`}>
        {booking.status}
      </span>
    </td>
    <td>{booking.date}</td>
    <td>{booking.partnerName}</td>
  </tr>
))}

        </tbody>
      </table>
    </div>
  )
}

export default BookingTour
