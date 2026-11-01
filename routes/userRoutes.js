
import express from "express";
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  login,
  updateUser,
} from "../controller/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/create", createUser);
router.post("/login", login);

// Protected routes
router.get("/getAll", verifyToken, getUsers);
router.get("/getById/:id", verifyToken, getUserById);
router.delete("/delete/:id", verifyToken, deleteUser);
router.put("/update/:id", verifyToken, updateUser);

export default router;
