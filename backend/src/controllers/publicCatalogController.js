const { getPublicProductCatalog } = require("../models/productCatalogModel");

const getPublicProductCatalogController = async (req, res) => {
  try {
    const shopId = req.shopId;

    const rows = await getPublicProductCatalog(shopId);

    const products = [];

    for (const row of rows) {
      let product = products.find((item) => item.productId === row.product_id);

      if (!product) {
        product = {
          productId: row.product_id,
          name: row.product_name,
          description: row.description,
          brand: row.brand,

          category: {
            id: row.category_id,
            name: row.category_name,
          },

          variantGroups: [],
        };

        products.push(product);
      }

      // Variant Group / Color
      if (row.variant_group_id) {
        let variantGroup = product.variantGroups.find(
          (item) => item.id === row.variant_group_id,
        );

        if (!variantGroup) {
          variantGroup = {
            id: row.variant_group_id,
            name: row.variant_group_name,
            images: [],
            variants: [],
          };

          product.variantGroups.push(variantGroup);
        }

        // Images
        if (row.image_id) {
          const imageExists = variantGroup.images.some(
            (image) => image.id === row.image_id,
          );

          if (!imageExists) {
            variantGroup.images.push({
              id: row.image_id,
              imageUrl: row.image_url,
              isPrimary: row.is_primary,
              sortOrder: row.sort_order,
            });
          }
        }

        // Variants / Sizes
        if (row.variant_id) {
          const variantExists = variantGroup.variants.some(
            (variant) => variant.id === row.variant_id,
          );

          if (!variantExists) {
            variantGroup.variants.push({
              id: row.variant_id,
              sku: row.sku,
              size: row.size,
              price: row.price,
              mrp: row.mrp,
              barcode: row.barcode,
              stockQuantity: row.stock_quantity,
            });
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Public product catalog fetched successfully",
      shop: req.shop,
      data: products,
    });
  } catch (error) {
    console.error("Get public product catalog error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch public product catalog",
    });
  }
};

module.exports = {
  getPublicProductCatalogController,
};
