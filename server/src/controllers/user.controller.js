const User = require("../models/user.model");
const Address = require("../models/address.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  res.status(200).json(
    new ApiResponse(
      200,
      {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      "Profile fetched successfully",
    ),
  );
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const updates = {};

  if (name) updates.name = name;
  if (phone !== undefined) updates.phone = phone;

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid fields to update");
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.status(200).json(
    new ApiResponse(
      200,
      {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      "Profile updated successfully",
    ),
  );
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current and new password are required");
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, "New password must be at least 8 characters");
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json(new ApiResponse(200, null, "Password changed successfully"));
});

const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({
    isDefault: -1,
    createdAt: -1,
  });

  res.status(200).json(
    new ApiResponse(200, addresses, "Addresses fetched successfully"),
  );
});

const addAddress = asyncHandler(async (req, res) => {
  const {
    fullName,
    phone,
    houseNo,
    area,
    landmark,
    city,
    state,
    pincode,
    country,
    isDefault,
  } = req.body;

  if (!fullName || !phone || !houseNo || !area || !city || !state || !pincode) {
    throw new ApiError(400, "Required address fields are missing");
  }

  if (isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }

  const addressCount = await Address.countDocuments({ user: req.user._id });
  const shouldBeDefault = isDefault || addressCount === 0;

  const address = await Address.create({
    user: req.user._id,
    fullName,
    phone,
    houseNo,
    area,
    landmark,
    city,
    state,
    pincode,
    country: country || "India",
    isDefault: shouldBeDefault,
  });

  res.status(201).json(
    new ApiResponse(201, address, "Address added successfully"),
  );
});

const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const address = await Address.findOne({
    _id: addressId,
    user: req.user._id,
  });

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  const fields = [
    "fullName",
    "phone",
    "houseNo",
    "area",
    "landmark",
    "city",
    "state",
    "pincode",
    "country",
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      address[field] = req.body[field];
    }
  });

  await address.save();

  res.status(200).json(
    new ApiResponse(200, address, "Address updated successfully"),
  );
});

const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const address = await Address.findOneAndDelete({
    _id: addressId,
    user: req.user._id,
  });

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  if (address.isDefault) {
    const nextDefault = await Address.findOne({ user: req.user._id }).sort({
      createdAt: -1,
    });
    if (nextDefault) {
      nextDefault.isDefault = true;
      await nextDefault.save();
    }
  }

  res.status(200).json(new ApiResponse(200, null, "Address deleted successfully"));
});

const setDefaultAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const address = await Address.findOne({
    _id: addressId,
    user: req.user._id,
  });

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  await Address.updateMany({ user: req.user._id }, { isDefault: false });
  address.isDefault = true;
  await address.save();

  res.status(200).json(
    new ApiResponse(200, address, "Default address updated successfully"),
  );
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
