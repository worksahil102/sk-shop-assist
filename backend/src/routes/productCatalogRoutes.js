const express = require("express");

const {
  getProductCatalogController,
} = require("../controllers/productCatalogController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleWare = require("../middleware/roleMiddleware");

const router = express.Router();

// GET PRODUCT CATALOG
router.get(
  "/catalog/products",
  authMiddleware,
  roleMiddleWare(2, 3),
  getProductCatalogController,
);

module.exports = router;
