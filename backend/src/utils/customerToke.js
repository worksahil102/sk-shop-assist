const jwt = require("jsonwebtoken");

const generateCustomerToken = (customerData) => {
  return jwt.sign(
    {
      customerId: customerData.id,
      shopId: customerData.shop_id,
      type: "CUSTOMER",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

module.exports = {
  generateCustomerToken,
};
