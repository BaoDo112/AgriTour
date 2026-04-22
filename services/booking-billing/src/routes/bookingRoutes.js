const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");


/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: API for managing tour bookings
 */
router.post("/", bookingController.createBooking);


/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               tour_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               total_price:
 *                 type: number
 *               status:
 *                 type: string
 *             required:
 *               - user_id
 *               - tour_id
 *               - quantity
 *               - total_price
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Bad request
 */
router.get("/user/:user_id", bookingController.getBookingsByUser);

/**
 * @swagger
 * /api/bookings/user/{user_id}:
 *   get:
 *     summary: Get all bookings of a specific user
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: List of bookings
 *       404:
 *         description: User not found or no bookings
 */
router.put("/:booking_id", bookingController.updateBooking);

/**
 * @swagger
 * /api/bookings/{booking_id}:
 *   delete:
 *     summary: Delete a booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: booking_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the booking
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 *       404:
 *         description: Booking not found
 */
router.delete("/:booking_id", bookingController.deleteBooking);

module.exports = router;
