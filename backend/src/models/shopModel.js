const pool = require("../config/database");

const findShopBySlug = async (slug) => {
  const [rows] = await pool.execute(
    `SELECT id , name , slug  FROM td_client_shopes WHERE slug = ?  LIMIT 1`,
    [slug],
  );
  return rows[0];
};

module.exports = {
  findShopBySlug,
};
