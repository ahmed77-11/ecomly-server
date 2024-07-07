const { User } = require("../models/user.js");
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email phone isAdmin");
    if (!users) {
      return res.status(404).json({ message: "No users found" });
    }
    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
exports.getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).select(
      "-passwordHash -resetPasswordOtp -resetPasswordOtpExpires -cart",
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      id,
      { name, email, phone },
      { new: true },
    ).select("-passwordHash -resetPasswordOtp -resetPasswordOtpExpires -cart");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    if (error.message.includes("email_1 dup key")) {
      return res.status(409).json({
        type: "userUpdateError",
        message: "We can not update the user with this email address.",
      });
    }
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
