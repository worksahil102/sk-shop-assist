const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleWare = require("../middleware/roleMiddleware");
const {
  createCategoryController,
  getCategoriesController,
  updateCategoryController,
  deactivateCategoryController,
  toggleCategoryStatusController,
} = require("../controllers/categoryController");

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  roleMiddleWare(2, 3),
  createCategoryController,
);

router.get("/", authMiddleware, roleMiddleWare(2, 3), getCategoriesController);

router.put(
  "/update/:categoryId",
  authMiddleware,
  roleMiddleWare(2, 3),
  updateCategoryController,
);

router.patch(
  "/:categoryId/toggle-status",
  authMiddleware,
  roleMiddleWare(2, 3),
  toggleCategoryStatusController,
);

module.exports = router;
