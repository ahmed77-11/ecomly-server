const express = require("express");
const {
  getUsersCount,
  deleteUser,
  addCategory,
  editCategory,
  deleteCategory,
  getOrders,
  getOrdersCount,
  changeOrderStatus,
  deleteProductImages,
  editProduct,
  addProduct,
  getProductsCount,
  deleteProduct,
} = require("../controllers/admin");

const router = express.Router();

//users
router.get("/users/count", getUsersCount);
router.delete("/users/:id", deleteUser);

//categories
router.post("/categories", addCategory);
router.put("/categories/:id", editCategory);
router.delete("/categories/:id", deleteCategory);

//products
router.get("/products/count", getProductsCount);
router.post("/products", addProduct);
router.put("/products/:id", editProduct);
router.delete("/products/:id/images", deleteProductImages);
router.delete("/products/:id", deleteProduct);

//orders
router.get("/orders", getOrders);
router.get("/orders/count", getOrdersCount);
router.put("/orders/:id", changeOrderStatus);

module.exports = router;
