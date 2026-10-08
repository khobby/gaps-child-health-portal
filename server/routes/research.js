import express from "express";
import pool from "../config/db.js";
import {
  authenticateToken,
  requireAdmin
} from "../middleware/auth.js";

const router = express.Router();

// --------------------------------------------------
// GET ALL RESEARCH
// --------------------------------------------------

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM research
       ORDER BY publication_year DESC NULLS LAST,
                created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Load research error:", error);

    res.status(500).json({
      message: "Failed to load research"
    });
  }
});

// --------------------------------------------------
// CREATE RESEARCH
// --------------------------------------------------

router.post(
  "/",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        title,
        authors,
        journal,
        publicationYear,
        abstract,
        documentUrl,
        imageUrl
      } = req.body;

      if (!title) {
        return res.status(400).json({
          message: "Research title is required"
        });
      }

      const result = await pool.query(
        `INSERT INTO research
        (
          title,
          authors,
          journal,
          publication_year,
          abstract,
          document_url,
          image_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          title,
          authors || null,
          journal || null,
          publicationYear || null,
          abstract || null,
          documentUrl || null,
          imageUrl || null
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Create research error:", error);

      res.status(500).json({
        message: "Failed to create research record"
      });
    }
  }
);

// --------------------------------------------------
// UPDATE RESEARCH
// --------------------------------------------------

router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        title,
        authors,
        journal,
        publicationYear,
        abstract,
        documentUrl,
        imageUrl
      } = req.body;

      if (!title) {
        return res.status(400).json({
          message: "Research title is required"
        });
      }

      const result = await pool.query(
        `UPDATE research
         SET
           title = $1,
           authors = $2,
           journal = $3,
           publication_year = $4,
           abstract = $5,
           document_url = $6,
           image_url = $7
         WHERE id = $8
         RETURNING *`,
        [
          title,
          authors || null,
          journal || null,
          publicationYear || null,
          abstract || null,
          documentUrl || null,
          imageUrl || null,
          req.params.id
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Research record not found"
        });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Update research error:", error);

      res.status(500).json({
        message: "Failed to update research"
      });
    }
  }
);

// --------------------------------------------------
// DELETE RESEARCH
// --------------------------------------------------

router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `DELETE FROM research
         WHERE id = $1
         RETURNING id`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Research record not found"
        });
      }

      res.json({
        message: "Research publication deleted successfully"
      });
    } catch (error) {
      console.error("Delete research error:", error);

      res.status(500).json({
        message: "Failed to delete research"
      });
    }
  }
);

export default router;