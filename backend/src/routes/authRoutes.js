const express = require("express");

const {
  login,
  createShopController,
  createUserController,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware.js");
const roleMiddleWare = require("../middleware/roleMiddleware.js");

const router = express.Router();

router.post("/admin/shops", createShopController);

router.post("/admin/users", createUserController);

router.post("/login", login);

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Token is valid",
    user: req.user,
  });
});

router.get(
  "/admin-manager-test",
  authMiddleware,
  roleMiddleWare(2, 3),
  (req, res) => {
    res.json({
      success: true,
      message: "ADMIN or USER can access this route",
      user: req.user,
    });
  },
);
module.exports = router;
