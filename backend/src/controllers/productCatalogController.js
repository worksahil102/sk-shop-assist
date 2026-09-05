const { getProductCatalog } = require("../models/productCatalogModel");
const getProductCatalogController = async (req, res) => {
  try {
    const shopId = req.user.shopId;

    const rows = await getProductCatalog(shopId);

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
            });
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Product catalog fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error("Get product catalog error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product catalog",
    });
  }
};

module.exports = {
  getProductCatalogController,
};
