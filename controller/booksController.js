import Book from "../model/Book.js";

export const createBook = async (req, res) => {
  try {
    console.log(req.file);
    const createBook = await Book.create({
      ...req.body,
      image: req.file.path,
    });
    res.json(createBook);
   
  } catch (err) {
    console.log(" fail to create",err);
  }
};

export const getAll = async (req, res) => {
  try {
    const books = await Book.find(req.body);
    res.json(books);
  } catch (err) {
    console.log("can't fetch");
  }
};



export const getById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.json(book);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to fetch book",
      error: error.message,
    });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    res.json({
      message: "deleted sucessfully",
    });
  } catch (error) {
    console.log("delete");
  }
};

export const updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after"
    });
    res.json(book);
  } catch (error) {
    console.log("cant update");
  }
};
