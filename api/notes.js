const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

router.get('/', async (req, res, next) => {
  const query = req.query;
  try {
    const notes = await Note.getAll(req.user, query.pageNumber, query.pageSize);
    return res.json(notes);
  } catch (err) {
    next(err);
  }
})
.post('/', async (req, res, next) => {
  const { title, content } = req.body;
  const insertedNote = await Note.create(req.user, title, content);
  return res.json(insertedNote);
});

module.exports = router