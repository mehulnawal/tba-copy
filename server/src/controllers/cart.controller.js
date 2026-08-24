const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { repriceCartItem } = require("../utils/cartPricing");
const {
  validateSelectedColor,
  validateSelectedSize,
} = require("../utils/productVariants");
const getOrCreateCart = async (user) =>
  (await Cart.findOne({ user })) || Cart.create({ user, items: [] });
const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  if (cart.items.length) {
    const products = await Product.find({
      SKU: { $in: cart.items.map((item) => item.productId) },
    })
      .select("SKU isActive")
      .lean();
    const availableSkus = new Set(
      products
        .filter((product) => product.isActive !== false)
        .map((product) => product.SKU),
    );
    const before = cart.items.length;
    cart.items = cart.items.filter((item) => availableSkus.has(item.productId));
    if (cart.items.length !== before) {
      if (!cart.items.length) cart.appliedCoupon = null;
      await cart.save();
    }
  }
  res.status(200).json(new ApiResponse(200, cart, "Cart fetched successfully"));
});
const addToCart = asyncHandler(async (req, res) => {
  const {
    productId,
    karat = "14kt",
    color = "",
    size = "",
    quantity = 1,
    categoryCouponApplied = false,
  } = req.body;
  if (!productId || !Number.isInteger(Number(quantity)) || Number(quantity) < 1)
    throw new ApiError(400, "A product and valid quantity are required");
  const product = await Product.findOne({ SKU: productId })
    .populate("mainCategory", "name")
    .populate("subCategory", "name");
  if (!product) throw new ApiError(404, "Product not found");
  const colorError = validateSelectedColor(product, String(color));
  if (colorError) throw new ApiError(400, colorError);
  const sizeError = validateSelectedSize(product, size);
  if (sizeError) throw new ApiError(400, sizeError);
  const normalizedSize = String(size || "");
  const cart = await getOrCreateCart(req.user._id);
  let item = cart.items.find(
    (entry) =>
      entry.productId === productId &&
      entry.karat === karat &&
      entry.color === color &&
      entry.size === normalizedSize,
  );
  const image =
    product.images?.find((entry) => String(entry?.url || "").trim())?.url || "";
  if (!image) throw new ApiError(400, "Product requires at least one image");
  if (item) {
    item.quantity += Number(quantity);
    if (categoryCouponApplied) item.categoryCouponApplied = true;
  } else {
    item = cart.items.create({
      productId,
      slug: product.slug,
      name: product.title,
      category: product.subCategory?.name || "",
      image,
      karat,
      color,
      size: normalizedSize,
      price: 0,
      quantity: Number(quantity),
      categoryCouponApplied: Boolean(categoryCouponApplied),
    });
    cart.items.push(item);
  }
  await repriceCartItem(item, product);
  await cart.save();
  res.status(200).json(new ApiResponse(200, cart, "Product added to cart"));
});
const updateCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) throw new ApiError(404, "Cart item not found");
  if (
    !Number.isInteger(Number(req.body.quantity)) ||
    Number(req.body.quantity) < 1
  )
    throw new ApiError(400, "Quantity must be at least 1");
  item.quantity = Number(req.body.quantity);
  const product = await Product.findOne({ SKU: item.productId })
    .populate("mainCategory", "name")
    .populate("subCategory", "name");
  if (!product) throw new ApiError(400, "Product is no longer available");
  await repriceCartItem(item, product);
  await cart.save();
  res.status(200).json(new ApiResponse(200, cart, "Cart item updated"));
});
const setCategoryCoupon = asyncHandler(async (req, res) => {
  const {
    productId,
    karat = "14kt",
    color = "",
    size = "",
    applied,
  } = req.body;
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find(
    (entry) =>
      entry.productId === productId &&
      entry.karat === karat &&
      entry.color === color &&
      entry.size === size,
  );
  if (!item)
    return res
      .status(200)
      .json(new ApiResponse(200, cart, "Cart item not found"));
  const product = await Product.findOne({ SKU: productId })
    .populate("mainCategory", "name")
    .populate("subCategory", "name");
  if (!product) throw new ApiError(400, "Product is no longer available");
  item.categoryCouponApplied = Boolean(applied);
  await repriceCartItem(item, product);
  await cart.save();
  res.status(200).json(new ApiResponse(200, cart, "Category coupon updated"));
});
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) throw new ApiError(404, "Cart item not found");
  item.deleteOne();
  await cart.save();
  res.status(200).json(new ApiResponse(200, cart, "Cart item removed"));
});
const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  cart.appliedCoupon = null;
  await cart.save();
  res.status(200).json(new ApiResponse(200, cart, "Cart cleared"));
});
module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  setCategoryCoupon,
  removeFromCart,
  clearCart,
};
