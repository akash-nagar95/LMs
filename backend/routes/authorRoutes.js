const express = require('express');
const router = express.Router();
const Author = require('../models/Author');
const Book = require('../models/Book');

// Route to create a new author
router.post('/authors', async (req, res) => {
  try {
    console.log("from backend post request data " , req.body);
    const { authorName, authorEmail, authorPhone, books } = req.body;

    // Prepare trimmed book names
    // const trimmedBooks = books.map(book => book.trim());
    const trimmedBooks = books.filter(book => book.trim().length > 0).map(book => book.trim());

    // Find or create books in bulk
    const bookDocuments = await Promise.all(
      trimmedBooks.map(async (title) => {
        let book = await Book.findOne({ title });
        if (!book) {
          console.log("author book post method ",title)
          book = await Book.create({
            title,
            author: null,
            category: '',
            price: 0,
            borrower: null,
          });
        }
        return book;
      })
    );
    console.log("bookDocuments ",bookDocuments)
    
    // Extract book IDs
    const bookIds = bookDocuments.map(book => book._id);

    // Create the author
    const newAuthor = await Author.create({
      authorName,
      authorEmail,
      authorPhone,
      books: bookIds,
    });

    console.log('Author created:', newAuthor);

    // Update books in bulk to associate the author
    await Book.updateMany(
      { _id: { $in: bookIds } },
      { $set: { author: newAuthor._id } }
    );

    console.log('Books type:', typeof books); // Should be "object" (array)

    // Respond with the created author and associated books
    res.status(201).json({
      message: 'Author and books created successfully',
      data: {
        author: newAuthor,
        books: bookDocuments,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/search', async (req, res) => {
    try {
      const query = req.query.query;
      const regex = new RegExp(query, 'i'); 
      const authors = await Author.find({
        $or: [
          { authorName: { $regex: regex } }, 
          { authorEmail: { $regex: regex } },  
        ],
      }).populate('books');
      res.json(authors);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Route to get author by ID
router.get('/:id', async (req, res) => {
  try {
    const authorId = req.params.id;
    const author = await Author.findById(authorId);
    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }
    res.status(200).json(author);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
    try {
      const authorId = req.params.id;
      const { authorName, authorEmail, authorPhone } = req.body;
  
      const updatedAuthor = await Author.findByIdAndUpdate(
        authorId,
        { authorName, authorEmail, authorPhone },
        { new: true }
      );
  
      if (!updatedAuthor) {
        return res.status(404).json({ error: 'Author not found' });
      }
  
      res.status(200).json(updatedAuthor);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

module.exports = router;
