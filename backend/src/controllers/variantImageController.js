const {
  createVariantImage,
  getVariantImagesByGroup,
  findVariantImageById,
  deleteVariantImage,
} = require("../models/variantImageModel");

const { findProductById } = require("../models/productModel");

const { findVariantGroupById } = require("../models/variantGroupModel");

// CREATE IMAGE
const createVariantImageController = async (req, res) => {
  try {
    const { productId, groupId } = req.params;

    const { imageUrl, isPrimary, sortOrder } = req.body;

    if (!imageUrl || !imageUrl.trim()) {
      return res.status(400).json({
        success: false,
        message: "Image URL is required",
      });
    }

    const shopId = req.user.shopId;

    // Check product belongs to logged-in shop
    const product = await findProductById(shopId, Number(productId));

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found for this shop",
      });
    }

    if (!product.is_active) {
      return res.status(400).json({
        success: false,
        message: "Cannot add image to an inactive product",
      });
    }

    // Check variant group belongs to product
    const variantGroup = await findVariantGroupById(
      Number(productId),
      Number(groupId),
    );

    if (!variantGroup) {
      return res.status(404).json({
        success: false,
        message: "Variant group not found for this product",
      });
    }

    if (!variantGroup.is_active) {
      return res.status(400).json({
        success: false,
        message: "Cannot add image to an inactive variant group",
      });
    }

    const imageId = await createVariantImage({
      variantGroupId: Number(groupId),
      imageUrl: imageUrl.trim(),
      isPrimary: Boolean(isPrimary),
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
    });

    return res.status(201).json({
      success: true,
      message: "Variant image created successfully",
      data: {
        id: imageId,
        variantGroupId: Number(groupId),
        imageUrl: imageUrl.trim(),
        isPrimary: Boolean(isPrimary),
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
      },
    });
  } catch (error) {
    console.error("Create variant image error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create variant image",
    });
  }
};

// GET ALL IMAGES
const getVariantImagesController = async (req, res) => {
  try {
    const { productId, groupId } = req.params;

    const shopId = req.user.shopId;

    // Check product
    const product = await findProductById(shopId, Number(productId));

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found for this shop",
      });
    }

    // Check variant group
    const variantGroup = await findVariantGroupById(
      Number(productId),
      Number(groupId),
    );

    if (!variantGroup) {
      return res.status(404).json({
        success: false,
        message: "Variant group not found for this product",
      });
    }

    const images = await getVariantImagesByGroup(Number(groupId));

    return res.status(200).json({
      success: true,
      message: "Variant images fetched successfully",
      data: images,
    });
  } catch (error) {
    console.error("Get variant images error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch variant images",
    });
  }
};

// DELETE IMAGE
const deleteVariantImageController = async (req, res) => {
  try {
    const { productId, groupId, imageId } = req.params;

    const shopId = req.user.shopId;

    // Check product
    const product = await findProductById(shopId, Number(productId));

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found for this shop",
      });
    }

    // Check variant group
    const variantGroup = await findVariantGroupById(
      Number(productId),
      Number(groupId),
    );

    if (!variantGroup) {
      return res.status(404).json({
        success: false,
        message: "Variant group not found for this product",
      });
    }

    // Check image
    const image = await findVariantImageById(Number(groupId), Number(imageId));

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Variant image not found",
      });
    }

    const affectedRows = await deleteVariantImage(
      Number(groupId),
      Number(imageId),
    );

    if (!affectedRows) {
      return res.status(400).json({
        success: false,
        message: "Image was not deleted",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Variant image deleted successfully",
    });
  } catch (error) {
    console.error("Delete variant image error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete variant image",
    });
  }
};

module.exports = {
  createVariantImageController,
  getVariantImagesController,
  deleteVariantImageController,
};
