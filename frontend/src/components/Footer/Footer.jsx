import React from 'react'
import { assets } from '../../assets/assets';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-wrapper">
     <div className="footer-inner">
      {/* TOP GRID */}
      <div className="footer-grid">

        {/* NORTH */}
        <div className="footer-col">
          <h4>North Vietnam</h4>
          <ul>
            <li>Hanoi</li>
            <li>Sapa</li>
            <li>Ha Giang</li>
            <li>Ninh Binh</li>
            <li>Ha Long Bay</li>
            <li>Cao Bang</li>
            <li>Lao Cai</li>
          </ul>
        </div>

        {/* CENTRAL */}
        <div className="footer-col">
          <h4>Central Vietnam</h4>
          <ul>
            <li>Da Nang</li>
            <li>Hue</li>
            <li>Quang Binh</li>
            <li>Hoi An</li>
            <li>Binh Dinh</li>
            <li>Quy Nhon</li>
            <li>Kon Tum</li>
          </ul>
        </div>

        {/* SOUTH */}
        <div className="footer-col">
          <h4>South Vietnam</h4>
          <ul>
            <li>Ho Chi Minh City</li>
            <li>Can Tho</li>
            <li>Vinh Long</li>
            <li>Ca Mau</li>
            <li>Phu Quoc</li>
            <li>Ben Tre</li>
            <li>Dong Thap</li>
          </ul>
        </div>

        {/* CONTACT */}
        <div className="footer-col">
          <h4>Contact</h4>
          <p>190 Han Thuyen, District,<br />Thu Duc City, Vietnam</p>

          <p><strong>Hotline:</strong> 1800 646 888</p>
          <p><strong>Phone:</strong> (+84 28) 3822 8898</p>
          <p><strong>Email:</strong> info@agritour.com</p>

          <div className="footer-socials">
            <i className="fa-brands fa-facebook"></i>
            <i className="fa-brands fa-instagram"></i>
            <i className="fa-brands fa-youtube"></i>
            <i className="fa-brands fa-tiktok"></i>
            <i className="fa-brands fa-twitter"></i>
          </div>
        </div>

        {/* INFORMATION */}
        <div className="footer-col">
          <h4>Information</h4>
          <ul>
            <li>Visa success rate</li>
            <li>Travel magazine</li>
            <li>News</li>
            <li>Sitemap</li>
            <li>Help Center</li>
            <li>Privacy Policy</li>
            <li>Terms of Use</li>
            <li>Data Protection Policy</li>
          </ul>
        </div>

      </div>

     
          <div className="footer-middle">

  {/* COLUMN 1 — MOBILE APP */}
  <div className="footer-col-box">
    <h4 className="footer-title">Mobile App</h4>

    <div className="app-grid">
      <div className="app-item">
        <img src={assets.ggstore} alt="Google Play" className="footer-app-1" />
        <img src={assets.qr1} alt="QR code for Google Play download" className="footer-qr" />
      </div>

      <div className="app-item">
        <img src={assets.appstore} alt="App Store" className="footer-app-2" />
        <img src={assets.qr2} alt="QR code for App Store download" className="footer-qr" />
      </div>
    </div>
  </div>

  {/* COLUMN 2 — CERTIFICATION */}
  <div className="footer-col-box">
    <h4 className="footer-title">Certifications</h4>

    <div className="cert-grid">
      <img src={assets.certification} alt="Business certification" className="cert-logo-1" />
      <img src={assets.dmca} alt="DMCA protection" className="cert-logo-2" />
    </div>
  </div>

  {/* COLUMN 3 — PAYMENT METHODS */}
  <div className="footer-col-box">
    <h4 className="footer-title">Payment Methods</h4>

    <div className="payment-grid">
      <img src={assets.visa} alt="Visa" />
      <img src={assets.mastercard} alt="Mastercard" />
      <img src={assets.vnpay} alt="VNPay" />
      <img src={assets.momo} alt="MoMo" />
      <img src={assets.zalopay} alt="ZaloPay" />
      <img src={assets.shoppee_pay} alt="ShopeePay" />
    </div>
  </div>

</div>

      <p className="footer-copy">
        © 2025 Agritour. All rights reserved.
      </p>
    </div>
   </footer>
  )
}

export default Footer;
