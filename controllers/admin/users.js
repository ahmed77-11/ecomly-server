const { User: Users } = require("../../models/user");
const { Order } = require("../../models/order");
const { OrderItem } = require("../../models/order_item");
const { CartProduct } = require("../../models/cart_product");
const { Token } = require("../../models/token");

exports.getUsersCount = async (_, res) => {
  try {
    const usersCount = await Users.countDocuments();
    if (!usersCount)
      return res.status(500).json({ message: "Could Not Count Users" });
    return res.json({ usersCount });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ type: err.name, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await Users.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "Users Not Found!" });
    const orders = await Order.find({ user: userId });
    const orderItemIds = orders.flatMap((order) => order.orderItems);
    await Order.deleteMany({ user: userId });
    await OrderItem.deleteMany({ _id: { $in: orderItemIds } });
    await CartProduct.deleteMany({ _id: { $in: user.cart } });
    await Users.findByIdAndUpdate(userId, {
      $pull: { cart: { $exists: true } },
    });
    await Token.deleteOne({ userId });
    await Users.deleteOne({ _id: userId });

    return res.status(204).end();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ type: err.name, message: err.message });
  }
};
