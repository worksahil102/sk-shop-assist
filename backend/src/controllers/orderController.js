const { createCompleteOrder } = require("../models/orderModel");

const pool = require("../config/database");

// CREATE CUSTOMER ORDER
const createOrderController = async (req, res) => {
  try {
    // --------------------------------
    // 1. GET CUSTOMER + SHOP FROM AUTH
    // --------------------------------
    const customerId = req.customerId;
    const shopId = req.shopId;

    if (!customerId || !shopId) {
      return res.status(401).json({
        success: false,
        message: "Customer authentication required",
      });
    }

    // --------------------------------
    // 2. GET REQUEST DATA
    // --------------------------------
    const { addressId, items } = req.body;

    // --------------------------------
    // 3. VALIDATE ADDRESS ID
    // --------------------------------
    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "Address is required",
      });
    }

    // --------------------------------
    // 4. VALIDATE ITEMS
    // --------------------------------
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    // --------------------------------
    // 5. VALIDATE EACH ITEM
    // --------------------------------
    for (const item of items) {
      if (!item.variantId) {
        return res.status(400).json({
          success: false,
          message: "Variant ID is required for every item",
        });
      }

      if (
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be a positive integer",
        });
      }
    }

    // --------------------------------
    // 6. CHECK ADDRESS BELONGS TO CUSTOMER
    // --------------------------------
    const [addressRows] = await pool.execute(
      `SELECT id
       FROM td_customer_addresses
       WHERE id = ?
         AND customer_id = ?
         AND shop_id = ?
       LIMIT 1`,
      [addressId, customerId, shopId],
    );

    if (addressRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer address not found",
      });
    }

    // --------------------------------
    // 7. NORMALIZE ITEMS
    // --------------------------------
    const normalizedItems = items.map((item) => ({
      variantId: Number(item.variantId),
      quantity: Number(item.quantity),
    }));

    // --------------------------------
    // 8. CHECK DUPLICATE VARIANTS
    // --------------------------------
    const variantIds = normalizedItems.map((item) => item.variantId);

    const uniqueVariantIds = new Set(variantIds);

    if (uniqueVariantIds.size !== variantIds.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate variant IDs are not allowed",
      });
    }

    // --------------------------------
    // 9. GET PRICES FROM DATABASE
    // --------------------------------
    const placeholders = variantIds.map(() => "?").join(",");

    const [variantRows] = await pool.execute(
      `SELECT
          pv.id,
          pv.price,
          pv.stock_quantity,
          pv.is_active,
          p.is_active AS product_is_active,
          p.shop_id
       FROM td_product_variants pv
       INNER JOIN td_products p
          ON p.id = pv.product_id
       WHERE pv.id IN (${placeholders})
         AND p.shop_id = ?`,
      [...variantIds, shopId],
    );

    // --------------------------------
    // 10. MAKE SURE ALL VARIANTS EXIST
    // --------------------------------
    if (variantRows.length !== variantIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more products are not available",
      });
    }

    // --------------------------------
    // 11. CALCULATE SUBTOTAL
    // --------------------------------
    let subtotal = 0;

    for (const item of normalizedItems) {
      const variant = variantRows.find(
        (row) => Number(row.id) === item.variantId,
      );

      if (!variant) {
        return res.status(400).json({
          success: false,
          message: `Variant ${item.variantId} not found`,
        });
      }

      if (!variant.is_active || !variant.product_is_active) {
        return res.status(400).json({
          success: false,
          message: `Variant ${item.variantId} is not available`,
        });
      }

      if (Number(variant.stock_quantity) < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for variant ${item.variantId}`,
        });
      }

      subtotal += Number(variant.price) * item.quantity;
    }

    // --------------------------------
    // 12. V1 ORDER CHARGES
    // --------------------------------
    const discount = 0;
    const tax = 0;
    const shippingCharge = 0;

    const totalAmount = subtotal - discount + tax + shippingCharge;

    // --------------------------------
    // 13. GENERATE ORDER NUMBER
    // --------------------------------
    const now = new Date();

    const datePart =
      `${now.getFullYear()}` +
      `${String(now.getMonth() + 1).padStart(2, "0")}` +
      `${String(now.getDate()).padStart(2, "0")}`;

    const randomPart = Math.floor(100000 + Math.random() * 900000);

    const orderNumber = `ORD-${datePart}-${randomPart}`;

    // --------------------------------
    // 14. CREATE COMPLETE ORDER
    // --------------------------------
    const orderResult = await createCompleteOrder({
      orderData: {
        shopId,
        customerId,
        addressId,
        orderNumber,
        subtotal,
        discount,
        tax,
        shippingCharge,
        totalAmount,
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
      },

      orderItems: normalizedItems,
    });

    // --------------------------------
    // 15. SUCCESS RESPONSE
    // --------------------------------
    return res.status(201).json({
      success: true,
      message: "Order created successfully",

      data: {
        orderId: orderResult.orderId,
        orderNumber,

        customerId,
        shopId,
        addressId,

        subtotal,
        discount,
        tax,
        shippingCharge,
        totalAmount,

        paymentStatus: "PENDING",
        orderStatus: "PENDING",

        items: orderResult.items,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create order",
    });
  }
};

module.exports = {
  createOrderController,
};
