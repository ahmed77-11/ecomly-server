const { expressjwt: expjwt } = require("express-jwt");

const { Token } = require("../models/token.js");
const authJwt = () => {
  return expjwt({
    secret: process.env.ACCESS_TOKEN_SECRET,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      "/api/v1/login",
      "/api/v1/login/",
      "/api/v1/register",
      "/api/v1/register/",
      "/api/v1/forgot-password",
      "/api/v1/forgot-password/",
      "/api/v1/verify-otp",
      "/api/v1/verify-otp/",
      "/api/v1/reset-password",
      "/api/v1/reset-password/",
    ],
  });
};
const isRevoked = async (req, jwt) => {
  const authHeader = req.headers["authorization"];
  console.log(authHeader);
  if (!authHeader.startsWith("Bearer ")) return true;
  const accessToken = authHeader.replace("Bearer", "").trim();
  const token = await Token.findOne({ accessToken });

  const adminRouteRegex = /^\/api\/v1\/admin\//i;
  const adminFault =
    !jwt.payload.isAdmin && adminRouteRegex.test(req.OriginalUrl);
  return adminFault || !token;
};
module.exports = authJwt;
