const express = require("express");

const {
  createVariantImageController,
  getVariantImagesController,
  deleteVariantImageController,
} = require("../controllers/variantImageController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleWare = require("../middleware/roleMiddleware");

const router = express.Router();

// GET ALL IMAGES OF VARIANT GROUP
router.get(
  "/products/:productId/variantgroups/:groupId/imageList",
  authMiddleware,
  roleMiddleWare(2, 3),
  getVariantImagesController,
);

// CREATE IMAGE
router.post(
  "/products/:productId/variantgroups/:groupId/addImage",
  authMiddleware,
  roleMiddleWare(2),
  createVariantImageController,
);

// DELETE IMAGE
router.delete(
  "/products/:productId/variantgroups/:groupId/images/:imageId",
  authMiddleware,
  roleMiddleWare(2),
  deleteVariantImageController,
);

module.exports = router;
