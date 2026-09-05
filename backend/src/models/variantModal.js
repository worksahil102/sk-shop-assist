const pool = require("../config/database");

// CREATE VARIANT
const createVariant = async (variantData) => {
  const [result] = await pool.execute(
    `INSERT INTO td_product_variants
      (
        product_id,
        variant_group_id,
        sku,
        size,
        price,
        mrp,
        barcode,
        stock_quantity
      )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      variantData.productId,
      variantData.variantGroupId,
      variantData.sku,
      variantData.size || null,
      variantData.price,
      variantData.mrp || null,
      variantData.barcode || null,
      variantData.stockQuantity || 0,
    ],
  );

  return result.insertId;
};

// FIND VARIANT BY ID
const findVariantById = async (productId, variantId) => {
  const [rows] = await pool.execute(
    `SELECT
        id,
        product_id,
        variant_group_id,
        sku,
        size,
        price,
        mrp,
        barcode,
        stock_quantity,
        is_active,
        created_at,
        updated_at
     FROM td_product_variants
     WHERE id = ? AND product_id = ?
     LIMIT 1`,
    [variantId, productId],
  );

  return rows[0];
};

// FIND VARIANT BY SKU
const findVariantBySku = async (sku) => {
  const [rows] = await pool.execute(
    `SELECT
        id,
        product_id,
        variant_group_id,
        sku,
        size,
        price,
        mrp,
        barcode,
        stock_quantity,
        is_active
     FROM td_product_variants
     WHERE sku = ?
     LIMIT 1`,
    [sku],
  );

  return rows[0];
};

// FIND VARIANT BY BARCODE
const findVariantByBarcode = async (barcode) => {
  const [rows] = await pool.execute(
    `SELECT
        id,
        product_id,
        variant_group_id,
        sku,
        size,
        price,
        mrp,
        barcode,
        stock_quantity,
        is_active
     FROM td_product_variants
     WHERE barcode = ?
     LIMIT 1`,
    [barcode],
  );

  return rows[0];
};

// GET ALL VARIANTS OF A PRODUCT
const getVariantsByProduct = async (productId) => {
  const [rows] = await pool.execute(
    `SELECT
        v.id,
        v.product_id,
        v.variant_group_id,
        vg.name AS variant_group_name,
        v.sku,
        v.size,
        v.price,
        v.mrp,
        v.barcode,
        v.stock_quantity,
        v.is_active,
        v.created_at,
        v.updated_at
     FROM td_product_variants v
     INNER JOIN td_product_variant_groups vg
        ON v.variant_group_id = vg.id
     WHERE v.product_id = ?
     ORDER BY v.id DESC`,
    [productId],
  );

  return rows;
};

// UPDATE VARIANT
const updateVariant = async (productId, variantId, variantData) => {
  const [result] = await pool.execute(
    `UPDATE td_product_variants
     SET
        variant_group_id = ?,
        sku = ?,
        size = ?,
        price = ?,
        mrp = ?,
        barcode = ? ,
        stock_quantity = ?
     WHERE id = ? AND product_id = ?`,
    [
      variantData.variantGroupId,
      variantData.sku,
      variantData.size || null,
      variantData.price,
      variantData.mrp || null,
      variantData.barcode || null,
      variantId,
      productId,
    ],
  );

  return result.affectedRows;
};

// TOGGLE VARIANT STATUS
const toggleVariantStatus = async (productId, variantId) => {
  const [result] = await pool.execute(
    `UPDATE td_product_variants
     SET is_active = NOT is_active
     WHERE id = ? AND product_id = ?`,
    [variantId, productId],
  );

  return result.affectedRows;
};

module.exports = {
  createVariant,
  findVariantById,
  findVariantBySku,
  findVariantByBarcode,
  getVariantsByProduct,
  updateVariant,
  toggleVariantStatus,
};
