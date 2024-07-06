const { Schema, model } = require("mongoose");

const tokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  refreshToken: { type: String, required: true },
  accessToken: String,
  createdAt: { type: Date, default: Date.now(), expires: 60 * 86400 },
});

tokenSchema.set("toObject", { virtuals: true });
tokenSchema.set("toJSON", { virtuals: true });

exports.Token = model("Token", tokenSchema);
