const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const authRouter = require("./routes/auth.js");

require("dotenv").config({});

const app = express();

//midellwares
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("tiny"));
app.options("*", cors());

//routes
//authRoutes

app.use("/api/v1/", authRouter);

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