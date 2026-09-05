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

// CREATE VARIANT
const createVariantController = async (req, res) => {
  try {
    const { productId, sku, size, color, price, mrp, barcode } = req.body;

    // Validate required fields
    if (
      !productId ||
      !sku ||
      !sku.trim() ||
      price === undefined ||
      price === null ||
      price === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Product ID, SKU and price are required",
      });
    }

    const shopId = req.user.shopId;

    // Validate price
    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid positive number",
      });
    }

    // Validate MRP if provided
    let numericMrp = null;

    if (mrp !== undefined && mrp !== null && mrp !== "") {
      numericMrp = Number(mrp);

      if (Number.isNaN(numericMrp) || numericMrp < 0) {
        return res.status(400).json({
          success: false,
          message: "MRP must be a valid positive number",
        });
      }
    }

    // Check product belongs to logged-in shop
    const product = await findProductById(shopId, Number(productId));

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found for this shop",
      });
    }

    // Do not create variant under inactive product
    if (!product.is_active) {
      return res.status(400).json({
        success: false,
        message: "Cannot create variant under an inactive product",
      });
    }

    // Check duplicate SKU
    const existingSku = await findVariantBySku(sku.trim());

    if (existingSku) {
      return res.status(409).json({
        success: false,
        message: "Variant with this SKU already exists",
      });
    }

    // Check duplicate barcode
    if (barcode && barcode.trim()) {
      const existingBarcode = await findVariantByBarcode(barcode.trim());

      if (existingBarcode) {
        return res.status(409).json({
          success: false,
          message: "Variant with this barcode already exists",
        });
      }
    }

    // Create variant
    const variantId = await createVariant({
      productId: Number(productId),
      sku: sku.trim(),
      size: size?.trim() || null,
      color: color?.trim() || null,
      price: numericPrice,
      mrp: numericMrp,
      barcode: barcode?.trim() || null,
    });

    return res.status(201).json({
      success: true,
      message: "Product variant created successfully",
      data: {
        id: variantId,
        productId: Number(productId),
        sku: sku.trim(),
        size: size?.trim() || null,
        color: color?.trim() || null,
        price: numericPrice,
        mrp: numericMrp,
        barcode: barcode?.trim() || null,
      },
    });
  } catch (error) {
    console.error("Create variant error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create product variant",
    });
  }
};

// GET ALL VARIANTS OF PRODUCT
const getVariantsController = async (req, res) => {
  try {
    const { productId } = req.params;

    const shopId = req.user.shopId;

    // Check product belongs to logged-in shop
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
      message: "Product variants fetched successfully",
      data: variants,
    });
  } catch (error) {
    console.error("Get variants error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product variants",
    });
  }
};

// GET SINGLE VARIANT
const getVariantController = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    const shopId = req.user.shopId;

    // Check product belongs to logged-in shop
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
        message: "Product variant not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product variant fetched successfully",
      data: variant,
    });
  } catch (error) {
    console.error("Get variant error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product variant",
    });
  }
};

// UPDATE VARIANT
const updateVariantController = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    const { sku, size, color, price, mrp, barcode } = req.body;

    if (
      !sku ||
      !sku.trim() ||
      price === undefined ||
      price === null ||
      price === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "SKU and price are required",
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
        message: "Cannot update variant under an inactive product",
      });
    }

    // Check variant exists
    const existingVariant = await findVariantById(
      Number(productId),
      Number(variantId),
    );

    if (!existingVariant) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found",
      });
    }

    // Validate price
    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid positive number",
      });
    }

    // Validate MRP
    let numericMrp = null;

    if (mrp !== undefined && mrp !== null && mrp !== "") {
      numericMrp = Number(mrp);

      if (Number.isNaN(numericMrp) || numericMrp < 0) {
        return res.status(400).json({
          success: false,
          message: "MRP must be a valid positive number",
        });
      }
    }

    // Check duplicate SKU
    const existingSku = await findVariantBySku(sku.trim());

    if (existingSku && existingSku.id !== Number(variantId)) {
      return res.status(409).json({
        success: false,
        message: "Variant with this SKU already exists",
      });
    }

    // Check duplicate barcode
    if (barcode && barcode.trim()) {
      const existingBarcode = await findVariantByBarcode(barcode.trim());

      if (existingBarcode && existingBarcode.id !== Number(variantId)) {
        return res.status(409).json({
          success: false,
          message: "Variant with this barcode already exists",
        });
      }
    }

    // Update variant
    const affectedRows = await updateVariant(
      Number(productId),
      Number(variantId),
      {
        sku: sku.trim(),
        size: size?.trim() || null,
        color: color?.trim() || null,
        price: numericPrice,
        mrp: numericMrp,
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
      message: "Product variant updated successfully",
    });
  } catch (error) {
    console.error("Update variant error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update product variant",
    });
  }
};

// TOGGLE VARIANT STATUS
const toggleVariantStatusController = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    const shopId = req.user.shopId;

    // Check product belongs to logged-in shop
    const product = await findProductById(shopId, Number(productId));

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found for this shop",
      });
    }

    // Check variant exists
    const variant = await findVariantById(Number(productId), Number(variantId));

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found",
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
      message: "Product variant status updated successfully",
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
