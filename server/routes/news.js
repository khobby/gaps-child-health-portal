import express from "express";
import pool from "../config/db.js";
import {
  authenticateToken,
  requireAdmin
} from "../middleware/auth.js";

const router = express.Router();

// --------------------------------------------------
// GET ALL NEWS
// --------------------------------------------------

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM news
       ORDER BY published_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Load news error:", error);

    res.status(500).json({
      message: "Failed to load news"
    });
  }
});

// --------------------------------------------------
// CREATE NEWS
// --------------------------------------------------

router.post(
  "/",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        title,
        content,
        imageUrl
      } = req.body;

      if (!title || !content) {
        return res.status(400).json({
          message: "Title and content are required"
        });
      }

      const result = await pool.query(
        `INSERT INTO news
        (
          title,
          content,
          image_url
        )
        VALUES ($1, $2, $3)
        RETURNING *`,
        [
          title,
          content,
          imageUrl || null
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Create news error:", error);

      res.status(500).json({
        message: "Failed to create news"
      });
    }
  }
);

// --------------------------------------------------
// UPDATE NEWS
// --------------------------------------------------

router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        title,
        content,
        imageUrl
      } = req.body;

      if (!title || !content) {
        return res.status(400).json({
          message: "Title and content are required"
        });
      }

      const result = await pool.query(
        `UPDATE news
         SET
           title = $1,
           content = $2,
           image_url = $3
         WHERE id = $4
         RETURNING *`,
        [
          title,
          content,
          imageUrl || null,
          req.params.id
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "News article not found"
        });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Update news error:", error);

      res.status(500).json({
        message: "Failed to update news"
      });
    }
  }
);

// --------------------------------------------------
// DELETE NEWS
// --------------------------------------------------

router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `DELETE FROM news
         WHERE id = $1
         RETURNING id`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "News article not found"
        });
      }

      res.json({
        message: "News article deleted successfully"
      });
    } catch (error) {
      console.error("Delete news error:", error);

      res.status(500).json({
        message: "Failed to delete news"
      });
    }
  }
);

export default router;