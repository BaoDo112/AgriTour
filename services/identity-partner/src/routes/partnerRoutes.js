const express = require("express");
const router = express.Router();
const partnerController = require("../controllers/partnerController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

router.post("/", verifyToken, partnerController.createPartner);
router.get("/", verifyToken, requireRole("admin"), partnerController.getAllPartners);
router.get("/:partner_id", verifyToken, partnerController.getPartnerById);
router.put("/:partner_id/approve", verifyToken, requireRole("admin"), partnerController.approvePartner);
router.delete("/:partner_id", verifyToken, requireRole("admin"), partnerController.deletePartner);

module.exports = router;
