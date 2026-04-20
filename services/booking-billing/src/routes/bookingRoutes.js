const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

router.post("/", bookingController.createBooking);
router.get("/user/:user_id", bookingController.getBookingsByUser);
router.put("/:booking_id", bookingController.updateBooking);
router.delete("/:booking_id", bookingController.deleteBooking);

module.exports = router;