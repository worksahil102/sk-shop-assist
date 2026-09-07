const {
  createCustomerAddress,
  getCustomerAddresses,
  getCustomerAddressById,
  updateCustomerAddress,
  deleteCustomerAddress,
  setDefaultCustomerAddress,
} = require("../models/customerAddressModel");

// CREATE ADDRESS
const createCustomerAddressController = async (req, res) => {
  try {
    const customerId = req.customerId;
    const shopId = req.shopId;

    const {
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      landmark,
      addressType,
      isDefault,
    } = req.body;

    if (!addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Address line 1, city, state and pincode are required",
      });
    }

    const addressId = await createCustomerAddress({
      customerId,
      shopId,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      landmark,
      addressType,
      isDefault,
    });

    // If this is the first address, make it default
    const addresses = await getCustomerAddresses(customerId, shopId);

    if (addresses.length === 1) {
      await setDefaultCustomerAddress(addressId, customerId, shopId);
    }

    return res.status(201).json({
      success: true,
      message: "Customer address created successfully",
      data: {
        id: addressId,
      },
    });
  } catch (error) {
    console.error("Create customer address error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create customer address",
    });
  }
};

// GET ALL ADDRESSES
const getCustomerAddressesController = async (req, res) => {
  try {
    const customerId = req.customerId;
    const shopId = req.shopId;

    const addresses = await getCustomerAddresses(customerId, shopId);

    return res.status(200).json({
      success: true,
      message: "Customer addresses fetched successfully",
      data: addresses,
    });
  } catch (error) {
    console.error("Get customer addresses error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer addresses",
    });
  }
};

// GET SINGLE ADDRESS
const getCustomerAddressController = async (req, res) => {
  try {
    const customerId = req.customerId;
    const shopId = req.shopId;
    const addressId = req.params.addressId;

    const address = await getCustomerAddressById(addressId, customerId, shopId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Customer address not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer address fetched successfully",
      data: address,
    });
  } catch (error) {
    console.error("Get customer address error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer address",
    });
  }
};

// UPDATE ADDRESS
const updateCustomerAddressController = async (req, res) => {
  try {
    const customerId = req.customerId;
    const shopId = req.shopId;
    const addressId = req.params.addressId;

    const {
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      landmark,
      addressType,
    } = req.body;

    if (!addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Address line 1, city, state and pincode are required",
      });
    }

    const affectedRows = await updateCustomerAddress(
      addressId,
      customerId,
      shopId,
      {
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        landmark,
        addressType,
      },
    );

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer address not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer address updated successfully",
    });
  } catch (error) {
    console.error("Update customer address error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update customer address",
    });
  }
};

// DELETE ADDRESS
const deleteCustomerAddressController = async (req, res) => {
  try {
    const customerId = req.customerId;
    const shopId = req.shopId;
    const addressId = req.params.addressId;

    const affectedRows = await deleteCustomerAddress(
      addressId,
      customerId,
      shopId,
    );

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer address not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer address deleted successfully",
    });
  } catch (error) {
    console.error("Delete customer address error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete customer address",
    });
  }
};

// SET DEFAULT ADDRESS
const setDefaultCustomerAddressController = async (req, res) => {
  try {
    const customerId = req.customerId;
    const shopId = req.shopId;
    const addressId = req.params.addressId;

    const affectedRows = await setDefaultCustomerAddress(
      addressId,
      customerId,
      shopId,
    );

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer address not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Default address updated successfully",
    });
  } catch (error) {
    console.error("Set default customer address error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to set default customer address",
    });
  }
};

module.exports = {
  createCustomerAddressController,
  getCustomerAddressesController,
  getCustomerAddressController,
  updateCustomerAddressController,
  deleteCustomerAddressController,
  setDefaultCustomerAddressController,
};
