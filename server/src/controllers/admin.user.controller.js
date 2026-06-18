const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { ROLES } = require("../constants/roles");

const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: ROLES.USER })
    .select("-password")
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, users, "Users fetched successfully"),
  );
});

const blockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role !== ROLES.USER) {
    throw new ApiError(400, "Only user accounts can be blocked through this endpoint");
  }

  user.isBlocked = true;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, { id: user._id, isBlocked: user.isBlocked }, "User blocked successfully"),
  );
});

const unblockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.isBlocked = false;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, { id: user._id, isBlocked: user.isBlocked }, "User unblocked successfully"),
  );
});

module.exports = {
  listUsers,
  blockUser,
  unblockUser,
};
