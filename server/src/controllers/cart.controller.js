const Cart = require("../models/cart.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);

  res.status(200).json(
    new ApiResponse(200, cart, "Cart fetched successfully"),
  );
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, slug, name, category, image, price, quantity = 1, inStock = true } =
    req.body;

  if (!productId || !slug || !name || !image || price === undefined) {
    throw new ApiError(400, "Product details are required");
  }

  const cart = await getOrCreateCart(req.user._id);
  const existingItem = cart.items.find((item) => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.price = price;
    existingItem.name = name;
    existingItem.image = image;
    existingItem.category = category || existingItem.category;
    existingItem.inStock = inStock;
  } else {
    cart.items.push({
      productId,
      slug,
      name,
      category: category || "",
      image,
      price,
      quantity,
      inStock,
    });
  }

  await cart.save();

  res.status(200).json(
    new ApiResponse(200, cart, "Product added to cart"),
  );
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    throw new ApiError(400, "Quantity must be at least 1");
  }

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(itemId);

  if (!item) {
    throw new ApiError(404, "Cart item not found");
  }

  item.quantity = quantity;
  await cart.save();

  res.status(200).json(
    new ApiResponse(200, cart, "Cart item updated successfully"),
  );
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(itemId);

  if (!item) {
    throw new ApiError(404, "Cart item not found");
  }

  item.deleteOne();
  await cart.save();

  res.status(200).json(
    new ApiResponse(200, cart, "Item removed from cart"),
  );
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  cart.appliedCoupon = null;
  await cart.save();

  res.status(200).json(
    new ApiResponse(200, cart, "Cart cleared successfully"),
  );
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
