import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { parsePrice, formatPrice, calcPriceFromBase } from "../../components/Utils/priceUtils";
import './BookPage.css';
import { resolveAssetUrl, tourService } from "../../services/api";

const BookPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- ALL HOOKS MUST ALWAYS RUN ---
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);

  const [qtyAdult, setQtyAdult] = useState("1");
  const [qtyChild, setQtyChild] = useState("0");
  const [qtySmallChild, setQtySmallChild] = useState("0");
  const [qtyInfant, setQtyInfant] = useState("0");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const formatDate = (dateStr) => {
    if (!dateStr) return "Updating...";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB"); // DD/MM/YYYY
  };

  // --- FETCH TOUR ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`${tourService.apiUrl}/tours/${id}`);
        const data = await res.json();
        if (data?.tour_id) {
          const fixedImage = resolveAssetUrl(tourService.baseUrl, data.image_url);

          setTour({
            id: data.tour_id,
            tour_name: data.tour_name,
            image_url: fixedImage,
            start_date: data.start_date,
            end_date: data.end_date,
            period: data.period || "Updating...",
            price: data.price
          });
        } else {
          setTour(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // --- PRICE CALCULATE ALWAYS SAFE ---
  const basePriceRaw = parsePrice(tour?.price || 0);

  const priceTable = useMemo(() => {
    if (!tour) return { adult: 0, child: 0, smallChild: 0, infant: 0 };
    return calcPriceFromBase(basePriceRaw);
  }, [tour, basePriceRaw]);

  // Convert input string → int
  const iAdult = Number.parseInt(qtyAdult || "0", 10);
  const iChild = Number.parseInt(qtyChild || "0", 10);
  const iSmall = Number.parseInt(qtySmallChild || "0", 10);
  const iInfant = Number.parseInt(qtyInfant || "0", 10);

  const subtotalPeople =
    iAdult * priceTable.adult +
    iChild * priceTable.child +
    iSmall * priceTable.smallChild +
    iInfant * priceTable.infant;

  const grandTotal = subtotalPeople;

  // New input clamp
  const clampInt = (value, min = 0) => {
    if (value === "") return "";
    const parsedValue = Number.parseInt(value, 10);
    if (Number.isNaN(parsedValue)) return "";
    return String(Math.max(parsedValue, min));
  };

  // --- AFTER ALL HOOKS → RETURN UI CONDITIONS ---
  if (loading) return <h2 style={{ textAlign: "center", marginTop: 60 }}>Loading...</h2>;
  if (!tour) return <h2 style={{ textAlign: "center", marginTop: 60 }}>Tour not found</h2>;

  // --- MAIN UI ---
  return (
    <div className="book-tour-container">

      {/* HEADER */}
      <div className="tour-header-wrapper">
        <div className="tour-header-image">
          <img src={tour.image_url} alt={tour.tour_name} />
        </div>

        <div className="tour-header-info">
          <h1 className="tour-title">{tour.tour_name}</h1>

          <div className="info-grid">
            <p><span>Tour ID:</span> {tour.id}</p>
            <p><span>Price:</span> {formatPrice(basePriceRaw)} / person</p>
            <p><span>Start Date:</span> {formatDate(tour.start_date)}</p>
            <p><span>End Date:</span> {formatDate(tour.end_date)}</p>
          </div>
        </div>
      </div>

      {/* PASSENGERS */}
      <h2 className="section-title">PASSENGER INFORMATION</h2>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="qty-adult">Adults</label>
          <input
            id="qty-adult"
            type="number"
            min="1"
            value={qtyAdult}
            onChange={(e) => setQtyAdult(clampInt(e.target.value, 1))}
          />
        </div>

        <div className="form-group">
          <label htmlFor="qty-child">Children (5–11y)</label>
          <input
            id="qty-child"
            type="number"
            min="0"
            value={qtyChild}
            onChange={(e) => setQtyChild(clampInt(e.target.value, 0))}
          />
        </div>

        <div className="form-group">
          <label htmlFor="qty-small-child">Small Children (2–5y)</label>
          <input
            id="qty-small-child"
            type="number"
            min="0"
            value={qtySmallChild}
            onChange={(e) => setQtySmallChild(clampInt(e.target.value, 0))}
          />
        </div>

        <div className="form-group">
          <label htmlFor="qty-infant">Infants (&lt;2y)</label>
          <input
            id="qty-infant"
            type="number"
            min="0"
            value={qtyInfant}
            onChange={(e) => setQtyInfant(clampInt(e.target.value, 0))}
          />
        </div>
      </div>

      {/* DETAILED TOUR PRICING */}
      <h2 className="section-title">DETAILED TOUR PRICING</h2>

      <table className="price-table">
        <thead>
          <tr>
            <th>Price Type / Age</th>
            <th>Adult (&gt;= 11y)</th>
            <th>Child (5–11y)</th>
            <th>Small Child (2–5y)</th>
            <th>Infant (&lt;2y)</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Price</td>
            <td>{formatPrice(priceTable.adult)}</td>
            <td>{formatPrice(priceTable.child)}</td>
            <td>{formatPrice(priceTable.smallChild)}</td>
            <td>{formatPrice(priceTable.infant)}</td>
          </tr>

          <tr>
            <td>Notes</td>
            <td>Standard price</td>
            <td>60% of adult price</td>
            <td>30% of adult price</td>
            <td>Free (must travel with an adult)</td>
          </tr>
        </tbody>
      </table>

      {/* CUSTOMER FORM */}
      <h2 className="section-title">CUSTOMER INFORMATION</h2>

      <div className="customer-form">
        <input placeholder="Full Name *" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <input placeholder="Email *" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Phone Number *" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input placeholder="Address *" value={address} onChange={(e) => setAddress(e.target.value)} />
        <textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      {/* TOTAL */}
      <div className="total-section">
        <span>Total Amount: </span>
        <b className="total-price">{formatPrice(grandTotal)}</b>
      </div>

      {/* CONFIRM */}
      <button
        className="confirm-btn"
        onClick={() => {
          const bookingState = {
            tempId: Date.now(),
            tour,
            customer: { fullName, email, phone, address, notes },
            passengers: {
              adults: iAdult,
              children: iChild,
              smallChildren: iSmall,
              infants: iInfant
            },
            paymentMethod: "cash",
            totalAmount: grandTotal
          };
          navigate("/confirm-booking", { state: bookingState });
        }}>
        COMPLETE BOOKING
      </button>

    </div>
  );
};

export default BookPage;
