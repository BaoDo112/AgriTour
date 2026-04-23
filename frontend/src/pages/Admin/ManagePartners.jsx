
import React, { useState , useEffect, useRef} from 'react';
import './Admin.css';


//dữ liệu giả đổ vào để test giao diện 
const mockPartners = [
  {
    id: 1,
    name: "Nguyen Van A",
    email: "partnerA@agrifarm.vn",
    location: "Da Lat",
    farm: "Farm A",
    publishedTours: 3,
    totalBookings: 42,
  },
  {
    id: 2,
    name: "Tran Thi B",
    email: "partnerB@agrifarm.vn",
    location: "Ben Tre",
    farm: "Farm B",
    publishedTours: 5,
    totalBookings: 68,
  },
  {
    id: 3,
    name: "Le Van C",
    email: "partnerC@agrifarm.vn",
    location: "Gia Lai",
    farm: "Farm C",
    publishedTours: 2,
    totalBookings: 19,
  },
];

const ManagePartners = () => {
  //dùng để filter
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [minTours, setMinTours] = useState('');
  const [minBookings, setMinBookings] = useState('');

  const [openId, setOpenId] = useState(null);
  const menuRef = useRef();

  const handleToggleMenu = (id) => {
    setOpenId(openId === id ? null : id);
  };

  const handleEdit = (id) => alert(`Edit partner ID: ${id}`);
  const handleDelete = (id) => {
    if (window.confirm("Are you sure to delete?")) {
      alert(`Deleted partner ID: ${id}`);
    }
  };
  const handleLockToggle = (partner) => {
    const action = partner.locked ? "Unlock" : "Lock";
    alert(`${action} partner ID: ${partner.id}`);
  };

   useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

   
  //dùng để filter
  const filteredPartners = mockPartners.filter((partner) => {
  const matchesSearch = `${partner.name} ${partner.email}`
    .toLowerCase()
    .includes(searchTerm.toLowerCase());

  const matchesLocation = locationFilter ? partner.location === locationFilter : true;
  const matchesTours = minTours ? partner.publishedTours >= parseInt(minTours) : true;
  const matchesBookings = minBookings ? partner.totalBookings >= parseInt(minBookings) : true;

  return matchesSearch && matchesLocation && matchesTours && matchesBookings;
  });


  return (
    <div className="booking-tour-container">
      <h2>Partner Management</h2>
      <div className="partner-filter">
  <input
    type="text"
    placeholder="Find by name,..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />

  <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
    <option value="">All location</option>
    <option value="Đà Lạt">Da Lat</option>
    <option value="Bến Tre">Ben Tre</option>
    <option value="Gia Lai">Gia Lai</option>
  </select>

  <input
    type="number"
    placeholder="Tours published min"
    value={minTours}
    onChange={(e) => setMinTours(e.target.value)}
  />

  <input
    type="number"
    placeholder="Tour bookings min"
    value={minBookings}
    onChange={(e) => setMinBookings(e.target.value)}
  />
</div>

      <table className="booking-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Partner Name</th>
            <th>Email</th>
            <th>Location</th>
            <th>Farm</th>
            <th>Published Tours</th>
            <th>Total Bookings</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPartners.map((partner) => (
            <tr key={partner.id}>
              <td>{partner.id}</td>
              <td>{partner.name}</td>
              <td>{partner.email}</td>
              <td>{partner.location}</td>
              <td>{partner.farm}</td>
              <td>{partner.publishedTours}</td>
              <td>{partner.totalBookings}</td>
              <td>
                <div className="action-menu" ref={menuRef}>
                  <button className="menu-toggle" onClick={() => handleToggleMenu(partner.id)}>⋮</button>
                  {openId === partner.id && (
                    <div className="menu-dropdown">
                      <p onClick={() => handleEdit(partner.id)}>Edit</p>
                      <p onClick={() => handleDelete(partner.id)}>Delete</p>
                      <p onClick={() => handleLockToggle(partner)}>
                        {partner.locked ? "Unlock" : "Lock"}
                      </p>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  )
}

export default ManagePartners
