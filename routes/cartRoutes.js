
import express from "express";
import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} from "../controller/cartController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", verifyToken, addToCart);
router.get("/", verifyToken, getCart);
router.put("/update/:bookId", verifyToken, updateCartQuantity);
router.delete("/remove/:bookId", verifyToken, removeFromCart);
router.delete("/clear", verifyToken, clearCart);

export default router;
