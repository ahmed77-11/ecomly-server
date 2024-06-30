const express = require("express");
const {
  register,
  login,
  verifyToken,
  forgetPassword,
  verifyPasswordResetOtp,
  resetPassword,
} = require("../controllers/auth");
const router = express.Router();
const { body } = require("express-validator");
const validateUser = [
  body("name").not().isEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Please Enter a valid email address"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password Must Be At Least 8 Characters")
    .isStrongPassword()
    .withMessage(
      "Password Must Contain At Least one Uppercase,one lowercase,and one symbol",
    ),
  body("phone")
    .isMobilePhone()
    .withMessage("Please Enter a Valid phone Number"),
];

router.post("/login", login);
router.post("/register", validateUser, register);
router.get("/verify-token", verifyToken);
router.post("/forgot-password", forgetPassword);
router.post("/verfiy-otp", verifyPasswordResetOtp);
router.post("/reset-password", resetPassword);
module.exports = router;
