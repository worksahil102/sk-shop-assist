const bcrypt = require("bcrypt");
const pool = require("../config/database");
const {
  findUserByEmail,
  createShop,
  createUser,
  findRoleById,
} = require("../models/authModel");
const { generateToken } = require("../utils/jwt");

const createShopController = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { name, phone, email, address } = req.body;

    // 1. Validate required field
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Shop name is required",
      });
    }

    // 2. Create shop slug
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // 3. Start transaction
    await connection.beginTransaction();

    // 4. Create shop
    const shopId = await createShop(connection, {
      name,
      slug,
      phone: phone || null,
      email: email || null,
      address: address || null,
    });

    // 5. Commit transaction
    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Shop created successfully",
      data: {
        shopId,
        name,
        slug,
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error("Create shop error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create shop",
    });
  } finally {
    connection.release();
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are reuired",
      });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Your acount is inactive",
      });
    }

    const isPassoedValid = await bcrypt.compare(password, user.password_hash);

    if (!isPassoedValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken({
      userId: user.id,
      shopId: user.shop_id,
      roleId: user.role_id,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        userId: user.id,
        shopId: user.shop_id,
        email: user.email,
        role: user.role_id,
      },
    });
  } catch (error) {
    console.error("Login error :", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

const createUserController = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { shopId, name, email, password, roleId } = req.body;

    // 1. Validate required fields
    if (!shopId || !name || !email || !password || !roleId) {
      return res.status(400).json({
        success: false,
        message: "Shop ID, name, email, password and role are required",
      });
    }

    // 2. Only ADMIN (2) and USER (3) can be created
    if (![2, 3].includes(Number(roleId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Only Owner (2) and Manager (3) can be created",
      });
    }

    // 3. Check whether email already exists
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // 4. Check whether role exists
    const role = await findRoleById(Number(roleId));

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // 5. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 6. Start transaction
    await connection.beginTransaction();

    // 7. Create user
    const userId = await createUser(connection, {
      shopId: Number(shopId),
      name,
      email,
      passwordHash,
      roleId: Number(roleId),
    });

    // 8. Commit transaction
    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "User account created successfully",
      data: {
        userId,
        shopId: Number(shopId),
        name,
        email,
        role: {
          id: role.id,
          name: role.name,
        },
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error("Create user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create user account",
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  login,
  createShopController,
  createUserController,
};
