const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tourController");
const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads", "tours"));
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: Tours
 *   description: API for managing tours
 */




/**
 * @swagger
 * /api/tours/partner/{user_id}:
 *   get:
 *     summary: Get all tours created by a specific partner
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the partner (user_id)
 *     responses:
 *       200:
 *         description: List of tours created by the partner
 */
router.get("/partner/:user_id", tourController.getToursByPartner);


/**
 * @swagger
 * /api/tours/admin/all:
 *   get:
 *     summary: Get all tours for admin (including pending, rejected, approved)
 *     tags: [Tours]
 *     responses:
 *       200:
 *         description: List of all tours
 */
router.get("/admin/all", tourController.getAllToursForAdmin);


/**
 * @swagger
 * /api/tours/review/{tour_id}:
 *   put:
 *     summary: Approve or reject a tour
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: tour_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tour ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approved, rejected]
 *               note:
 *                 type: string
 *               admin_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Review result
 */
router.put("/review/:tour_id", tourController.reviewTour);

/**
 * @swagger
 * /api/tours/filter/by-region/{region_id}:
 *   get:
 *     summary: Get tours by region
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: region_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Region ID (1 = North, 2 = Central, 3 = South)
 *     responses:
 *       200:
 *         description: List of tours filtered by region
 */
router.get("/filter/by-region/:region_id", tourController.getToursByRegion);




/**
 * @swagger
 * /api/tours/filter/by-category/{category_id}:
 *   get:
 *     summary: Get tours by category
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: category_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: List of tours filtered by category
 */
router.get("/filter/by-category/:category_id", tourController.getToursByCategory);

/**
 * @swagger
 * /api/tours:
 *   post:
 *     summary: Create a new tour (partner or admin)
 *     tags: [Tours]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               tour_name:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               region_id:
 *                 type: integer
 *               category_id:
 *                 type: integer
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               price:
 *                 type: number
 *               available_slots:
 *                 type: integer
 *               created_by:
 *                 type: integer
 *               role:
 *                 type: string
 *                 enum: [admin, partner]
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Tour created successfully
 */
router.post("/", upload.single("image"), tourController.createTour);



/**
 * @swagger
 * /api/tours/update/{tour_id}:
 *   put:
 *     summary: Update a tour
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: tour_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of tour to update
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Tour updated successfully
 */
router.put("/update/:tour_id", upload.single("image"), tourController.updateTour);


/**
 * @swagger
 * /api/tours/delete/{tour_id}:
 *   delete:
 *     summary: Delete a tour
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: tour_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of tour to delete
 *     responses:
 *       200:
 *         description: Tour deleted
 */
router.delete("/delete/:tour_id", tourController.deleteTour);

/**
 * @swagger
 * /api/tours:
 *   get:
 *     summary: Get all approved tours (public)
 *     tags: [Tours]
 *     responses:
 *       200:
 *         description: List of approved tours
 */
router.get("/", tourController.getAllTours);

/**
 * @swagger
 * /api/tours/featured:
 *   get:
 *     summary: Get featured approved tours for deployment validation
 *     tags: [Tours]
 *     responses:
 *       200:
 *         description: Featured approved tours with release metadata
 */
router.get("/featured", tourController.getFeaturedTours);


/**
 * @swagger
 * /api/tours/{tour_id}:
 *   get:
 *     summary: Get detailed tour info by ID
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: tour_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The tour ID
 *     responses:
 *       200:
 *         description: Detailed tour information
 */
router.get("/:tour_id", tourController.getTourById);



module.exports = router;
