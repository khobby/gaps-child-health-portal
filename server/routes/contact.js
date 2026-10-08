import express from "express";
import pool from "../config/db.js";
import {
  authenticateToken,
  requireAdmin
} from "../middleware/auth.js";

const router = express.Router();

/*
  PUBLIC CONTACT FORM
*/
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      subject,
      message
    } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        message: "Please complete the required fields"
      });
    }

    const result = await pool.query(
      `INSERT INTO contact_messages
       (name, email, subject, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      [
        name,
        email,
        subject || null,
        message
      ]
    );

    res.status(201).json({
      message: "Your message has been received",
      id: result.rows[0].id
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to submit contact message"
    });
  }
});

/*
  ADMIN CONTACT MESSAGES
*/
router.get("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM contact_messages
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load contact messages"
    });
  }
});

/*
  MARK MESSAGE AS READ
*/
router.patch(
  "/:id/status",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { status } = req.body;

      const allowedStatuses = [
        "unread",
        "read",
        "replied"
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid message status"
        });
      }

      const result = await pool.query(
        `UPDATE contact_messages
         SET status = $1
         WHERE id = $2
         RETURNING *`,
        [status, req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Message not found"
        });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to update message"
      });
    }
  }
);

/*
  DELETE MESSAGE
*/
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `DELETE FROM contact_messages
         WHERE id = $1
         RETURNING id`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Message not found"
        });
      }

      res.json({
        message: "Message deleted successfully"
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Server error"
      });
    }
  }
);

export default router;