import PropTypes from "prop-types";
import { createContext, useContext, useMemo, useState } from "react";

const UserToursContext = createContext();

export const UserToursProvider = ({ children }) => {
  const [tours, setTours] = useState({
    upcoming: [],
    ongoing: [],
    completed: [],
    cancelled: []
  });

  const addUpcomingTour = (tourData) => {
    setTours((prev) => ({
      ...prev,
      upcoming: [...prev.upcoming, tourData]
    }));
  };

  const contextValue = useMemo(
    () => ({ tours, addUpcomingTour }),
    [tours]
  );

  return (
    <UserToursContext.Provider value={contextValue}>
      {children}
    </UserToursContext.Provider>
  );
};

UserToursProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useUserTours = () => useContext(UserToursContext);
