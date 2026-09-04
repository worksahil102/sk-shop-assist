const { findCategoryById } = require("../models/categoryModel");
const {
  getProductByShop,
  findProductById,
  findProductByName,
  createProduct,
  updateProduct,
  toggleProductStatus,
} = require("../models/productModel");

const createProductController = async (req, res) => {
  try {
    const { categoryId, name, description, brand } = req.body;

    // 1. Validate required fields
    if (!categoryId || !name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category ID and product name are required",
      });
    }

    // 2. Get shop ID from logged-in user's JWT
    const shopId = req.user.shopId;

    // 3. Check category belongs to this shop
    const category = await findCategoryById(shopId, Number(categoryId));

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found for this shop",
      });
    }

    // 4. Check category is active
    if (!category.is_active) {
      return res.status(400).json({
        success: false,
        message: "Cannot create product under an inactive category",
      });
    }

    // 5. Check duplicate product name
    const existingProduct = await findProductByName(shopId, name.trim());

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "Product with this name already exists",
      });
    }

    // 6. Create product
    const productId = await createProduct({
      shopId,
      categoryId: Number(categoryId),
      name: name.trim(),
      description: description?.trim() || null,
      brand: brand?.trim() || null,
    });

    // 7. Success response
    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: {
        id: productId,
        shopId,
        categoryId: Number(categoryId),
        name: name.trim(),
        description: description?.trim() || null,
        brand: brand?.trim() || null,
      },
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

const getProductsController = async (req, res) => {
  try {
    const shopId = req.user.shopId;

    const products = await getProductByShop(shopId);

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

const getProductController = async (req, res) => {
  try {
    const { productId } = req.params;
    const shopId = req.user.shopId;

    const product = await findProductById(shopId, Number(productId));

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "product  not found",
      });
    }

    return res.status(200).json({
      message: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

const updateProductController = async (req, res) => {
  try {
    const { productId } = req.params;

    const { categoryId, name, description, brand } = req.body;

    if (!categoryId || !name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "category id and product name are required",
      });
    }

    const shopId = req.user.shopId;

    const product = await findProductById(shopId, Number(productId));

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    const category = await findCategoryById(shopId, Number(categoryId));

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    if (!category.is_active) {
      return res.status(400).json({
        success: false,
        message: "Cannot assign product to an inactive category",
      });
    }
    const existingProduct = await findProductByName(shopId, name.trim());

    if (existingProduct && existingProduct.id !== Number(productId)) {
      return res.status(409).json({
        success: false,
        message: "Product with this name already exists",
      });
    }
    await updateProduct(shopId, Number(productId), {
      categoryId: Number(categoryId),
      name: name.trim(),
      description: description?.trim() || null,
      brand: brand?.trim() || null,
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

const toggleProductStatusController = async (req, res) => {
  try {
    const { productId } = req.params;

    const shopId = req.user.shopId;

    // 1. Check product
    const product = await findProductById(shopId, Number(productId));

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 2. Toggle status
    await toggleProductStatus(shopId, Number(productId));

    const newStatus = !Boolean(product.is_active);

    return res.status(200).json({
      success: true,
      message: `Product ${
        newStatus ? "activated" : "deactivated"
      } successfully`,
      data: {
        id: Number(productId),
        is_active: newStatus,
      },
    });
  } catch (error) {
    console.error("Toggle product status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update product status",
    });
  }
};

module.exports = {
  createProductController,
  getProductController,
  getProductsController,
  updateProductController,
  toggleProductStatusController,
};
