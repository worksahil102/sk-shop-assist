const bcrypt = require("bcrypt");

const {
  createCustomer,
  findCustomerByEmail,
} = require("../models/customerModel");
const { generateCustomerToken } = require("../utils/customerToke");

const signupCustomerController = async (req, res) => {
  try {
    const shopId = req.shopId;

    const { name, email, phone, password } = req.body;

    // Required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check existing customer in THIS shop
    const existingCustomer = await findCustomerByEmail(shopId, email);

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Customer already exists with this email",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create customer
    const customerId = await createCustomer({
      shopId,
      name,
      email,
      phone,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      data: {
        customerId,
        name,
        email,
        phone: phone || null,
        shopId,
      },
    });
  } catch (error) {
    console.error("Customer signup error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to register customer",
    });
  }
};

const loginCustomerController = async (req, res) => {
  try {
    const shopId = req.shopId;

    const { email, password } = req.body;

    if ((!email, !password)) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const customer = await findCustomerByEmail(shopId, email);

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!customer.is_active) {
      return res.status(403).json({
        success: false,
        message: "Customer account is inactive",
      });
    }

    const passwordMatch = await bcrypt.compare(password, customer.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateCustomerToken(customer);

    return res.status(200).json({
      success: true,
      message: "Customer login successful",

      data: {
        token,
        customer: {
          id: customer.id,
          shopId: customer.shop_id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
      },
    });
  } catch (error) {
    console.error("Customer login error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to login customer",
    });
  }
};

module.exports = {
  signupCustomerController,
  loginCustomerController,
};
