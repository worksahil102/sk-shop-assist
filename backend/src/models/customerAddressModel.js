const pool = require("../config/database");

// CREATE ADDRESS
const createCustomerAddress = async (addressData) => {
  const [result] = await pool.execute(
    `INSERT INTO td_customer_addresses
      (
        customer_id,
        shop_id,
        address_line1,
        address_line2,
        city,
        state,
        pincode,
        landmark,
        address_type,
        is_default
      )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      addressData.customerId,
      addressData.shopId,
      addressData.addressLine1,
      addressData.addressLine2 || null,
      addressData.city,
      addressData.state,
      addressData.pincode,
      addressData.landmark || null,
      addressData.addressType || "HOME",
      addressData.isDefault || false,
    ],
  );

  return result.insertId;
};

// GET ALL CUSTOMER ADDRESSES
const getCustomerAddresses = async (customerId, shopId) => {
  const [rows] = await pool.execute(
    `SELECT
        id,
        customer_id,
        shop_id,
        address_line1,
        address_line2,
        city,
        state,
        pincode,
        landmark,
        address_type,
        is_default,
        created_at,
        updated_at
     FROM td_customer_addresses
     WHERE customer_id = ?
       AND shop_id = ?
     ORDER BY is_default DESC, id DESC`,
    [customerId, shopId],
  );

  return rows;
};

// GET SINGLE CUSTOMER ADDRESS
const getCustomerAddressById = async (addressId, customerId, shopId) => {
  const [rows] = await pool.execute(
    `SELECT
        id,
        customer_id,
        shop_id,
        address_line1,
        address_line2,
        city,
        state,
        pincode,
        landmark,
        address_type,
        is_default,
        created_at,
        updated_at
     FROM td_customer_addresses
     WHERE id = ?
       AND customer_id = ?
       AND shop_id = ?
     LIMIT 1`,
    [addressId, customerId, shopId],
  );

  return rows[0];
};

// UPDATE CUSTOMER ADDRESS
const updateCustomerAddress = async (
  addressId,
  customerId,
  shopId,
  addressData,
) => {
  const [result] = await pool.execute(
    `UPDATE td_customer_addresses
     SET
        address_line1 = ?,
        address_line2 = ?,
        city = ?,
        state = ?,
        pincode = ?,
        landmark = ?,
        address_type = ?
     WHERE id = ?
       AND customer_id = ?
       AND shop_id = ?`,
    [
      addressData.addressLine1,
      addressData.addressLine2 || null,
      addressData.city,
      addressData.state,
      addressData.pincode,
      addressData.landmark || null,
      addressData.addressType || "HOME",
      addressId,
      customerId,
      shopId,
    ],
  );

  return result.affectedRows;
};

// DELETE CUSTOMER ADDRESS
const deleteCustomerAddress = async (addressId, customerId, shopId) => {
  const [result] = await pool.execute(
    `DELETE FROM td_customer_addresses
     WHERE id = ?
       AND customer_id = ?
       AND shop_id = ?`,
    [addressId, customerId, shopId],
  );

  return result.affectedRows;
};

// SET DEFAULT ADDRESS
const setDefaultCustomerAddress = async (addressId, customerId, shopId) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Remove default from all customer's addresses
    await connection.execute(
      `UPDATE td_customer_addresses
       SET is_default = FALSE
       WHERE customer_id = ?
         AND shop_id = ?`,
      [customerId, shopId],
    );

    // Make selected address default
    const [result] = await connection.execute(
      `UPDATE td_customer_addresses
       SET is_default = TRUE
       WHERE id = ?
         AND customer_id = ?
         AND shop_id = ?`,
      [addressId, customerId, shopId],
    );

    await connection.commit();

    return result.affectedRows;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  createCustomerAddress,
  getCustomerAddresses,
  getCustomerAddressById,
  updateCustomerAddress,
  deleteCustomerAddress,
  setDefaultCustomerAddress,
};
