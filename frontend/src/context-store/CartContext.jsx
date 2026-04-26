import PropTypes from "prop-types";
import { createContext, useContext, useMemo, useState } from "react";

//  Tạo context đúng cách
const CartContext = createContext();

//  Provider bọc toàn bộ app
export const CartProvider = ({ children }) => {
  const [pendingBookings, setPendingBookings] = useState([]);

  const addBookingToCart = (booking) => {
    setPendingBookings((prev) => [...prev, booking]);
  };

  const removeBooking = (id) => {
    setPendingBookings((prev) => prev.filter((b) => b.tempId !== id));
  };

  const contextValue = useMemo(
    () => ({ pendingBookings, addBookingToCart, removeBooking }),
    [pendingBookings]
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

//  Hook lấy dữ liệu trong context
export const useCart = () => useContext(CartContext);
