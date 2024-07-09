const { Product } = require("../../models/product");
const { upload, deleteImages } = require("../../helpers/media_helper");
const util = require("node:util");
const { Category } = require("../../models/category");
const { MulterError } = require("multer");
const mongoose = require("mongoose");
const { Review } = require("../../models/review");

exports.getProducts = async (req, res) => {};

exports.getProductsCount = async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    if (!productCount) {
      return res.status(404).json({ message: "No products found" });
    }
    return res.status(200).json({ count: productCount });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const uploadImage = util.promisify(
      upload.fields([
        { name: "image", maxCount: 1 },
        { name: "images", maxCount: 10 },
      ]),
    );
    try {
      await uploadImage(res, res);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        type: error.code,
        message: `${error.message}{${error.field}}`,
        storageError: error.storageError,
      });
    }
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(404).json({ message: "Invalid Category" });
    if (category.markedForDeletion) {
      return res.status(404).json({
        message:
          "Category is marked for deletion,you cannot add products to this category",
      });
    }
    const image = req.files["image"][0];
    if (!image) return res.status(400).json({ message: "No file found!" });
    req.body.image = `${req.protocol}://${req.get("host")}/${image.path}`;
    const gallery = req.files["images"];
    const imagesPaths = [];
    if (gallery) {
      gallery.forEach((img) => {
        imagesPaths.push(`${req.protocol}://${req.get("host")}/${img.path}`);
      });
    }
    if (imagesPaths.length > 0) req.body.images = imagesPaths;
    const product = new Product(req.body).save();
    if (!product) {
      return res.status(500).json({ message: "Could not create product" });
    }
    return res.status(201).json(product);
  } catch (error) {
    console.log(error);
    if (error instanceof MulterError) {
      return res
        .status(error.code)
        .json({ type: error.code, message: error.message });
    }
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.editProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    if (
      !mongoose.isValidObjectId(productId) ||
      !(await Product.findById(productId))
    ) {
      return res.status(404).json({ message: "Invalid product id" });
    }
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category)
        return res.status(404).json({ message: "Invalid Category" });
      if (category.markedForDeletion) {
        return res.status(404).json({
          message:
            "Category is marked for deletion,you cannot add products to this category",
        });
      }
      let product = await Product.findByIdAndUpdate(productId);
      if (req.body.images) {
        const limit = 10 - product.images.length;
        const uploadGalllery = util.promisify(
          upload.fields([{ name: "images", maxCount: limit }]),
        );
        try {
          await uploadGalllery(res, res);
        } catch (error) {
          console.log(error);
          return res.status(500).json({
            type: error.code,
            message: `${error.message}{${error.field}}`,
            storageError: error.storageError,
          });
        }
        const imageFiles = req.files["images"];
        const updateGallery = imageFiles && imageFiles.length > 0;
        const imagesPath = [];
        if (uploadGalllery) {
          imageFiles.forEach((img) => {
            imagesPath.push(`${req.protocol}://${req.get("host")}/${img.path}`);
          });
          req.body.images = updateGallery
            ? [...product.images, ...imagesPath]
            : product.images;
        }
      }
      if (req.body.image) {
        const uploadImage = util.promisify(
          upload.single([{ name: "image", maxCount: 1 }]),
        );
        try {
          await uploadImage(res, res);
        } catch (error) {
          console.log(error);
          return res.status(500).json({
            type: error.code,
            message: `${error.message}{${error.field}}`,
            storageError: error.storageError,
          });
        }
        const image = req.files["image"][0];
        if (!image) return res.status(400).json({ message: "No file found!" });
        req.body.image = `${req.protocol}://${req.get("host")}/images/${image.path}`;
      }
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      req.body,
      { new: true },
    );
    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });
    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.log(error);
    if (error instanceof MulterError) {
      return res
        .status(error.code)
        .json({ type: error.code, message: error.message });
    }
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.deleteProductImages = async (req, res) => {
  try {
    const productId = req.params.id;
    const { deletedImagesUrls } = req.body;
    if (
      !mongoose.isValidObjectId(productId) ||
      !Array.isArray(deletedImagesUrls)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid product id or images array" });
    }
    await deleteImages(deletedImagesUrls);
    const product = await Product.findByIdAndUpdate(ProductId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    product.images = product.images.filter(
      (img) => !deletedImagesUrls.includes(img),
    );
    await product.save();
    return res.status(204).end();
  } catch (error) {
    console.log(error);
    if (error.code === "ENOENT") {
      return res.status(404).json({ message: "Image not found" });
    }
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(404).json({ message: "Invalid product " });
    }
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    await deleteImages([product.image, ...product.images], "ENOENT");
    await Review.deleteMany({ _id: { $in: product.reviews } });
    await Product.findByIdAndDelete(productId);
    return res.status(204).end();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
