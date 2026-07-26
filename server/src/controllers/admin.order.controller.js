const Order = require("../models/order.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const PRODUCTION_STATUSES = ["order_placed", "designing", "in_production", "quality_check", "ready_to_ship", "shipped", "delivered"];

const listOrders = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 100);
  const [orders, total] = await Promise.all([
    Order.find().populate("customer", "name email").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Order.countDocuments(),
  ]);
  res.json(new ApiResponse(200, { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }, "Orders fetched successfully"));
});

const updateProductionStatus = asyncHandler(async (req, res) => {
  const { productionStatus } = req.body;
  if (!PRODUCTION_STATUSES.includes(productionStatus)) throw new ApiError(400, "Invalid production status");
  const order = await Order.findById(req.params.orderId);
  if (!order) throw new ApiError(404, "Order not found");
  if (order.paymentStatus !== "paid" || order.orderStatus !== "confirmed") throw new ApiError(400, "Only confirmed, paid orders can enter production");
  order.productionStatus = productionStatus;
  order.productionStatusUpdatedAt = new Date();
  await order.save();
  res.json(new ApiResponse(200, order, "Production status updated"));
});

module.exports = { listOrders, updateProductionStatus, PRODUCTION_STATUSES };