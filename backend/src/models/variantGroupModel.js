const pool = require("../config/database");

// CREATE VARIANT GROUP
// Example: Black, White, Blue
const createVariantGroup = async (groupData) => {
  const [result] = await pool.execute(
    `INSERT INTO td_product_variant_groups
      (product_id, name)
     VALUES (?, ?)`,
    [groupData.productId, groupData.name],
  );

  return result.insertId;
};

// FIND VARIANT GROUP BY ID
const findVariantGroupById = async (productId, groupId) => {
  const [rows] = await pool.execute(
    `SELECT
        id,
        product_id,
        name,
        is_active,
        created_at,
        updated_at
     FROM td_product_variant_groups
     WHERE id = ? AND product_id = ?
     LIMIT 1`,
    [groupId, productId],
  );

  return rows[0];
};

// FIND VARIANT GROUP BY NAME
const findVariantGroupByName = async (productId, name) => {
  const [rows] = await pool.execute(
    `SELECT
        id,
        product_id,
        name,
        is_active
     FROM td_product_variant_groups
     WHERE product_id = ? AND name = ?
     LIMIT 1`,
    [productId, name],
  );

  return rows[0];
};

// GET ALL VARIANT GROUPS OF A PRODUCT
const getVariantGroupsByProduct = async (productId) => {
  const [rows] = await pool.execute(
    `SELECT
        id,
        product_id,
        name,
        is_active,
        created_at,
        updated_at
     FROM td_product_variant_groups
     WHERE product_id = ?
     ORDER BY id DESC`,
    [productId],
  );

  return rows;
};

// UPDATE VARIANT GROUP
const updateVariantGroup = async (productId, groupId, groupData) => {
  const [result] = await pool.execute(
    `UPDATE td_product_variant_groups
     SET name = ?
     WHERE id = ? AND product_id = ?`,
    [groupData.name, groupId, productId],
  );

  return result.affectedRows;
};

// TOGGLE VARIANT GROUP STATUS
const toggleVariantGroupStatus = async (productId, groupId) => {
  const [result] = await pool.execute(
    `UPDATE td_product_variant_groups
     SET is_active = NOT is_active
     WHERE id = ? AND product_id = ?`,
    [groupId, productId],
  );

  return result.affectedRows;
};

module.exports = {
  createVariantGroup,
  findVariantGroupById,
  findVariantGroupByName,
  getVariantGroupsByProduct,
  updateVariantGroup,
  toggleVariantGroupStatus,
};
