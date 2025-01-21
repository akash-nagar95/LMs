const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  authorName: { type: String, required: true },
  authorEmail: { type: String, required: true },
  authorPhone: { type: String, required: true },
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
});

const Author = mongoose.model('Author', authorSchema);

module.exports = Author;
