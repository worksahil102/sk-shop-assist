const jwt = require("jsonwebtoken");

const customerAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Customer authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "CUSTOMER") {
      return res.status(401).json({
        success: false,
        message: "Invalid customer token",
      });
    }

    // Customer information from JWT
    req.customerId = decoded.customerId;
    req.customer = decoded;

    // Compare JWT shop with shop from URL/domain
    if (Number(decoded.shopId) !== Number(req.shopId)) {
      return res.status(403).json({
        success: false,
        message: "Customer does not belong to this shop",
      });
    }

    next();
  } catch (error) {
    console.error("Customer authentication error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired customer token",
    });
  }
};

module.exports = customerAuthMiddleware;
