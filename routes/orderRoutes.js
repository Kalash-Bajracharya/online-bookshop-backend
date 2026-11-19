import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
} from "../controller/orderController.js";

const router = express.Router();

// Customer routes
router.post("/create", verifyToken, createOrder);
router.get("/my-orders", verifyToken, getMyOrders);
router.post("/cancel/:id", verifyToken, cancelOrder);

// Admin routes
router.get("/getAll", verifyToken, adminOnly, getAllOrders);
router.get("/get/:id", verifyToken, adminOnly, getOrderById);
router.put("/updateStatus/:id", verifyToken, adminOnly, updateOrderStatus);
router.put("/updatePayment/:id", verifyToken, adminOnly, updatePaymentStatus);

export default router;