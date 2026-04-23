import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import LoginPopup from './components/LoginPopup/LoginPopup';
import Tour from './pages/Tour/Tour';
import PartnerLayout from './pages/Partner/PartnerLayout';
import AdminLayout from './pages/Admin/AdminLayout';
import { AuthProvider, useAuth } from './context-store/AuthContext';
import Dashboard from './pages/Admin/Dashboard';
import BookingTour from './pages/Admin/BookingTour';
import BookPage from './pages/Booking/BookPage';
import ManageCustomers from './pages/Admin/ManageCustomers';
import ManageTours from './pages/Admin/ManageTours';
import Settings from './pages/Admin/Settings';
import ManagePartners from './pages/Admin/ManagePartners';
import TourDetail from './pages/Tour/TourDetail';
import ConfirmBookingPage from './pages/Booking/ConfirmBookingPage';
import {CartProvider} from './context-store/CartContext';
import UserPanel from './pages/User/UserPanel';
import { UserToursProvider } from './context-store/UserToursContext';
import TourInfoPage from './pages/User/TourInfoPage';
import News from './pages/News/News';
import Contact from './pages/Contact/Contact';
import Footer from './components/Footer/Footer';
const AppContent = () => {
  const { user, setUser } = useAuth();
  const [showLogin, setShowLogin] = React.useState(false);
  
  return (
    <>
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
      <div className="app">
        <Navbar setShowLogin={setShowLogin} user={user} setUser={setUser} />
        <div className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tour" element={<Tour />} />
          <Route path="/tour-details/:id" element={<TourDetail />} />
          <Route path="/book-tour/:id" element={<BookPage/>} />
          <Route path="/partner/*" element={<PartnerLayout user={user} />} />
          <Route path="/confirm-booking" element={<ConfirmBookingPage />} />
          <Route path="/user/panel" element={<UserPanel />} />
          <Route path="/tour-info" element={<TourInfoPage />} />
          <Route path="/news" element={<News />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<AdminLayout />}>
             <Route index element={<Dashboard />} /> {/* khi vào /admin tự vào dashboard */}
             <Route path="dashboard" element={<Dashboard />} />
             <Route path="tours" element={<ManageTours />} />
             <Route path="partners" element={<ManagePartners />} />
             <Route path="customers" element={<ManageCustomers />} />
             <Route path="bookings" element={<BookingTour />} />
             <Route path="settings" element={<Settings />} />
          </Route>

        </Routes>
        </div>
        <Footer />
      </div>
    </>
  );
};

const App = () => (
  <AuthProvider>
    <UserToursProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </UserToursProvider>
  </AuthProvider>
);

export default App;
