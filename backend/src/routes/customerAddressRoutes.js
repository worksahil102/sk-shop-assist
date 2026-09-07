const express = require("express");

const {
  createCustomerAddressController,
  getCustomerAddressesController,
  getCustomerAddressController,
  updateCustomerAddressController,
  deleteCustomerAddressController,
  setDefaultCustomerAddressController,
} = require("../controllers/customerAddressController");

const shopResolverMiddleware = require("../middleware/shopResolverMiddleware");
const customerAuthMiddleware = require("../middleware/customerAuthMiddlware");

const router = express.Router();

// CREATE ADDRESS
router.post(
  "/",
  shopResolverMiddleware,
  customerAuthMiddleware,
  createCustomerAddressController,
);

// GET ALL ADDRESSES
router.get(
  "/",
  shopResolverMiddleware,
  customerAuthMiddleware,
  getCustomerAddressesController,
);

// GET SINGLE ADDRESS
router.get(
  "/:addressId",
  shopResolverMiddleware,
  customerAuthMiddleware,
  getCustomerAddressController,
);

// UPDATE ADDRESS
router.put(
  "/:addressId",
  shopResolverMiddleware,
  customerAuthMiddleware,
  updateCustomerAddressController,
);

// DELETE ADDRESS
router.delete(
  "/:addressId",
  shopResolverMiddleware,
  customerAuthMiddleware,
  deleteCustomerAddressController,
);

// SET DEFAULT ADDRESS
router.patch(
  "/:addressId/default",
  shopResolverMiddleware,
  customerAuthMiddleware,
  setDefaultCustomerAddressController,
);

module.exports = router;
