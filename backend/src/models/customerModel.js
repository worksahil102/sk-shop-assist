const pool = require("../config/database");

// CREATE CUSTOMER
const createCustomer = async (customerData) => {
  const [result] = await pool.execute(
    `INSERT INTO td_customers
      (
        shop_id,
        name,
        email,
        phone,
        password
      )
     VALUES (?, ?, ?, ?, ?)`,
    [
      customerData.shopId,
      customerData.name,
      customerData.email,
      customerData.phone || null,
      customerData.password,
    ],
  );

  return result.insertId;
};

// FIND CUSTOMER BY EMAIL
const findCustomerByEmail = async (shopId, email) => {
  const [rows] = await pool.execute(
    `SELECT
        id,
        shop_id,
        name,
        email,
        phone,
        password,
        is_active,
        created_at,
        updated_at
     FROM td_customers
     WHERE shop_id = ?
       AND email = ?
     LIMIT 1`,
    [shopId, email],
  );

  return rows[0];
};

// FIND CUSTOMER BY ID
const findCustomerById = async (shopId, customerId) => {
  const [rows] = await pool.execute(
    `SELECT
        id,
        shop_id,
        name,
        email,
        phone,
        is_active,
        created_at,
        updated_at
     FROM td_customers
     WHERE shop_id = ?
       AND id = ?
     LIMIT 1`,
    [shopId, customerId],
  );

  return rows[0];
};

module.exports = {
  createCustomer,
  findCustomerByEmail,
  findCustomerById,
};
