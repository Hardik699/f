import { RequestHandler } from "express";
import { getDB, getConnectionStatus } from "../db";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
}

export const handleLogin: RequestHandler = async (req, res) => {
  const dbStatus = getConnectionStatus();

  if (dbStatus !== "connected") {
    return res.status(503).json({
      success: false,
      message: "Database not connected. Please try again later.",
    });
  }

  const { username, password } = req.body as LoginRequest;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  try {
    const db = getDB();
    if (!db) {
      return res.status(503).json({
        success: false,
        message: "Database connection lost",
      });
    }

    const user = await db.collection("users").findOne({
      username: username.trim(),
      password: password, // In production, use bcrypt.compare()
    });

    if (user) {
      // In production, use JWT token
      const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");

      res.json({
        success: true,
        message: "Login successful",
        token: token,
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};
