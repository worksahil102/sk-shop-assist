const pool = require("../config/database");

// GET VARIANT DETAILS + CHECK STOCK
const getVariantForOrder = async (variantId, shopId, connection) => {
  const [rows] = await connection.execute(
    `SELECT
        pv.id,
        pv.product_id,
        pv.variant_group_id,
        pv.sku,
        pv.size,
        pv.price,
        pv.mrp,
        pv.stock_quantity,
        pv.is_active,

        p.name AS product_name,
        p.is_active AS product_is_active,

        vvg.name AS variant_group_name

     FROM td_product_variants pv

     INNER JOIN td_products p
        ON p.id = pv.product_id

     LEFT JOIN td_product_variant_groups vvg
        ON vvg.id = pv.variant_group_id

     WHERE pv.id = ?
       AND p.shop_id = ?
     LIMIT 1

     FOR UPDATE`,
    [variantId, shopId],
  );

  return rows[0];
};

// CREATE ORDER
const createOrder = async (orderData, connection) => {
  const [result] = await connection.execute(
    `INSERT INTO td_orders
      (
        shop_id,
        customer_id,
        address_id,
        order_number,
        subtotal,
        discount,
        tax,
        shipping_charge,
        total_amount,
        payment_status,
        order_status
      )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      orderData.shopId,
      orderData.customerId,
      orderData.addressId,
      orderData.orderNumber,
      orderData.subtotal,
      orderData.discount,
      orderData.tax,
      orderData.shippingCharge,
      orderData.totalAmount,
      orderData.paymentStatus || "PENDING",
      orderData.orderStatus || "PENDING",
    ],
  );

  return result.insertId;
};

// CREATE ORDER ITEM
const createOrderItem = async (orderItemData, connection) => {
  const [result] = await connection.execute(
    `INSERT INTO td_order_items
      (
        order_id,
        product_id,
        variant_id,
        product_name,
        variant_name,
        sku,
        quantity,
        unit_price,
        total_price
      )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      orderItemData.orderId,
      orderItemData.productId,
      orderItemData.variantId,
      orderItemData.productName,
      orderItemData.variantName || null,
      orderItemData.sku || null,
      orderItemData.quantity,
      orderItemData.unitPrice,
      orderItemData.totalPrice,
    ],
  );

  return result.insertId;
};

// REDUCE STOCK
const reduceVariantStock = async (variantId, quantity, connection) => {
  const [result] = await connection.execute(
    `UPDATE td_product_variants
     SET stock_quantity = stock_quantity - ?
     WHERE id = ?
       AND stock_quantity >= ?`,
    [quantity, variantId, quantity],
  );

  return result.affectedRows;
};

// CREATE COMPLETE ORDER
const createCompleteOrder = async ({ orderData, orderItems }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // --------------------------------
    // 1. VALIDATE ALL VARIANTS + STOCK
    // --------------------------------
    const validatedItems = [];

    for (const item of orderItems) {
      const variant = await getVariantForOrder(
        item.variantId,
        orderData.shopId,
        connection,
      );

      if (!variant) {
        throw new Error(`Variant ${item.variantId} not found`);
      }

      if (!variant.is_active || !variant.product_is_active) {
        throw new Error(`Product or variant ${item.variantId} is inactive`);
      }

      if (variant.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for variant ${item.variantId}`);
      }

      validatedItems.push({
        ...item,
        variant,
      });
    }

    // --------------------------------
    // 2. CREATE ORDER
    // --------------------------------
    const orderId = await createOrder(orderData, connection);

    // --------------------------------
    // 3. CREATE ORDER ITEMS
    // --------------------------------
    for (const item of validatedItems) {
      const variant = item.variant;

      const unitPrice = Number(variant.price);
      const totalPrice = unitPrice * item.quantity;

      await createOrderItem(
        {
          orderId,
          productId: variant.product_id,
          variantId: variant.id,
          productName: variant.product_name,
          variantName: variant.variant_group_name
            ? `${variant.variant_group_name}${variant.size ? ` - ${variant.size}` : ""}`
            : variant.size || null,
          sku: variant.sku,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
        },
        connection,
      );

      // --------------------------------
      // 4. REDUCE STOCK
      // --------------------------------
      const affectedRows = await reduceVariantStock(
        variant.id,
        item.quantity,
        connection,
      );

      if (affectedRows === 0) {
        throw new Error(`Failed to reduce stock for variant ${variant.id}`);
      }
    }

    // --------------------------------
    // 5. COMMIT EVERYTHING
    // --------------------------------
    await connection.commit();

    return {
      orderId,
      items: validatedItems.map((item) => ({
        variantId: item.variant.id,
        productId: item.variant.product_id,
        productName: item.variant.product_name,
        variantName: item.variant.variant_group_name
          ? `${item.variant.variant_group_name}${item.variant.size ? ` - ${item.variant.size}` : ""}`
          : item.variant.size || null,
        sku: item.variant.sku,
        quantity: item.quantity,
        unitPrice: Number(item.variant.price),
        totalPrice: Number(item.variant.price) * item.quantity,
      })),
    };
  } catch (error) {
    // --------------------------------
    // ROLLBACK EVERYTHING
    // --------------------------------
    await connection.rollback();

    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  getVariantForOrder,
  createOrder,
  createOrderItem,
  reduceVariantStock,
  createCompleteOrder,
};
