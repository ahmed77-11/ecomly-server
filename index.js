const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const authRouter = require("./routes/auth.js");
const userRouter = require("./routes/users.js");
const adminRouter = require("./routes/admin.js");
const authJwt = require("./middlewares/jwt");
const errorHandler = require("./middlewares/error_handler");

require("dotenv").config({});

const app = express();

//middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("tiny"));
app.options("*", cors());
app.use(authJwt());
app.use(errorHandler);

//routes
//authRoutes
app.use("/api/v1/", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRouter);

//database connection
mongoose
  .connect(process.env.MONGODB)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.listen(process.env.PORT, process.env.HOSTNAME, () => {
  console.log("server is listing in port 3000");
});
