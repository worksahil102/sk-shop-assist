const pool = require("../config/database");

// GET ALL ACTIVE PRODUCTS WITH VARIANTS AND IMAGES
const getProductCatalog = async (shopId) => {
  const [rows] = await pool.execute(
    `SELECT
        p.id AS product_id,
        p.name AS product_name,
        p.description,
        p.brand,

        c.id AS category_id,
        c.name AS category_name,

        vg.id AS variant_group_id,
        vg.name AS variant_group_name,

        vi.id AS image_id,
        vi.image_url,
        vi.is_primary,
        vi.sort_order,

        v.id AS variant_id,
        v.sku,
        v.size,
        v.price,
        v.mrp,
        v.barcode

     FROM td_products p

     INNER JOIN td_product_categories c
        ON p.category_id = c.id

     LEFT JOIN td_product_variant_groups vg
        ON p.id = vg.product_id
        AND vg.is_active = TRUE

     LEFT JOIN td_product_variant_images vi
        ON vg.id = vi.variant_group_id

     LEFT JOIN td_product_variants v
        ON vg.id = v.variant_group_id
        AND v.product_id = p.id
        AND v.is_active = TRUE

     WHERE p.shop_id = ?
       AND p.is_active = TRUE
       AND c.is_active = TRUE

     ORDER BY
        p.id DESC,
        vg.id ASC,
        vi.sort_order ASC,
        vi.id ASC,
        v.id ASC`,
    [shopId],
  );

  return rows;
};

module.exports = {
  getProductCatalog,
};
