const {
  createVariantGroup,
  findVariantGroupById,
  findVariantGroupByName,
  getVariantGroupsByProduct,
  updateVariantGroup,
  toggleVariantGroupStatus,
} = require("../models/variantGroupModel");

const { findProductById } = require("../models/productModel");

// CREATE VARIANT GROUP
const createVariantGroupController = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Variant group name is required",
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

    // Cannot add color to inactive product
    if (!product.is_active) {
      return res.status(400).json({
        success: false,
        message: "Cannot add variant group to an inactive product",
      });
    }

    // Check duplicate color
    const existingGroup = await findVariantGroupByName(
      Number(productId),
      name.trim(),
    );

    if (existingGroup) {
      return res.status(409).json({
        success: false,
        message: "This variant group already exists for this product",
      });
    }

    const groupId = await createVariantGroup({
      productId: Number(productId),
      name: name.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Variant group created successfully",
      data: {
        id: groupId,
        productId: Number(productId),
        name: name.trim(),
      },
    });
  } catch (error) {
    console.error("Create variant group error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create variant group",
    });
  }
};

// GET ALL VARIANT GROUPS
const getVariantGroupsController = async (req, res) => {
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

    const groups = await getVariantGroupsByProduct(Number(productId));

    return res.status(200).json({
      success: true,
      message: "Variant groups fetched successfully",
      data: groups,
    });
  } catch (error) {
    console.error("Get variant groups error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch variant groups",
    });
  }
};

// GET SINGLE VARIANT GROUP
const getVariantGroupController = async (req, res) => {
  try {
    const { productId, groupId } = req.params;

    const shopId = req.user.shopId;

    // Check product belongs to logged-in shop
    const product = await findProductById(shopId, Number(productId));

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found for this shop",
      });
    }

    const group = await findVariantGroupById(
      Number(productId),
      Number(groupId),
    );

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Variant group not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Variant group fetched successfully",
      data: group,
    });
  } catch (error) {
    console.error("Get variant group error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch variant group",
    });
  }
};

// UPDATE VARIANT GROUP
const updateVariantGroupController = async (req, res) => {
  try {
    const { productId, groupId } = req.params;

    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Variant group name is required",
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

    // Check group exists
    const existingGroup = await findVariantGroupById(
      Number(productId),
      Number(groupId),
    );

    if (!existingGroup) {
      return res.status(404).json({
        success: false,
        message: "Variant group not found",
      });
    }

    // Check duplicate name
    const duplicateGroup = await findVariantGroupByName(
      Number(productId),
      name.trim(),
    );

    if (duplicateGroup && duplicateGroup.id !== Number(groupId)) {
      return res.status(409).json({
        success: false,
        message: "This variant group already exists for this product",
      });
    }

    const affectedRows = await updateVariantGroup(
      Number(productId),
      Number(groupId),
      {
        name: name.trim(),
      },
    );

    if (!affectedRows) {
      return res.status(400).json({
        success: false,
        message: "Variant group was not updated",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Variant group updated successfully",
    });
  } catch (error) {
    console.error("Update variant group error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update variant group",
    });
  }
};

// TOGGLE VARIANT GROUP STATUS
const toggleVariantGroupStatusController = async (req, res) => {
  try {
    const { productId, groupId } = req.params;

    const shopId = req.user.shopId;

    // Check product belongs to logged-in shop
    const product = await findProductById(shopId, Number(productId));

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found for this shop",
      });
    }

    // Check group exists
    const group = await findVariantGroupById(
      Number(productId),
      Number(groupId),
    );

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Variant group not found",
      });
    }

    const affectedRows = await toggleVariantGroupStatus(
      Number(productId),
      Number(groupId),
    );

    if (!affectedRows) {
      return res.status(400).json({
        success: false,
        message: "Variant group status was not updated",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Variant group status updated successfully",
    });
  } catch (error) {
    console.error("Toggle variant group status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update variant group status",
    });
  }
};

module.exports = {
  createVariantGroupController,
  getVariantGroupsController,
  getVariantGroupController,
  updateVariantGroupController,
  toggleVariantGroupStatusController,
};
