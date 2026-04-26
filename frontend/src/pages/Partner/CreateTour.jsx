import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context-store/AuthContext";
import { tourService } from "../../services/api";
import "./PartnerTours.css";

const CreateTour = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tour_name: "",
    description: "",
    location: "",
    region_id: "",
    category_id: "",
    start_date: "",
    end_date: "",
    price: "",
    available_slots: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImage(null);
      setPreview(null);
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Vui lòng đăng nhập trước!");
      return;
    }

    if (!form.tour_name || !form.location || !form.price) {
      alert("Vui lòng điền tối thiểu tên tour, địa điểm và giá.");
      return;
    }

    const formData = new FormData();
    Object.keys(form).forEach((key) => formData.append(key, form[key]));
    if (image) formData.append("image", image);
    formData.append("created_by", user.user_id);
    formData.append("role", user.role);

    try {
      setLoading(true);
      const res = await fetch(`${tourService.apiUrl}/tours`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Tạo tour thành công!");
        navigate("/partner/tours");
      } else {
        alert(data.message || "Lỗi khi tạo tour");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi server");
    }

    setLoading(false);
  };

  return (
    <div className="create-tour">
      <div className="create-inner">
        <h1>Create New Tour</h1>

        <form className="tour-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="tour-name">Tour name</label>
            <input id="tour-name" type="text" name="tour_name" placeholder="Ex: Discover Hoi An" value={form.tour_name} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <label htmlFor="tour-description">Description</label>
            <textarea id="tour-description" name="description" placeholder="Short description" value={form.description} onChange={handleChange} rows={4} />
          </div>

          <div className="form-grid">
            <div className="form-col">
              <label htmlFor="tour-location">Location</label>
              <input id="tour-location" type="text" name="location" placeholder="City / Province" value={form.location} onChange={handleChange} required />
            </div>

            <div className="form-col">
              <label htmlFor="tour-region-id">Region ID</label>
              <input id="tour-region-id" type="number" name="region_id" placeholder="1" value={form.region_id} onChange={handleChange} />
            </div>

            <div className="form-col">
              <label htmlFor="tour-category-id">Category ID</label>
              <input id="tour-category-id" type="number" name="category_id" placeholder="1" value={form.category_id} onChange={handleChange} />
            </div>

            <div className="form-col">
              <label htmlFor="tour-available-slots">Available slots</label>
              <input id="tour-available-slots" type="number" name="available_slots" placeholder="10" value={form.available_slots} onChange={handleChange} />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-col">
              <label htmlFor="tour-start-date">Start Date</label>
              <input id="tour-start-date" type="date" name="start_date" value={form.start_date} onChange={handleChange} />
            </div>
            <div className="form-col">
              <label htmlFor="tour-end-date">End Date</label>
              <input id="tour-end-date" type="date" name="end_date" value={form.end_date} onChange={handleChange} />
            </div>
            <div className="form-col">
              <label htmlFor="tour-price">Price (USD)</label>
              <input id="tour-price" type="number" name="price" placeholder="0.00" value={form.price} onChange={handleChange} />
            </div>
            <div className="form-col file-col">
              <label htmlFor="tour-image">Image</label>
              <input id="tour-image" type="file" accept="image/*" onChange={handleImage} />
            </div>
          </div>

          {preview && (
            <div className="image-preview">
              <img src={preview} alt="preview" />
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn cancel" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? "Creating..." : "Create Tour"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTour;
