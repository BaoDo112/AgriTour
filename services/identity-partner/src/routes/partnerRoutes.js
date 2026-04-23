const express = require("express");
const router = express.Router();
const partnerController = require("../controllers/partnerController");

router.post("/", partnerController.createPartner);
router.get("/", partnerController.getAllPartners);
router.get("/:partner_id", partnerController.getPartnerById);
router.put("/:partner_id/approve", partnerController.approvePartner);
router.delete("/:partner_id", partnerController.deletePartner);

module.exports = router;
