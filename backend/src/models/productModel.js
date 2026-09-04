const pool = require("../config/database");

const createProduct = async (productData) => {
  const [result] = await pool.execute(
    `INSERT INTO td_products
      (shop_id, category_id, name, description, brand)
     VALUES (?, ?, ?, ?, ?)`,
    [
      productData.shopId,
      productData.categoryId,
      productData.name,
      productData.description || null,
      productData.brand || null,
    ],
  );
  return result.insertId;
};

const findProductById = async (shopId, productId) => {
  const [rows] = await pool.execute(
    `SELECT
        id,
        shop_id,
        category_id,
        name,
        description,
        brand,
        is_active,
        created_at,
        updated_at
     FROM td_products
     WHERE id = ? AND shop_id = ?
     LIMIT 1`,
    [productId, shopId],
  );
  return rows[0];
};

const findProductByName = async (shopId, name) => {
  const [rows] = await pool.execute(
    `SELECT
        id,
        shop_id,
        category_id,
        name,
        description,
        brand,
        is_active
     FROM td_products
     WHERE shop_id = ? AND name = ?
     LIMIT 1`,
    [shopId, name],
  );
  return rows[0];
};

const getProductByShop = async (shopId) => {
  const [rows] = await pool.execute(
    `SELECT
        p.id,
        p.shop_id,
        p.category_id,
        p.name,
        p.description,
        p.brand,
        p.is_active,
        p.created_at,
        p.updated_at,
        c.name AS category_name
     FROM td_products p
     INNER JOIN td_product_categories c
        ON p.category_id = c.id
     WHERE p.shop_id = ?
     ORDER BY p.id DESC`,
    [shopId],
  );
  return rows;
};

const updateProduct = async (shopId, productId, productData) => {
  const [result] = await pool.execute(
    `UPDATE td_products
     SET
        category_id = ?,
        name = ?,
        description = ?,
        brand = ?
     WHERE id = ? AND shop_id = ?`,
    [
      productData.categoryId,
      productData.name,
      productData.description || null,
      productData.brand || null,
      productId,
      shopId,
    ],
  );

  return result.affectedRows;
};

const toggleProductStatus = async (shopId, productId) => {
  const [result] = await pool.execute(
    `UPDATE td_products
     SET is_active = NOT is_active
     WHERE id = ? AND shop_id = ?`,
    [productId, shopId],
  );

  return result.affectedRows;
};

module.exports = {
  createProduct,
  findProductById,
  findProductByName,
  getProductByShop,
  updateProduct,
  toggleProductStatus,
};
