const {
  createVariant,
  findVariantById,
  findVariantBySku,
  findVariantByBarcode,
  getVariantsByProduct,
  updateVariant,
  toggleVariantStatus,
} = require("../models/variantModal");

const { findProductById } = require("../models/productModel");

const { findVariantGroupById } = require("../models/variantGroupModel");

// CREATE VARIANT
const createVariantController = async (req, res) => {
  try {
    const { productId } = req.params;

    const { variantGroupId, sku, size, price, mrp, barcode } = req.body;

    // -----------------------------
    // BASIC VALIDATION
    // -----------------------------

    if (!variantGroupId) {
      return res.status(400).json({
        success: false,
        message: "Variant group is required",
      });
    }

    if (!sku || !sku.trim()) {
      return res.status(400).json({
        success: false,
        message: "SKU is required",
      });
    }

    if (price === undefined || price === null || price === "") {
      return res.status(400).json({
        success: false,
        message: "Price is required",
      });
    }

    if (Number.isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid positive number",
      });
    }

    if (
      mrp !== undefined &&
      mrp !== null &&
      mrp !== "" &&
      (Number.isNaN(Number(mrp)) || Number(mrp) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "MRP must be a valid positive number",
      });
    }

    const shopId = req.user.shopId;

    // -----------------------------
    // CHECK PRODUCT
    // -----------------------------

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
        message: "Cannot add variant to an inactive product",
      });
    }

    // -----------------------------
    // CHECK VARIANT GROUP
    // -----------------------------

    const variantGroup = await findVariantGroupById(
      Number(productId),
      Number(variantGroupId),
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
        message: "Cannot add variant to an inactive variant group",
      });
    }

    // -----------------------------
    // CHECK DUPLICATE SKU
    // -----------------------------

    const existingSku = await findVariantBySku(sku.trim());

    if (existingSku) {
      return res.status(409).json({
        success: false,
        message: "SKU already exists",
      });
    }

    // -----------------------------
    // CHECK DUPLICATE BARCODE
    // -----------------------------

    if (barcode && barcode.trim()) {
      const existingBarcode = await findVariantByBarcode(barcode.trim());

      if (existingBarcode) {
        return res.status(409).json({
          success: false,
          message: "Barcode already exists",
        });
      }
    }

    // -----------------------------
    // CREATE VARIANT
    // -----------------------------

    const variantId = await createVariant({
      productId: Number(productId),
      variantGroupId: Number(variantGroupId),
      sku: sku.trim(),
      size: size?.trim() || null,
      price: Number(price),
      mrp: mrp !== undefined && mrp !== null && mrp !== "" ? Number(mrp) : null,
      barcode: barcode?.trim() || null,
    });

    return res.status(201).json({
      success: true,
      message: "Variant created successfully",
      data: {
        id: variantId,
        productId: Number(productId),
        variantGroupId: Number(variantGroupId),
        sku: sku.trim(),
        size: size?.trim() || null,
        price: Number(price),
        mrp:
          mrp !== undefined && mrp !== null && mrp !== "" ? Number(mrp) : null,
        barcode: barcode?.trim() || null,
      },
    });
  } catch (error) {
    console.error("Create variant error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create variant",
    });
  }
};

// GET ALL VARIANTS
const getVariantsController = async (req, res) => {
  try {
    const { productId } = req.params;

    const shopId = req.user.shopId;

    // Check product belongs to logged-in user's shop
    const product = await findProductById(shopId, Number(productId));

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found for this shop",
      });
    }

    const variants = await getVariantsByProduct(Number(productId));

    return res.status(200).json({
      success: true,
      message: "Variants fetched successfully",
      data: variants,
    });
  } catch (error) {
    console.error("Get variants error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch variants",
    });
  }
};

