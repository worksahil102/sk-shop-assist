const pool = require("../config/database");

const createCategory = async (categoryData) => {
  const [result] = await pool.execute(
    `INSERT INTO td_product_categories (shop_id , name , description) VALUES (?,?,?)`,
    [categoryData.shopId, categoryData.name, categoryData.description || null],
  );
  return result.insertId;
};

const findCategoryByName = async (shopId, name) => {
  const [rows] = await pool.execute(
    `SELECT id , shop_id , name , description , is_active FROM td_product_categories WHERE shop_id = ? AND name = ? LIMIT 1`,
    [shopId, name],
  );
  return rows[0];
};

const findCategoryById = async (shopId, categoryId) => {
  const [rows] = await pool.execute(
    `SELECT id, shop_id, name, description, is_active
     FROM td_product_categories
     WHERE id = ? AND shop_id = ?
     LIMIT 1`,
    [categoryId, shopId],
  );
  return rows[0];
};

const getCategoriesByShop = async (shopId) => {
  const [rows] = await pool.execute(
    `SELECT id, shop_id, name, description, is_active, created_at, updated_at
     FROM td_product_categories
     WHERE shop_id = ?
     ORDER BY id DESC`,
    [shopId],
  );
  return rows;
};

const updateCategory = async (shopId, categoryId, categoryData) => {
  const [result] = await pool.execute(
    `UPDATE td_product_categories
     SET name = ?, description = ?
     WHERE id = ? AND shop_id = ?`,
    [categoryData.name, categoryData.description || null, categoryId, shopId],
  );

  return result.affectedRows;
};

const toggleCategoryStatus = async (shopId, categoryId) => {
  const [result] = await pool.execute(
    `UPDATE td_product_categories
     SET is_active = NOT is_active
     WHERE id = ? AND shop_id = ?`,
    [categoryId, shopId],
  );

  return result.affectedRows;
};

module.exports = {
  createCategory,
  findCategoryById,
  findCategoryByName,
  getCategoriesByShop,
  updateCategory,
  toggleCategoryStatus,
};
