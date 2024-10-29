const { v4 } = require('uuid');
const db = require('../db/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UnauthorizedError, BadRequestError } = require('../errors/errors');

class User {
  constructor(user) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email;
  }

  static async register(username, email, authType, password) {
    try {
      authType ||= 'password';
      if (authType === 'password') {
        return await this.createWithPassword(username, email, password);
      }
      throw new UnauthorizedError(`this authType (${authType}) has not been implemented`);
    } catch (err) {
      throw err
    }
  }

  static async createWithPassword(username, email, password) {
    const userId = v4();
    try {
      const [userResult] = await db.query(
        'INSERT INTO User (Id, Username, Email) VALUES (?, ?, ?)',
        [userId, username, email]);
    } catch (err) {
      throw new UnauthorizedError(err.sqlMessage);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const authMethodId = v4();
    try {
      const [authMethodResult] = await db.query(
        'INSERT INTO AuthMethod (Id, UserId, AuthType, HashedPassword) VALUES (?, ?, ?, ?)',
        [authMethodId, userId, 'password', hashedPassword]);
    } catch (err) {
      // delete the user if failed to insert to AuthMethod table
      const [deleteUserResult] = await db.query(
        'DELETE FROM User WHERE Id = ?',
        [userId]);
      throw new UnauthorizedError(err.sqlMessage);
    }
    return new User({ id: userId, username, email });
  }

  static async login(username, email, authType, password) {
    try {
      authType ||= 'password';
      if (authType === 'password') {
        return await this.loginWithPassword(username, email, password);
      }
      throw new UnauthorizedError(`this authType (${authType}) has not been implemented`);
    } catch (err) {
      throw err
    }
  }

  static async loginWithPassword(username, email, password) {
    var users = [];
    if (username !== null)
      [users] = await db.query(
        `SELECT
          u.Id as id,
          u.Username as username,
          u.Email as email,
          am.HashedPassword as hashedPassword
        FROM User u
          JOIN AuthMethod am ON am.UserId = u.Id
        WHERE Username = ?`,
        [username]);
    else
      [users] = await db.query(
        `SELECT
          u.Id as id,
          u.Username as username,
          u.Email as email,
          am.HashedPassword as hashedPassword
        FROM User u
          JOIN AuthMethod am ON am.UserId = u.Id
        WHERE Email = ?`,
        [email]);
    if (users.length == 0) return false;

    const tempUser = users[0];
    if (!password || password.trim().length === 0) return false;
    const checkPassword = await bcrypt.compare(password, tempUser.hashedPassword);
    const user = new User(tempUser);
    if (!checkPassword) return false;

    // Create the JWT payload
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    // Generate the token using your secret key and set an expiration time
    const token = jwt.sign({ user: payload }, process.env.JWT_SECRET, {
      expiresIn: '1h' // Set the token expiration time
    });

    // Return the user and the token
    return { user, token };
  }

  static async deleteByUsername(username) {
    try {
      const [result] = await db.query('DELETE FROM User WHERE Username = ?', [username]);
      if (result.affectedRows === 0)
        throw new BadRequestError('User not found');
      return result.affectedRows;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = User;