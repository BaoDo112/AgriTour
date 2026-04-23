const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// In this extraction, let's keep all endpoints, maybe optionally secured later, but standard is keep mapping routing
router.get("/", userController.getAllUsers);
router.get("/:user_id", userController.getUserById);
router.put("/:user_id", userController.updateUser);
router.put("/:user_id/role", userController.changeUserRole);
router.delete("/:user_id", userController.deleteUser);

module.exports = router;
