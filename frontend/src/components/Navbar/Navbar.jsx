import React, { useState } from 'react'
import PropTypes from 'prop-types'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context-store/CartContext';
import { useAuth } from '../../context-store/AuthContext';
import Cart from '../../pages/Cart/Cart';
import SearchModal from '../SearchModal/SearchModal';

const getUserIcon = (user) => {
  if (user.role === 'admin') return assets.admin_icon;
  if (user.role === 'partner') return assets.partner_icon || assets.user_icon;
  return assets.user_icon;
};

const getUserLabel = (user) => {
  if (user.role === 'admin') return `Admin: ${user.full_name}`;
  if (user.role === 'partner') return `Partner: ${user.full_name}`;
  return user.full_name || user.email;
};

const Navbar = ({ setShowLogin }) => {
  const { user, logout } = useAuth();
  const [menu, setMenu] = useState("home");
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const { pendingBookings } = useCart();

  const handleLogout = () => {
    logout();
    setShowMenu(false);
    alert("You have logged out successfully");
  };



  return (
    <>
    {showCart && <Cart onClose={() => setShowCart(false)} />}
    {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}

    <div className='navbar'>
      <Link to='/'><img src={assets.logo_agritour} alt="AgriTour logo" className="logo"/></Link>
      <ul className="navbar-menu">
        <li className={menu === "home" ? "active" : ""}>
          <Link to="/" onClick={() => setMenu("home")}>Home</Link>
        </li>
        <li className={menu === "tour" ? "active" : ""}>
          <Link to="/tour" onClick={() => setMenu("tour")}>Tour</Link>
        </li>
        <li className={menu === "news" ? "active" : ""}>
          <Link to="/news" onClick={() => setMenu("news")}>News</Link>
        </li>

        <li className={menu === "contact" ? "active" : ""}>
          <Link to="/contact" onClick={() => setMenu("contact")}>Contact</Link>
        </li>

      </ul>
      <div className="navbar-right">
         <button
           type="button"
           className="navbar-icon-button"
           onClick={() => setShowSearch(true)}
           aria-label="Open search"
         >
           <img 
             src={assets.search_icon} 
             alt="Search"
             className="search-icon-logo"
           />
         </button>

        <button type="button" className="navbar-search-icon navbar-icon-button" onClick={() => setShowCart(true)} aria-label="Open cart">
         <img src={assets.basket_icon} alt="Cart" className="basket-icon" />

           {pendingBookings.length > 0 && (
             <span className="cart-badge">{pendingBookings.length}</span>
           )}
           <div className="dot"></div>
        </button>

        {user ? (
          <div className="navbar-user-info">
            <button
              type="button"
              className="user-display"
              onClick={() => setShowMenu((prev) => !prev)}
              aria-expanded={showMenu}
              aria-haspopup="menu"
            >
              <img
                src={getUserIcon(user)}
                alt="User avatar"
                className="user-icon"
              />
              <span>{getUserLabel(user)}</span>
            </button>

            {showMenu && (
              <div className="user-dropdown" role="menu">
                <button type="button" className="user-dropdown-item" onClick={() => navigate('/user/panel')}>
                  User Panel
                </button>

                {user.role === 'admin' && (
                  <button type="button" className="user-dropdown-item" onClick={() => navigate('/admin/dashboard')}>
                    Admin Panel
                  </button>
                )}

                {user.role === 'partner' && (
                  <button type="button" className="user-dropdown-item" onClick={() => navigate('/partner/dashboard')}>
                    Partner Panel
                  </button>
                )}

                <button type="button" className="user-dropdown-item" onClick={() => alert(`User: ${user.full_name}`)}>
                  Personal information
                </button>

                <button type="button" className="user-dropdown-item" onClick={handleLogout}>
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button type="button" onClick={() => setShowLogin(true)}>Sign in</button>
        )}
      </div>
      
    </div>
  </>
  )
}


Navbar.propTypes = {
  setShowLogin: PropTypes.func.isRequired,
}


export default Navbar;