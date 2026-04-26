require("dotenv").config();
const express = require("express");
const cors = require("cors");

const bookingRoutes = require("./src/routes/bookingRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const invoiceRoutes = require("./src/routes/invoiceRoutes");
const db = require("./src/config/db");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
db.query("SELECT 1 AS ok", (err) => {
if (err) {
return res.status(500).json({
status: "unhealthy",
service: "booking-billing",
timestamp: new Date().toISOString(),
error: "database_unavailable",
});
}

res.status(200).json({
status: "healthy",
service: "booking-billing",
timestamp: new Date().toISOString(),
});
});
});

app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/invoices", invoiceRoutes);

app.use((req, res) => {
res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
console.error(err);
res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
console.log("Booking Billing Service is running on port " + PORT);
});