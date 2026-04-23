
import React, { useContext } from 'react';
import { StoreContext } from '../../context-store/StoreContext';
import './RegionSelector.css';
import { assets } from '../../assets/assets';
const RegionSelector = () => {
  const { region, setRegion } = useContext(StoreContext);

  const handleSelect = (value) => {
    if (region === value) {
      setRegion("All");
    } else {
      setRegion(value);
    }
  };

  return (
    
   

  <div className="region-field">
     
    <div className="region-buttons">
      <button
        className={`region-bg-btn ${region === 'North' ? 'active' : ''}`}
        onClick={() => handleSelect('North')}
        style={{ backgroundImage: `url(${assets.sapa})` }}
      >
        <span>North</span>
      </button>


      <button
        className={`region-bg-btn ${region === 'Central' ? 'active' : ''}`}
        onClick={() => handleSelect('Central')}
        style={{ backgroundImage: `url(${assets.river2})` }}
      >
        <span>Central</span>
      </button>

      <button
        className={`region-bg-btn ${region === 'South' ? 'active' : ''}`}
        onClick={() => handleSelect('South')}
        style={{ backgroundImage: `url(${assets.trip6})` }}
      >
        <span>South</span>
      </button>

    </div>
  </div>
  );
};

export default RegionSelector;
