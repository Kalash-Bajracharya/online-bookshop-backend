import Cart from "../model/Cart.js";
import Book from "../model/Book.js";

// Add book to cart
export const addToCart = async (req, res) => {
    console.log("Logged in user:", req.user);
  try {
    const { bookId } = req.body;

    // Check if book exists
    const bookExists = await Book.findById(bookId);

    if (!bookExists) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    // Find the logged-in user's cart
    let cart = await Cart.findOne({ user: req.user.id });

    // If cart doesn't exist, create one
    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [{ book: bookId, quantity: 1 }],
      });

      return res.status(201).json({
        message: "Book added to cart",
        cart,
      });
    }

    // Check if this book is already in the cart
    const item = cart.items.find((item) => item.book.toString() === bookId);

    if (item) {
      item.quantity += 1;
    } else {
      cart.items.push({
        book: bookId,
        quantity: 1,
      });
    }

    await cart.save();

    return res.status(200).json({
      message: "Book added to cart",
      cart,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// View cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.book",
    );

    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update book quantity
export const updateCartQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { bookId } = req.params;

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find((item) => item.book.toString() === bookId);

    if (!item) {
      return res.status(404).json({
        message: "Book not found in cart",
      });
    }

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({
      message: "Quantity updated",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove one book from cart
export const removeFromCart = async (req, res) => {
  try {
    const { bookId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter((item) => item.book.toString() !== bookId);

    await cart.save();

    res.status(200).json({
      message: "Book removed from cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear entire cart
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(200).json({
        message: "Cart is already empty",
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      message: "Cart cleared",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
