const express = require("express");

const { createOrderController } = require("../controllers/orderController");

const shopResolverMiddleware = require("../middleware/shopResolverMiddleware");
const customerAuthMiddleware = require("../middleware/customerAuthMiddlware");

const router = express.Router();

// CREATE CUSTOMER ORDER
router.post(
  "/",
  shopResolverMiddleware,
  customerAuthMiddleware,
  createOrderController,
);

module.exports = router;
