const db = require('../db/db');
const { v4: uuidv4 } = require('uuid');
const { BadRequestError } = require('../errors/errors');

// Define the Note class
class Note {
  constructor(id, title, content) {
    this.id = id;
    this.title = title;
    this.content = content;
  }

  // Get all notes from the database
  static async getAll(user, pageNumber = 1, pageSize = 10) {
    if (pageNumber < 1)
      throw new BadRequestError('invalid page number (starts from 1)');
    if (pageSize < 1)
      throw new BadRequestError('invalid page size (starts from 1)');
    const [rows] = await db.query(
      `SELECT *
      FROM Note
      WHERE UserId = ?
      ORDER BY CreatedAt
      LIMIT ${(pageNumber - 1) * pageSize}, ${pageSize}`,
      [user.id]);
    const [totalItems] = await db.query(
      'SELECT count(1) as amt FROM Note WHERE UserId = ?',
      [user.id])
    const data = {
      item: rows.map(row => new Note(row.Id, row.Title, row.Content)),
      pageNumber: pageNumber,
      pageSize: pageSize,
      totalItem: totalItems[0].amt
    }
    return data; // Map rows to Note instances
  }

  // Get a note by its ID
  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM Note WHERE Id = ?', [id]);
    if (rows.length === 0) {
      throw new Error('Note not found');
    }
    const { Id, Title, Content } = rows[0];
    return new Note(Id, Title, Content); // Return a Note instance
  }

  // Create a new note in the database
  static async create(title, content, user) {
    const id = uuidv4();
    const [result] = await db.query(
      'INSERT INTO Note (Id, UserId, Title, Content) VALUES (?, ?, ?, ?)',
      [id, user.id, title, content]);
    return new Note(id, title, content);  // Return a Note instance
  }

  // Delete a note by its ID
  static async deleteById(id) {
    const [result] = await db.query('DELETE FROM Note WHERE Id = ?', [id]);
    if (result.affectedRows === 0) {
      throw new Error('Note not found');
    }
    return result.affectedRows;
  }
}

module.exports = Note;
