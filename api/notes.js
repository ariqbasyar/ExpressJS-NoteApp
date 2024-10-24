const express = require('express')
const router = express.Router()
const Note = require('../models/Note');

router.get('/', async (req, res, next) => {
  const notes = await Note.getAll();
  // res.render('notes', { notes });
  res.json(notes);
})
.post('/', async (req, res, next) => {
  const { title, content } = req.body;
  const insertedNote = await Note.create(title, content);
  // res.redirect('/notes');
  res.json(insertedNote);
});

module.exports = router