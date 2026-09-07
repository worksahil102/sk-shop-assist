const { findShopBySlug } = require("../models/shopModel");

const shopResolverMiddleware = async (req, res, next) => {
  try {
    let shopSlug = null;

    if (req.query.shop) {
      shopSlug = req.query.shop;
    }
    if (!shopSlug) {
      const host = req.get("host");

      if (host) {
        const hostname = host.split(":")[0];
        const parts = hostname.split(".");

        if (parts.length >= 3) {
          shopSlug = parts[0];
        }
      }
    }

    if (!shopSlug) {
      return res.status(400).json({
        success: false,
        message: "Shop could not be identified",
      });
    }

    const shop = await findShopBySlug(shopSlug);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "shop not found",
      });
    }

    req.shopId = shop.id;
    req.shop = shop;

    next();
  } catch (error) {
    console.error("Shop resolver error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to identify shop",
    });
  }
};

module.exports = shopResolverMiddleware;
