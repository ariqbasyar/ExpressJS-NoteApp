const db = require('../db/db');
const { v4: uuidv4 } = require('uuid');

// Define the Note class
class Note {
  constructor(id, title, content) {
    this.id = id;
    this.title = title;
    this.content = content;
  }

  // Get all notes from the database
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM Note');
    return rows.map(row => new Note(row.Id, row.Title, row.Content)); // Map rows to Note instances
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
  static async create(title, content) {
    const id = uuidv4();
    const [result] = await db.query('INSERT INTO Note (Id, Title, Content) VALUES (?, ?, ?)', [id, title, content]);
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
