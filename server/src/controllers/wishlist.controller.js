const Wishlist = require("../models/wishlist.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, items: [] });
  }
  return wishlist;
};

const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id);

  res.status(200).json(
    new ApiResponse(200, wishlist.items, "Wishlist fetched successfully"),
  );
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId, slug, name, category, image, price } = req.body;

  if (!productId || !slug || !name || !image || price === undefined) {
    throw new ApiError(400, "Product details are required");
  }

  const wishlist = await getOrCreateWishlist(req.user._id);

  const exists = wishlist.items.some((item) => item.productId === productId);
  if (exists) {
    throw new ApiError(409, "Product is already in wishlist");
  }

  wishlist.items.push({
    productId,
    slug,
    name,
    category: category || "",
    image,
    price,
  });

  await wishlist.save();

  res.status(201).json(
    new ApiResponse(201, wishlist.items, "Product added to wishlist"),
  );
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await getOrCreateWishlist(req.user._id);

  const initialLength = wishlist.items.length;
  wishlist.items = wishlist.items.filter((item) => item.productId !== productId);

  if (wishlist.items.length === initialLength) {
    throw new ApiError(404, "Product not found in wishlist");
  }

  await wishlist.save();

  res.status(200).json(
    new ApiResponse(200, wishlist.items, "Product removed from wishlist"),
  );
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
