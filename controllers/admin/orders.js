const { Order } = require("../../models/order");
const { OrderItem } = require("../../models/order_item");

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          select: "name",
          populate: {
            path: "category",
            select: "name",
          },
        },
      })
      .populate("user", "name email")
      .select("-statusHistory")
      .sort({ dateOrdered: -1 });
    if (!orders) {
      return res.status(404).json({ message: "No orders found" });
    }
    return res.status(200).json(orders);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.getOrdersCount = async (req, res) => {
  try {
    const ordersCount = await Order.countDocuments();
    if (!ordersCount) {
      return res.status(404).json({ message: "No orders found" });
    }
    return res.status(200).json({ ordersCount });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.changeOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const newStatus = req.body.status;
    let order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (!order.statusHistory.includes(newStatus)) {
      order.statusHistory.push(newStatus);
    }

    order.status = newStatus;

    order = await order.save();
    return res.status(200).json(order);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    for (const orderItemId of orderItems) {
      await OrderItem.findByIdAndDelete(orderItemId);
    }
    return res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
