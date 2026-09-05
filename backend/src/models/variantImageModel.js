const pool = require("../config/database");

// CREATE IMAGE
const createVariantImage = async (imageData) => {
  const [result] = await pool.execute(
    `INSERT INTO td_product_variant_images
      (
        variant_group_id,
        image_url,
        is_primary,
        sort_order
      )
     VALUES (?, ?, ?, ?)`,
    [
      imageData.variantGroupId,
      imageData.imageUrl,
      imageData.isPrimary || false,
      imageData.sortOrder || 0,
    ],
  );

  return result.insertId;
};

// GET IMAGES BY VARIANT GROUP
const getVariantImagesByGroup = async (variantGroupId) => {
  const [rows] = await pool.execute(
    `SELECT
        id,
        variant_group_id,
        image_url,
        is_primary,
        sort_order,
        created_at
     FROM td_product_variant_images
     WHERE variant_group_id = ?
     ORDER BY sort_order ASC, id ASC`,
    [variantGroupId],
  );

  return rows;
};

// FIND IMAGE BY ID
const findVariantImageById = async (variantGroupId, imageId) => {
  const [rows] = await pool.execute(
    `SELECT
        id,
        variant_group_id,
        image_url,
        is_primary,
        sort_order,
        created_at
     FROM td_product_variant_images
     WHERE id = ?
       AND variant_group_id = ?
     LIMIT 1`,
    [imageId, variantGroupId],
  );

  return rows[0];
};

// DELETE IMAGE
const deleteVariantImage = async (variantGroupId, imageId) => {
  const [result] = await pool.execute(
    `DELETE FROM td_product_variant_images
     WHERE id = ?
       AND variant_group_id = ?`,
    [imageId, variantGroupId],
  );

  return result.affectedRows;
};

module.exports = {
  createVariantImage,
  getVariantImagesByGroup,
  findVariantImageById,
  deleteVariantImage,
};
