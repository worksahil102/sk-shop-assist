const express = require("express");

const {
  createVariantController,
  getVariantsController,
  getVariantController,
  updateVariantController,
  toggleVariantStatusController,
} = require("../controllers/variantController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleWare = require("../middleware/roleMiddleware");

const router = express.Router();

// GET ALL VARIANTS
// Owner + Manager
router.get(
  "/products/:productId/variants",
  authMiddleware,
  roleMiddleWare(2, 3),
  getVariantsController,
);

// GET SINGLE VARIANT
// Owner + Manager
router.get(
  "/products/:productId/variants/:variantId",
  authMiddleware,
  roleMiddleWare(2, 3),
  getVariantController,
);

// CREATE VARIANT
// Owner only
router.post(
  "/products/:productId/variants",
  authMiddleware,
  roleMiddleWare(2),
  createVariantController,
);

// UPDATE VARIANT
// Owner only
router.put(
  "/products/:productId/variants/:variantId",
  authMiddleware,
  roleMiddleWare(2),
  updateVariantController,
);

// TOGGLE VARIANT STATUS
// Owner only
router.patch(
  "/products/:productId/variants/:variantId/toggle-status",
  authMiddleware,
  roleMiddleWare(2),
  toggleVariantStatusController,
);

module.exports = router;
