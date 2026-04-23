import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context-store/AuthContext";
import LoginPopup from "../../components/LoginPopup/LoginPopup";
import { resolveAssetUrl, tourService } from "../../services/api";

import "./TourDetail.css";
import dak1 from "../../assets/dak1.jpg";
import dak12 from "../../assets/dak12.jpg";
import dak21 from "../../assets/dak21.jpg";
import dak22 from "../../assets/dak22.jpg";
import dak31 from "../../assets/dak31.jpg";
import dak32 from "../../assets/dak32.jpg";
import dak41 from "../../assets/dak41.jpg";
import dak42 from "../../assets/dak42.jpg";
import dak51 from "../../assets/dak51.jpg";
import dak52 from "../../assets/dak52.jpg";
import vinhlong11 from "../../assets/vinhlong11.jpg";
import vinhlong12 from "../../assets/vinhlong12.jpg";
import vinhlong21 from "../../assets/vinhlong21.webp";
import vinhlong22 from "../../assets/vinhlong22.jpg";

const calcPeriod = (start, end) => {
  if (!start || !end) return "Updating...";
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.ceil((e - s) / (1000 * 3600 * 24));
  return `${diff} days`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "Updating...";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB");
};

const TourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const loadTour = async () => {
      try {
        const res = await fetch(`${tourService.apiUrl}/tours/${id}`);
        const data = await res.json();

        if (!data || !data.tour_id) {
          setTour(null);
        } else {
          setTour({
            id: data.tour_id,
            tour_name: data.tour_name,
            image_url: resolveAssetUrl(tourService.baseUrl, data.image_url) || "/fallback.jpg",
            description: data.description || "No description available.",
            location: data.location || "Updating...",
            start_date: formatDate(data.start_date),
            end_date: formatDate(data.end_date),
            period: calcPeriod(data.start_date, data.end_date),
            price: `$${Number(data.price).toLocaleString()}`,
            available_slots: data.available_slots,
          });
        }
      } catch (err) {
        console.error("Error fetching tour:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTour();
  }, [id]);

  if (loading)
    return <h2 style={{ textAlign: "center", marginTop: 50 }}>Loading...</h2>;

  if (!tour)
    return <h2 style={{ textAlign: "center", marginTop: 50 }}>Tour not found</h2>;

  const handleBookClick = () => {
    if (!user) {
      setShowLogin(true);
    } else {
      navigate(`/book-tour/${tour.id}`);
    }
  };

  return (
    <div className="tour-detail-container">
      <h1 className="tour-detail-title">{tour.tour_name}</h1>

      <div className="tour-detail-content">
        {/* LEFT */}
        <div className="tour-detail-left">
          <img
            src={tour.image_url}
            alt={tour.tour_name}
            className="tour-detail-image"
            onError={(e) => (e.target.src = "/fallback.jpg")}
          />


          {/* STATIC HIGHLIGHTS */}
          <div className="tour-highlight-section">
            <h2>Journey Highlights</h2>

            {Number(id) === 38 ? (
              <>
                {/* --- THÔNG TIN RIÊNG CHO TOUR  --- */}
                <div className="tour-highlight-table">
                  <p><strong>Route:</strong> Ho Chi Minh → Vinh long</p>
                  <p><strong>Duration:</strong> 3 days 2 nights</p>
                  <p><strong>Transport:</strong> Bus</p>
                </div>

                <p className="tour-detail-description">
                  Discover the peaceful farm life of Vĩnh Long in this 2-day tour from Ho Chi Minh City. 
                  You will visit local farms, pick fresh tropical fruits, and join farmers in harvesting lotus. 
                  A simple and relaxing trip to experience the true beauty of the Mekong countryside.
                </p>
              </>
            ) : (
              <>
                {/* --- THÔNG TIN CHUNG CHO TẤT CẢ TOUR KHÁC --- */}
                <div className="tour-highlight-table">
                  <p><strong>Route:</strong> Ho Chi Minh City → Daklak</p>
                  <p><strong>Duration:</strong> 5 days 4 nights</p>
                  <p><strong>Transport:</strong> Tourist Bus or Personal Vehicle</p>
                </div>

                <p className="tour-detail-description">
                  Experience the real agricultural life of Đak Lak in this 5-day tour.
                  You will discover coffee farms, learn local traditions, join hands-on farming activities,
                  and enjoy peaceful nature in the Central Highlands.
                </p>
              </>
            )}
          </div>

          {/* ITINERARY */}
          <div className="tour-itinerary-section">
            <h2>Detailed Itinerary</h2>

            {Number(id) === 38 ? (
              <>
                {/*  ITINERARY RIÊNG CHO TOUR  */}

                {/* DAY 1 */}
                <div className="itinerary-day">
                  <h3>DAY 1 | Visit Local Farms & Pick Fresh Fruits</h3>
                  <p>Depart from Ho Chi Minh City and travel to Vinh Long.</p>
                  <p>Visit local farms in the Mekong Delta and walk through fruit gardens.</p>
                  <p>Guests can pick fresh seasonal fruits and enjoy the peaceful countryside.</p>
                  <p>Lunch and dinner included.</p>
                  <div className="itinerary-images">
                    <img src={vinhlong11} alt="Day 1" />
                    <img src={vinhlong12} alt="Day 1" />
                  </div>
                </div>

                {/* DAY 2 */}
                <div className="itinerary-day">
                  <h3>DAY 2 | Help Farmers Harvest Lotus</h3>
                  <p>In the morning, join local farmers in a lotus field and learn how to pick lotus seeds and flowers.</p>
                  <p>This is a relaxing and fun activity that shows the real farming life in Vinh Long.</p>
                  <p>After lunch, return to Ho Chi Minh City.</p>
                  <div className="itinerary-images">
                    <img src={vinhlong21} alt="Day 2" />
                    <img src={vinhlong22} alt="Day 2" />
                  </div>
                </div>

    

              </>
            ) : (
              <>
                {/*  ITINERARY MẶC ĐỊNH CHO CÁC TOUR KHÁC */}

                {/* DAY 1 */}
                <div className="itinerary-day">
                  <h3>DAY 1 | From City to the Farm</h3>
                  <p>Guests travel from the city to the farm in Dak Lak.</p>
                  <p>Check in, rest, and enjoy a welcome dinner. (No breakfast/lunch on this day.)</p>
                  <div className="itinerary-images">
                    <img src={dak1} alt="Day 1" />
                    <img src={dak12} alt="Day 1" />
                  </div>
                </div>

                {/* DAY 2 */}
                <div className="itinerary-day">
                  <h3>DAY 2 | Coffee Harvesting</h3>
                  <p>Have breakfast at the farm.</p>
                  <p>Join local farmers to pick ripe coffee cherries and learn how coffee is grown.</p>
                  <p>Lunch and dinner included.</p>
                  <div className="itinerary-images">
                    <img src={dak21} alt="Day 2" />
                    <img src={dak22} alt="Day 2" />
                  </div>
                </div>

                {/* DAY 3 */}
                <div className="itinerary-day">
                  <h3>DAY 3 | Gong Music & Forest Vegetables.</h3>
                  <p>Morning: Learn basic Gong music with local people.</p>
                  <p>Afternoon: Go to the forest to pick wild vegetables.</p>
                  <p>Evening: Cook and enjoy a simple local meal using the vegetables you collected</p>
                  <p>All meals included.</p>
                  <div className="itinerary-images">
                    <img src={dak31} alt="Day 3" />
                    <img src={dak32} alt="Day 3" />
                  </div>
                </div>

                {/* DAY 4 */}
                <div className="itinerary-day">
                  <h3>DAY 4 | Hiking on Coffee Hills</h3>
                  <p>Enjoy breakfast, then take a hike through beautiful coffee hills.</p>
                  <p>Lunch and dinner included.</p>
                  <div className="itinerary-images">
                    <img src={dak41} alt="Day 4" />
                    <img src={dak42} alt="Day 4" />
                  </div>
                </div>

                {/* DAY 5 */}
                <div className="itinerary-day">
                  <h3>DAY 5 | Coffee Drying Process</h3>
                  <p>Learn how farmers dry and process coffee beans under the sun.</p>
                  <p>Breakfast and lunch included.</p>
                  <p>After that, return to the city.</p>
                  <div className="itinerary-images">
                    <img src={dak51} alt="Day 5" />
                    <img src={dak52} alt="Day 5" />
                  </div>
                </div>
              </>
            )}
          </div>

        </div>


        {/* RIGHT */}
        <div className="tour-detail-right">
          <div className="tour-info-wrapper">
            <h2>{tour.tour_name}</h2>

            <div className="tour-info-row"><b>Tour ID:</b> <span>{tour.id}</span></div>
            <div className="tour-info-row"><b>Duration:</b> <span>{tour.period}</span></div>
            <div className="tour-info-row"><b>Start:</b> <span>{tour.start_date}</span></div>
            <div className="tour-info-row"><b>End:</b> <span>{tour.end_date}</span></div>
            <div className="tour-info-row"><b>Location:</b> <span>{tour.location}</span></div>
          </div>

          <div className="price-box">
            <span>Price:</span>
            <div className="price-value">{tour.price}</div>
          </div>

          <button className="book-btn" onClick={handleBookClick}>
            BOOK TOUR NOW
          </button>
        </div>
      </div >

      {
        showLogin && (
          <LoginPopup
            setShowLogin={setShowLogin}
            onLoginSuccess={() => {
              navigate(`/book-tour/${tour.id}`);
            }}
          />
        )
      }
    </div >
  );
};

export default TourDetail;
