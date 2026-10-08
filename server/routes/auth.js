import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      specialty
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: "Please provide all required fields"
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM members WHERE email = $1",
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "An account with this email already exists"
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO members
       (first_name, last_name, email, password_hash, phone, specialty)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, first_name, last_name, email, role, membership_status`,
      [
        firstName,
        lastName,
        email.toLowerCase(),
        passwordHash,
        phone || null,
        specialty || null
      ]
    );

    const member = result.rows[0];

    const token = jwt.sign(
      {
        id: member.id,
        email: member.email,
        role: member.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h"
      }
    );

    res.status(201).json({
      message: "Account created successfully",
      token,
      member
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error"
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM members WHERE email = $1",
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const member = result.rows[0];

    const passwordMatch = await bcrypt.compare(
      password,
      member.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        id: member.id,
        email: member.email,
        role: member.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h"
      }
    );

    res.json({
      message: "Login successful",
      token,
      member: {
        id: member.id,
        firstName: member.first_name,
        lastName: member.last_name,
        email: member.email,
        role: member.role,
        membershipStatus: member.membership_status
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error"
    });
  }
});

export default router;