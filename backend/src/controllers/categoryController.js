const {
  findCategoryByName,
  createCategory,
  getCategoriesByShop,
  findCategoryById,
  updateCategory,
  toggleCategoryStatus,
} = require("../models/categoryModel");

const createCategoryController = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const shopId = req.user.shopId;

    const existingCategory = await findCategoryByName(shopId, name.trim());

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    const categoryId = await createCategory({
      shopId,
      name: name.trim(),
      description: description.trim() || null,
    });

    return res.status(200).json({
      success: true,
      message: "Category created successfully",
      data: {
        id: categoryId,
        shopId,
        name: name.trim(),
        description: description.trim() || null,
      },
    });
  } catch (error) {
    console.error("create category error", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

const getCategoriesController = async (req, res) => {
  try {
    const shopId = req.user.shopId;

    const categories = await getCategoriesByShop(shopId);

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error(" get categories error", error);

    return res.status(500).json({
      success: false,
      message: " failed to fetch categories",
    });
  }
};

const updateCategoryController = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is rquired",
      });
    }

    const shopId = req.user.shopId;

    const category = await findCategoryById(shopId, Number(categoryId));

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const existingCategory = await findCategoryByName(shopId, name.trim());

    if (existingCategory && existingCategory.id !== Number(categoryId)) {
      return res.status(409).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    await updateCategory(shopId, Number(categoryId), {
      name: name.trim(),
      description: description.trim() || null,
    });

    return res.status(200).json({
      success: true,
      message: "Category updated successfully ",
    });
  } catch (error) {
    console.error("update caetorey error :", error);

    return res.status(500).json({
      success: false,
      message: "failed to update category",
    });
  }
};

const toggleCategoryStatusController = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const shopId = req.user.shopId;

    const category = await findCategoryById(shopId, Number(categoryId));

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await toggleCategoryStatus(shopId, Number(categoryId));

    const newStatus = !Boolean(category.is_active);

    return res.status(200).json({
      success: true,
      message: `Category ${
        newStatus ? "activated" : "deactivated"
      } successfully`,
      data: {
        id: Number(categoryId),
        is_active: newStatus,
      },
    });
  } catch (error) {
    console.error("Toggle category status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update category status",
    });
  }
};

module.exports = {
  getCategoriesController,
  createCategoryController,
  updateCategoryController,
  toggleCategoryStatusController,
};
