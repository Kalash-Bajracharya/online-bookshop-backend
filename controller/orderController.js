import Cart from "../model/Cart.js";
import Book from "../model/Book.js";
import Order from "../model/Order.js";
import User from "../model/User.js";
import sendEmail from "../config/sendEmail.js";

// Create an order from the logged-in user's cart
export const createOrder = async (req, res) => {
  try {
    const { paymentMethod, shippingAddress } = req.body;

    // Check payment method
    if (!["COD", "ESEWA", "KHALTI"].includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    // Get the logged-in user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Use edited checkout details, or fall back to profile details
    const address = {
      name: shippingAddress?.name?.trim() || user.name,
      phone: shippingAddress?.phone?.trim() || user.phone,
      address: shippingAddress?.address?.trim() || user.address,
    };

    if (!address.name || !address.phone || !address.address) {
      return res.status(400).json({
        message: "Please provide all delivery details",
      });
    }

    // Get the user's cart and book information
    const cart = await Cart.findOne({
      user: req.user.id,
    }).populate("items.book");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty",
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    // Calculate prices using MongoDB data
    for (const item of cart.items) {
      const book = item.book;

      if (!book) {
        return res.status(400).json({
          message: "A book in your cart no longer exists",
        });
      }

      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return res.status(400).json({
          message: "Invalid book quantity",
        });
      }

      if (book.stock < item.quantity) {
        return res.status(400).json({
          message: `${book.title} does not have enough stock`,
        });
      }

      totalAmount += book.price * item.quantity;

      orderItems.push({
        book: book._id,
        title: book.title,
        price: book.price,
        quantity: item.quantity,
      });
    }

    // Save the order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress: address,
      totalAmount,
      paymentMethod,
      paymentStatus: "PENDING",
    });

    // For COD, reserve stock and clear the cart.
    // Online orders will be finalized after payment verification.
    // Clear cart for COD orders
    if (paymentMethod === "COD") {
      await Cart.findOneAndDelete({
        user: req.user.id,
      });
    }

    return res.status(201).json({
      message:
        paymentMethod === "COD"
          ? "Order placed successfully"
          : "Order created. Continue to online payment.",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      message: "Failed to create order",
    });
  }
};

// Get the logged-in user's orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      message: "Failed to get orders",
    });
  }
};

// Admin: Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Get all orders error:", error);

    return res.status(500).json({
      message: "Failed to get orders",
    });
  }
};

// Admin: Get one order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email phone",
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      message: "Failed to get order",
    });
  }
};

// Admin: Update order status


export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const allowedStatuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Only decrease stock when PENDING changes to CONFIRMED
    const shouldConfirm =
      order.orderStatus === "PENDING" &&
      orderStatus === "CONFIRMED";

    if (shouldConfirm) {
      // First check stock availability for all books
      for (const item of order.items) {
        const book = await Book.findById(item.book);

        if (!book || book.stock < item.quantity) {
          return res.status(400).json({
            message: `${item.title} does not have enough stock`,
          });
        }
      }

      // Decrease stock after checking all books
      for (const item of order.items) {
        await Book.findByIdAndUpdate(item.book, {
          $inc: {
            stock: -item.quantity,
            sold: item.quantity,
          },
        });
      }
    }

    order.orderStatus = orderStatus;
    await order.save();

    // Send confirmation email
    if (shouldConfirm) {
      try {
        const customer = order.user;

        const itemsList = order.items.map((item) => `
          <li>
            ${item.title} - Quantity: ${item.quantity}
            - Rs. ${item.price}
          </li>
        `).join("");

        await sendEmail(
          customer.email,
          "Your Order Has Been Confirmed!",
          `
            <h2>Hello ${customer.name}!</h2>
            <p>Your order has been confirmed successfully.</p>

            <h3>Order Details</h3>
            <ul>${itemsList}</ul>

            <p><strong>Total Amount:</strong> Rs. ${order.totalAmount}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>

            <p>Thank you for shopping with us!</p>
          `,
        );
      } catch (emailError) {
        console.error("Confirmation email failed:", emailError);
      }
    }

    return res.status(200).json({
      message: "Order status updated successfully",
      order,
    });

  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      message: "Failed to update order status",
    });
  }
};


// Admin: Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const allowedStatuses = ["PENDING", "PAID", "FAILED"];

    if (!allowedStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        message: "Invalid payment status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.paymentStatus = paymentStatus;

    await order.save();

    return res.status(200).json({
      message: "Payment status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update payment status error:", error);

    return res.status(500).json({
      message: "Failed to update payment status",
    });
  }
};

// Cancel pending order
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
        orderStatus: "PENDING",
      },
      {
        $set: { orderStatus: "CANCELLED" },
      },
      { returnDocument: "after" },
    );

    if (!order) {
      return res.status(400).json({
        message: "Order cannot be cancelled",
      });
    }

    return res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.log("Cancel order error:", error);

    return res.status(500).json({
      message: "Failed to cancel order",
    });
  }
};
