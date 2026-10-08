import express from "express";
import pool from "../config/db.js";
import {
  authenticateToken,
  requireAdmin
} from "../middleware/auth.js";

const router = express.Router();

// --------------------------------------------------
// GET ALL EVENTS
// --------------------------------------------------

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM events
       ORDER BY event_date ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Load events error:", error);

    res.status(500).json({
      message: "Failed to load events"
    });
  }
});

// --------------------------------------------------
// CREATE EVENT
// --------------------------------------------------

router.post(
  "/",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        title,
        description,
        eventDate,
        location,
        registrationRequired,
        imageUrl
      } = req.body;

      if (!title || !eventDate) {
        return res.status(400).json({
          message: "Title and event date are required"
        });
      }

      const result = await pool.query(
        `INSERT INTO events
        (
          title,
          description,
          event_date,
          location,
          registration_required,
          image_url
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
          title,
          description || null,
          eventDate,
          location || null,
          Boolean(registrationRequired),
          imageUrl || null
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Create event error:", error);

      res.status(500).json({
        message: "Failed to create event"
      });
    }
  }
);

// --------------------------------------------------
// UPDATE EVENT
// --------------------------------------------------

router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        title,
        description,
        eventDate,
        location,
        registrationRequired,
        imageUrl
      } = req.body;

      if (!title || !eventDate) {
        return res.status(400).json({
          message: "Title and event date are required"
        });
      }

      const result = await pool.query(
        `UPDATE events
         SET
           title = $1,
           description = $2,
           event_date = $3,
           location = $4,
           registration_required = $5,
           image_url = $6
         WHERE id = $7
         RETURNING *`,
        [
          title,
          description || null,
          eventDate,
          location || null,
          Boolean(registrationRequired),
          imageUrl || null,
          req.params.id
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Event not found"
        });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Update event error:", error);

      res.status(500).json({
        message: "Failed to update event"
      });
    }
  }
);

// --------------------------------------------------
// DELETE EVENT
// --------------------------------------------------

router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `DELETE FROM events
         WHERE id = $1
         RETURNING id`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Event not found"
        });
      }

      res.json({
        message: "Event deleted successfully"
      });
    } catch (error) {
      console.error("Delete event error:", error);

      res.status(500).json({
        message: "Failed to delete event"
      });
    }
  }
);

export default router;