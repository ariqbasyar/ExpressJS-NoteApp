const db = require('../db/db');
const { v4: uuidv4 } = require('uuid');
const { BadRequestError } = require('../errors/errors');
const redisClient = require('../redis/redisClient');

// Define the Note class
class Note {
  constructor(id, title, content) {
    this.id = id;
    this.title = title;
    this.content = content;
  }

  // Generate a Redis key based on user ID and pagination parameters
  static getListCacheKey(user, pageNumber, pageSize) {
    return `notes:${user.id}-page:${pageNumber}-size:${pageSize}`;
  }

  // Generate a Redis key based on user ID and note ID
  static getIdCacheKey(user, id) {
    return `note:${user.id}-${id}`;
  }

  // Get all notes from the database
  static async getAll(user, pageNumber = 1, pageSize = 10) {
    if (pageNumber < 1)
      throw new BadRequestError('invalid page number (starts from 1)');
    if (pageSize < 1)
      throw new BadRequestError('invalid page size (starts from 1)');

    const cacheKey = Note.getListCacheKey(user, pageNumber, pageSize);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData)
      return JSON.parse(cachedData);

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

    await redisClient.set(cacheKey, JSON.stringify(data),
      { EX: 60 * 5 }); // 5 minutes expiration time

    return data; // Map rows to Note instances
  }

  // Get a note by its ID
  static async getById(user, id) {
    const cacheKey = Note.getIdCacheKey(user, id);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData)
      return JSON.parse(cachedData);

    const [rows] = await db.query(
      'SELECT * FROM Note WHERE UserId = ? AND Id = ?',
      [user.id, id]);
    if (rows.length === 0)
      throw new BadRequestError('Note not found');

    const { Id, Title, Content } = rows[0];
    const note = new Note(Id, Title, Content);
    await redisClient.set(cacheKey, JSON.stringify(note),
      { EX: 60 * 5 }); // 5 minutes expiration time
    return note; // Return a Note instance
  }

  // Create a new note in the database
  static async create(user, title, content) {
    const id = uuidv4();
    const [result] = await db.query(
      'INSERT INTO Note (Id, UserId, Title, Content) VALUES (?, ?, ?, ?)',
      [id, user.id, title, content]);
    const note = new Note(id, title, content);
    const cacheKey = Note.getIdCacheKey(user, id);
    await redisClient.set(cacheKey, JSON.stringify(note),
      { EX: 60 * 5 }); // 5 minutes expiration time
    return note;  // Return a Note instance
  }

  // Delete a note by its ID
  static async deleteById(user, id) {
    const [result] = await db.query(
      'DELETE FROM Note WHERE UserId = ? AND Id = ?',
      [user.id, id]);
    if (result.affectedRows === 0)
      throw new BadRequestError('Note not found');
    const cacheKey = Note.getIdCacheKey(user, id);
    await redisClient.del(cacheKey);
    return result.affectedRows;
  }
}

module.exports = Note;
