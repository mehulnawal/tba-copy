const Banner = require("../models/banner.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { uploadToCloudinary } = require("../utils/cloudinaryUpload");

const getActiveBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, banners, "Active banners fetched successfully"),
  );
});

const createBanner = asyncHandler(async (req, res) => {
  const { title, link, order, isActive } = req.body;

  let imageUrl = req.body.image || null;

  if (req.file) {
    imageUrl = await uploadToCloudinary(req.file);
  }

  if (!imageUrl) {
    throw new ApiError(400, "Banner image is required");
  }

  const banner = await Banner.create({
    title: title || "",
    image: imageUrl,
    mobileImage: req.body.mobileImage || imageUrl,
    link: link || "",
    order: order || 0,
    isActive: isActive !== undefined ? isActive : true,
    createdBy: req.admin._id,
  });

  res.status(201).json(
    new ApiResponse(201, banner, "Banner created successfully"),
  );
});

const updateBanner = asyncHandler(async (req, res) => {
  const { bannerId } = req.params;

  const banner = await Banner.findById(bannerId);
  if (!banner) {
    throw new ApiError(404, "Banner not found");
  }

  const fields = ["title", "link", "order", "mobileImage"];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      banner[field] = req.body[field];
    }
  });

  if (req.file) {
    const imageUrl = await uploadToCloudinary(req.file);
    banner.image = imageUrl;
    if (!banner.mobileImage) {
      banner.mobileImage = imageUrl;
    }
  } else if (req.body.image) {
    banner.image = req.body.image;
  }

  await banner.save();

  res.status(200).json(
    new ApiResponse(200, banner, "Banner updated successfully"),
  );
});

const deleteBanner = asyncHandler(async (req, res) => {
  const { bannerId } = req.params;

  const banner = await Banner.findByIdAndDelete(bannerId);
  if (!banner) {
    throw new ApiError(404, "Banner not found");
  }

  res.status(200).json(new ApiResponse(200, null, "Banner deleted successfully"));
});

const listBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort({ order: 1, createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, banners, "Banners fetched successfully"),
  );
});

const activateBanner = asyncHandler(async (req, res) => {
  const { bannerId } = req.params;

  const banner = await Banner.findByIdAndUpdate(
    bannerId,
    { isActive: true },
    { new: true },
  );

  if (!banner) {
    throw new ApiError(404, "Banner not found");
  }

  res.status(200).json(
    new ApiResponse(200, banner, "Banner activated successfully"),
  );
});

const deactivateBanner = asyncHandler(async (req, res) => {
  const { bannerId } = req.params;

  const banner = await Banner.findByIdAndUpdate(
    bannerId,
    { isActive: false },
    { new: true },
  );

  if (!banner) {
    throw new ApiError(404, "Banner not found");
  }

  res.status(200).json(
    new ApiResponse(200, banner, "Banner deactivated successfully"),
  );
});

module.exports = {
  getActiveBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  listBanners,
  activateBanner,
  deactivateBanner,
};
