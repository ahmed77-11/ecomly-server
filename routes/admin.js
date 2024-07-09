const express = require("express");

const { getUsersCount, deleteUser } = require("../controllers/admin/users.js");
const {
  addCategory,
  editCategory,
  deleteCategory,
} = require("../controllers/admin/categories.js");
const {
  deleteProductImages,
  editProduct,
  addProduct,
  getProductsCount,
  deleteProduct,
  getProducts,
} = require("../controllers/admin/products");
const {
  getOrders,
  getOrdersCount,
  changeOrderStatus,
  deleteOrder,
} = require("../controllers/admin/orders");

const router = express.Router();

//users
router.get("/users/count", getUsersCount);
router.delete("/users/:id", deleteUser);

//categories.js
router.post("/categories", addCategory);
router.put("/categories/:id", editCategory);
router.delete("/categories/:id", deleteCategory);

//products
router.get("/products", getProducts);
router.get("/products/count", getProductsCount);
router.post("/products", addProduct);
router.put("/products/:id", editProduct);
router.delete("/products/:id/images", deleteProductImages);
router.delete("/products/:id", deleteProduct);

//orders
router.get("/orders", getOrders);
router.get("/orders/count", getOrdersCount);
router.put("/orders/:id", changeOrderStatus);
router.delete("/orders/:id", deleteOrder);

module.exports = router;
