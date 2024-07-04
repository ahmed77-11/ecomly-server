const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user.js");
const { Token } = require("../models/token.js");
const { sendEmail } = require("../helpers/email_sender");

exports.register = async (req, res) => {
  //validate the user
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    const errorsMessages = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }));
    return res.status(400).json(errorsMessages);
  }
  //tap into the database and create a new user in the users collection in the database
  try {
    let user = new User({
      ...req.body,
      passwordHash: bcrypt.hashSync(req.body.password, 8),
    });
    user = await user.save();

    if (!user) {
      return res.status(500).json({
        type: "Internal Server Errror",
        message: "Could not Create A New User",
      });
    }
    return res.status(201).json(user);
  } catch (error) {
    if (error.message.includes("email_1 dup key")) {
      return res.status(409).json({
        type: "AuthError",
        message: "User With That Email Already Exist",
      });
    }
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Check your email and try again." });
    }

    if (!bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(400).json({ message: "Incorrect password." });
    }

    const accessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" },
    );

    const refreshToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "60d",
      },
    );

    const token = await Token.findOneAndDelete({ userId: user._id });

    if (token) await token.deleteOne();

    await new Token({
      userId: user._id,
      accessToken,
      refreshToken,
    }).save();

    user.passwordHash = undefined;

    return res.json({ ...user._doc, accessToken, refreshToken });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
exports.verifyToken = async (req, res) => {
  try {
    let accessToken = req.headers.authorization;
    accessToken = accessToken.replace("Bearer", "").trim();
    const token = await Token.findOne({ accessToken });
    if (!token) return res.json(false);

    const tokenData = jwt.decode(token.refreshToken);
    const user = await User.findById(tokenData.id);
    if (!user) return res.json(false);

    const isValid = jwt.verify(
      token.refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
    if (!isValid) return res.json(false);

    return res.json(false);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(1000 + Math.random() * 90000);

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = Date.now() + 600000; // 10 minutes
    await user.save();

    const response = await sendEmail(
      email,
      "Password Reset OTP",
      `Your Password Reset OTP is ${otp}`,
    );
    console.log(response);
    if (response.statusCode === 500)
      return res.status(500).json({ message: "Error sending email" });
    if (response.statusCode === 200)
      return res.json({ message: "Password reset OTP sent to your email" });
    return res.status(500).json({ message: "something went wrong" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
exports.verifyPasswordResetOtp = async (req, res) => {
  //validate the user
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    const errorsMessages = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }));
    return res.status(400).json(errorsMessages);
  }
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found!" });
    if (
      user.resetPasswordOtp !== +otp ||
      user.resetPasswordOtpExpires < Date.now()
    )
      return res.status(400).json({ message: "Invalid or expired OTP" });
    user.resetPasswordOtp = 1;
    user.resetPasswordOtpExpires = undefined;
    await user.save();
    return res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.resetPasswordOtp !== 1) {
      return res.status(401).json({ message: "Please verify your OTP first" });
    }
    user.passwordHash = bcrypt.hashSync(newPassword, 8);
    user.resetPasswordOtp = undefined;
    await user.save();
    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
