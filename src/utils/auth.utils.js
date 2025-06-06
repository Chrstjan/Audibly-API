import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";

dotenv.config();
/**
 * Authentication and Authorization Module
 *
 * This module provides authentication and authorization functionality for users.
 * - `Authenticate`: Validates user credentials and generates JWT tokens.
 * - `Authorize`: Middleware that checks and refreshes access tokens if needed.
 * - `getUserFromToken`: Extracts user ID from a given JWT token.
 */

/**
 * Generates a JWT token (either access or refresh) for a user.
 * @param {Object} user - The user object containing user details.
 * @param {string} type - The type of token to generate ("access" or "refresh").
 * @returns {string} - The generated JWT token.
 */
const generateToken = (user, type) => {
  const expTime =
    Math.floor(Date.now() / 1000) +
    +process.env[`TOKEN_${type.toUpperCase()}_EXPIRATION_SECS`];
  return jwt.sign(
    { exp: expTime, data: { id: user.id } },
    process.env[`TOKEN_${type.toUpperCase()}_KEY`]
  );
};

/**
 * Authenticates a user by validating their credentials and generating JWT tokens.
 * @param {Object} req - The request object containing user credentials.
 * @param {Object} res - The response object to send the tokens.
 */
const Authenticate = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) return res.status(400);

  try {
    const user = await User.findOne({
      attributes: ["id", "password", "email", "username"],
      where: { email: username },
    });

    if (!user) return res.status(401);

    // Validate password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401);

    // Generate JWT tokens
    const refresh_token = generateToken(user, "refresh");
    const access_token = generateToken(user, "access");

    // Store the refresh token in the database
    await User.update({ refresh_token }, { where: { id: user.id } });

    // Send tokens and user data to the client
    res.json({
      access_token,
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Middleware to authorize user requests by validating JWT tokens.
 * @param {Object} req - The request object containing the access token.
 * @param {Object} res - The response object to send error messages or a new token.
 * @param {Function} next - Calls the next middleware if the user is authorized.
 */
const Authorize = async (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  if (!bearerHeader || !bearerHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Token not accepted" });

  const token = bearerHeader.split(" ")[1];

  try {
    // Verify the access token
    const decoded = jwt.verify(token, process.env.TOKEN_ACCESS_KEY);
    req.user = decoded.data;
    next();
  } catch (err) {
    if (err.message === "jwt expired") {
      // If access token is expired, attempt to refresh it
      const user = await User.findOne({
        where: { id: jwt.decode(token).data.id },
      });
      if (!user.access_token) return res.status(400);

      try {
        jwt.verify(user.refresh_token, process.env.TOKEN_REFRESH_KEY);

        const accessToken = generateToken(user, "access");
        return res.json({ accessToken, updated: Date() });
      } catch {
        return res
          .status(400)
          .json({ message: "Refresh token invalid. Please login again." });
      }
    }
    return res.status(403).json({ message: err.message });
  }
};

/**
 * Extracts the user ID from a JWT access token.
 * @param {Object} req - The request object containing the access token.
 * @param {Object} res - The response object to send the extracted user ID.
 */
const getUserFromToken = async (req, res) => {
  const bearerHeader = req.headers["authorization"];

  if (bearerHeader && bearerHeader.includes("Bearer")) {
    const token = bearerHeader.split(" ")[1];
    try {
      const decodedToken = jwt.verify(token, process.env.TOKEN_ACCESS_KEY);
      const userId = await decodedToken.data.id;

      return userId;
    } catch (err) {
      console.error(err);
    }
  }
};

export { Authenticate, Authorize, getUserFromToken };
