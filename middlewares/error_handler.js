const { Token } = require("../models/token");
const jwt = require("jsonwebtoken"); // Corrected the import
const { User } = require("../models/user");

const errorHandler = async (err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    if (!err.message.includes("jwt expired")) {
      return res
        .status(err.status)
        .json({ type: err.name, message: err.message });
    }
    try {
      const tokenHeader = req.headers.authorization;
      const accessToken = tokenHeader?.split(" ")[1];
      const token = await Token.findOne({
        accessToken,
        refreshToken: { $exists: true },
      });
      if (!token) {
        return res
          .status(401)
          .json({ type: "Unauthorized", message: "Token not found" }); // Corrected message
      }
      const userData = jwt.verify(
        token.refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
      );
      const user = await User.findById(userData.id);
      if (!user) {
        return res.status(404).json({ message: "Invalid User" }); // Corrected message
      }
      const newAccessToken = jwt.sign(
        { id: user.id, isAdmin: user.isAdmin },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "24h" },
      );

      await Token.updateOne(
        { _id: token._id },
        { accessToken: newAccessToken },
      ).exec();

      // Set new access token in response headers
      res.set("Authorization", `Bearer ${newAccessToken}`);

      // Call next() to proceed with the request
      return next();
    } catch (refreshError) {
      return res
        .status(401)
        .json({ type: "Unauthorized", message: refreshError.message });
    }
  }
  return res.status(404).json({ type: err.name, message: err.message });
};

module.exports = errorHandler;
