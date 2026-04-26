const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

const requireSelfOrAdmin = (req, res, next) => {
	const isAdmin = req.user?.role === "admin";
	const isSelf = Number(req.user?.id) === Number(req.params.user_id);

	if (isAdmin || isSelf) {
		next();
		return;
	}

	res.status(403).json({ error: "Insufficient permissions" });
};

router.get("/", verifyToken, requireRole("admin"), userController.getAllUsers);
router.get("/:user_id", verifyToken, requireSelfOrAdmin, userController.getUserById);
router.put("/:user_id", verifyToken, requireSelfOrAdmin, userController.updateUser);
router.put("/:user_id/role", verifyToken, requireRole("admin"), userController.changeUserRole);
router.delete("/:user_id", verifyToken, requireRole("admin"), userController.deleteUser);

module.exports = router;
