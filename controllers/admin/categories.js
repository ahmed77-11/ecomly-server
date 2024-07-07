const util = require("node:util");
const { Category } = require("../../models/category");
const { upload } = require("../../helpers/media_helper");

exports.addCategory = async (req, res) => {
  try {
    const uploadImage = util.promisify(
      upload.single([{ name: "image", maxCount: 1 }]),
    );
    try {
      await uploadImage(res, res);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        type: error.code,
        message: `${error.message}{${error.field}`,
        storageError: error.storageError,
      });
    }
    const image = req.files["image"][0];
    if (!image) return res.status(400).json({ message: "No file found!" });
    req.body.image = `${req.protocol}://${req.get("host")}/images/${image.path}`;
    let category = new Category(req.body);

    category = await category.save();
    if (!category) {
      return res.status(500).json({ message: "Could not  create category" });
    }
    return res.status(201).json(category);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.editCategory = async (req, res) => {
  try {
    const catId = req.params.id;
    const { name, icon, colour } = req.body;
    const category = await Category.findByIdAndUpdate(
      catId,
      {
        name: name,
        icon: icon,
        colour: colour,
      },
      { new: true },
    );
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    return res.json(category);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    category.markForDeletion = true;
    await category.save();
    return res.status(204).end();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
