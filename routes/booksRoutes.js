import express from "express";

import Expenses from "../model/Book.js";
import {
  createBook,
  getAll,
  updateBook,
  deleteBook,
  getById,
  toggleBookStatus,
  getActiveBooks
} from "../controller/booksController.js";
import { upload } from "../config/files.js";


const router = express.Router()

//GET all expenses

router.get("/getActive", getActiveBooks)

//ADD expense
router.post("/add",upload.single("image"),createBook)

//Get by id
router.get("/get/:id",getById)

// UPDATE expense
router.put("/update/:id", upload.single("image"), updateBook);

// DELETE expense
router.delete("/delete/:id", deleteBook);

//For admin

router.get("/getAll",getAll)


router.put("/toggle/:id", toggleBookStatus);
 
export default router