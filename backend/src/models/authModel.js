const pool = require("../config/database");

const findUserByEmail = async (email) => {
  const [rows] = await pool.execute(
    "SELECT id, shop_id, name, email, password_hash, role_id, is_active FROM td_users_data WHERE email = ? LIMIT 1",
    [email],
  );

  return rows[0];
};

const findRoleById = async (roleId) => {
  const [rows] = await pool.execute(
    "SELECT id , name FROM td_user_roles WHERE id = ? LIMIT 1",
    [roleId],
  );
  return rows[0];
};

const createShop = async (connection, shopData) => {
  const [result] = await connection.execute(
    `INSERT INTO td_client_shopes 
      (name, slug, phone, email, address)
     VALUES (?, ?, ?, ?, ?)`,
    [
      shopData.name,
      shopData.slug,
      shopData.phone,
      shopData.email,
      shopData.address,
    ],
  );

  return result.insertId;
};

const createUser = async (connection, userData) => {
  const [result] = await connection.execute(
    `INSERT INTO td_users_data
      (shop_id, name, email, password_hash, role_id)
     VALUES (?, ?, ?, ?, ?)`,
    [
      userData.shopId,
      userData.name,
      userData.email,
      userData.passwordHash,
      userData.roleId,
    ],
  );

  return result.insertId;
};

module.exports = {
  findUserByEmail,
  findRoleById,
  createShop,
  createUser,
};
