const express = require("express");

const {
  signupCustomerController,
  loginCustomerController,
} = require("../controllers/customerController");

const shopResolverMiddleware = require("../middleware/shopResolverMiddleware");

const router = express.Router();

router.post("/signup", shopResolverMiddleware, signupCustomerController);

router.post("/login", shopResolverMiddleware, loginCustomerController);
module.exports = router;
