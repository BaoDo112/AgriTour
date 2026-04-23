import React, { useState } from 'react'
import './Header.css'
import { Link } from 'react-router-dom';
const Header = () => {
  const images = ['/banner1.jpg', '/header.jpg', '/banner2.jpg'];

   const [currentImage, setCurrentImage] = useState(0);

  const handleNext = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDotClick = (index) => {
    setCurrentImage(index);
  };

  return (
    <div className='header'  style={{
        backgroundImage: `url(${images[currentImage]})`
      }}>
      <div className="header-overlay"></div>
      <div className="header-contents">
        <h2>Find your interesting trip here </h2>
        <p>
          Let's explore and select which places that you wanted to enjoy the natural lifestyle. In additionally, give yourself a chance to move out side the bustle and clustle city to dive into the fresh and peacefull atmostphere in rural.
        </p>
        <Link to="/tour" className="explore-tour-button">
          Explore Tour
        </Link>
 
      </div>
       <button className="nav-btn prev" onClick={handlePrev}>❮</button>
       <button className="nav-btn next" onClick={handleNext}>❯</button>

      {/* Các chấm điều hướng */}
      <div className="dots-container">
        {images.map((image, index) => (
          <button
            type="button"
            key={image}
            className={`dot ${currentImage === index ? 'active' : ''}`}
            onClick={() => handleDotClick(index)}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default Header
