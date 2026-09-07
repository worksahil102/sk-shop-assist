const express = require("express");

const {
  getPublicProductCatalogController,
} = require("../controllers/publicCatalogController");

const shopResolverMiddleware = require("../middleware/shopResolverMiddleware");

const router = express.Router();

router.get(
  "/catalog/products",
  shopResolverMiddleware,
  getPublicProductCatalogController,
);

module.exports = router;
