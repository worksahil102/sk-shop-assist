const express = require("express");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const variantRoutes = require("./routes/variantRoutes");
const variantGroupRoutes = require("./routes/variantGroupRoutes");
const variantImageRoutes = require("./routes/variantImageRoutes");
const productCatalogRoutes = require("./routes/productCatalogRoutes");

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Sk shop assist api is running perfect",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1", variantRoutes);
app.use("/api/v1", variantGroupRoutes);
app.use("/api/v1", variantImageRoutes);
app.use("/api/v1", productCatalogRoutes);

module.exports = app;
