const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleWare = require("../middleware/roleMiddleware");
const {
  getProductsController,
  getProductController,
  createProductController,
  updateProductController,
  toggleProductStatusController,
} = require("../controllers/productController");
const { route } = require("./categoryRoutes");

const router = express.Router();

router.get("/", authMiddleware, roleMiddleWare(2, 3), getProductsController);

router.get(
  "/:productId",
  authMiddleware,
  roleMiddleWare(2, 3),
  getProductController,
);

router.post("/", authMiddleware, roleMiddleWare(2), createProductController);

router.put(
  "/:productId",
  authMiddleware,
  roleMiddleWare(2),
  updateProductController,
);

router.patch(
  "/:productId/toggle-status",
  authMiddleware,
  roleMiddleWare(2),
  toggleProductStatusController,
);

module.exports = router;