// GET SINGLE VARIANT
const getVariantController = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    const shopId = req.user.shopId;

    // Check product belongs to shop
    const product = await findProductById(shopId, Number(productId));

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found for this shop",
      });
    }

    const variant = await findVariantById(Number(productId), Number(variantId));

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Variant fetched successfully",
      data: variant,
    });
  } catch (error) {
    console.error("Get variant error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch variant",
    });
  }
};

// UPDATE VARIANT
const updateVariantController = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    const { variantGroupId, sku, size, price, mrp, barcode } = req.body;

    // -----------------------------
    // BASIC VALIDATION
    // -----------------------------

    if (!variantGroupId) {
      return res.status(400).json({
        success: false,
        message: "Variant group is required",
      });
    }

    if (!sku || !sku.trim()) {
      return res.status(400).json({
        success: false,
        message: "SKU is required",
      });
    }

    if (price === undefined || price === null || price === "") {
      return res.status(400).json({
        success: false,
        message: "Price is required",
      });
    }

    if (Number.isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid positive number",
      });
    }

    if (
      mrp !== undefined &&
      mrp !== null &&
      mrp !== "" &&
      (Number.isNaN(Number(mrp)) || Number(mrp) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "MRP must be a valid positive number",
      });
    }

    const shopId = req.user.shopId;

    // -----------------------------
    // CHECK PRODUCT
    // -----------------------------

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
        message: "Cannot update variant of an inactive product",
      });
    }

    // -----------------------------
    // CHECK VARIANT
    // -----------------------------

    const existingVariant = await findVariantById(
      Number(productId),
      Number(variantId),
    );

    if (!existingVariant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    // -----------------------------
    // CHECK VARIANT GROUP
    // -----------------------------

    const variantGroup = await findVariantGroupById(
      Number(productId),
      Number(variantGroupId),
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
        message: "Cannot assign variant to an inactive variant group",
      });
    }

    // -----------------------------
    // CHECK DUPLICATE SKU
    // -----------------------------

    const existingSku = await findVariantBySku(sku.trim());

    if (existingSku && existingSku.id !== Number(variantId)) {
      return res.status(409).json({
        success: false,
        message: "SKU already exists",
      });
    }

    // -----------------------------
    // CHECK DUPLICATE BARCODE
    // -----------------------------

    if (barcode && barcode.trim()) {
      const existingBarcode = await findVariantByBarcode(barcode.trim());

      if (existingBarcode && existingBarcode.id !== Number(variantId)) {
        return res.status(409).json({
          success: false,
          message: "Barcode already exists",
        });
      }
    }

    // -----------------------------
    // UPDATE VARIANT
    // -----------------------------

    const affectedRows = await updateVariant(
      Number(productId),
      Number(variantId),
      {
        variantGroupId: Number(variantGroupId),
        sku: sku.trim(),
        size: size?.trim() || null,
        price: Number(price),
        mrp:
          mrp !== undefined && mrp !== null && mrp !== "" ? Number(mrp) : null,
        barcode: barcode?.trim() || null,
      },
    );

    if (!affectedRows) {
      return res.status(400).json({
        success: false,
        message: "Variant was not updated",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Variant updated successfully",
    });
  } catch (error) {
    console.error("Update variant error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update variant",
    });
  }
};

// TOGGLE VARIANT STATUS
const toggleVariantStatusController = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    const shopId = req.user.shopId;

    // Check product belongs to shop
    const product = await findProductById(shopId, Number(productId));

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found for this shop",
      });
    }

    const variant = await findVariantById(Number(productId), Number(variantId));

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    const affectedRows = await toggleVariantStatus(
      Number(productId),
      Number(variantId),
    );

    if (!affectedRows) {
      return res.status(400).json({
        success: false,
        message: "Variant status was not updated",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Variant status updated successfully",
    });
  } catch (error) {
    console.error("Toggle variant status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update variant status",
    });
  }
};

module.exports = {
  createVariantController,
  getVariantsController,
  getVariantController,
  updateVariantController,
  toggleVariantStatusController,
};
