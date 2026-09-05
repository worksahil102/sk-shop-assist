const express = require("express");

const {
  createVariantGroupController,
  getVariantGroupsController,
  getVariantGroupController,
  updateVariantGroupController,
  toggleVariantGroupStatusController,
} = require("../controllers/variantGruopController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleWare = require("../middleware/roleMiddleware");

const router = express.Router();

// GET ALL COLORS
// Owner + Manager
router.get(
  "/products/:productId/variantgroups",
  authMiddleware,
  roleMiddleWare(2, 3),
  getVariantGroupsController,
);

// GET SINGLE COLOR
// Owner + Manager
router.get(
  "/products/:productId/variantgroups/:groupId",
  authMiddleware,
  roleMiddleWare(2, 3),
  getVariantGroupController,
);

// CREATE COLOR
// Owner only
router.post(
  "/products/:productId/variantgroups",
  authMiddleware,
  roleMiddleWare(2),
  createVariantGroupController,
);

// UPDATE COLOR
// Owner only
router.put(
  "/products/:productId/variantgroups/:groupId",
  authMiddleware,
  roleMiddleWare(2),
  updateVariantGroupController,
);

// TOGGLE COLOR STATUS
// Owner only
router.patch(
  "/products/:productId/variantgroups/:groupId/toggle-status",
  authMiddleware,
  roleMiddleWare(2),
  toggleVariantGroupStatusController,
);

module.exports = router;
