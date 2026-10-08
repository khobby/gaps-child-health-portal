import express from "express";
import pool from "../config/db.js";
import {
  authenticateToken,
  requireAdmin
} from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

/*
  MEMBER PROFILE
*/
router.get(
  "/profile",
  authenticateToken,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT
           id,
           first_name,
           last_name,
           email,
           phone,
           specialty,
           role,
           membership_status,
           profile_image_url,
           created_at
         FROM members
         WHERE id = $1`,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Member not found"
        });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Load member profile error:", error);

      res.status(500).json({
        message: "Failed to load member profile"
      });
    }
  }
);

router.post(
  "/profile/image",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please select an image."
        });
      }

      const imageUrl = `/uploads/${req.file.filename}`;

      const result = await pool.query(
        `UPDATE members
         SET profile_image_url = $1
         WHERE id = $2
         RETURNING id, first_name, last_name, email, phone,
                   specialty, role, membership_status,
                   profile_image_url, created_at`,
        [imageUrl, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Member not found"
        });
      }

      res.json({
        message: "Profile image updated successfully",
        member: result.rows[0]
      });
    } catch (error) {
      console.error("Profile image upload error:", error);

      res.status(500).json({
        message: "Failed to update profile image"
      });
    }
  }
);

/*
  ALL MEMBERS
*/
router.get("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        specialty,
        role,
        membership_status,
        created_at
       FROM members
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error"
    });
  }
});

/*
  UPDATE MEMBERSHIP STATUS
*/
router.patch(
  "/:id/status",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { membershipStatus } = req.body;

      const allowedStatuses = [
        "pending",
        "approved",
        "rejected",
        "suspended"
      ];

      if (!allowedStatuses.includes(membershipStatus)) {
        return res.status(400).json({
          message: "Invalid membership status"
        });
      }

      const result = await pool.query(
        `UPDATE members
         SET membership_status = $1
         WHERE id = $2
         RETURNING
           id,
           first_name,
           last_name,
           email,
           role,
           membership_status`,
        [membershipStatus, req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Member not found"
        });
      }

      res.json({
        message: "Membership status updated",
        member: result.rows[0]
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Server error"
      });
    }
  }
);

/*
  DELETE MEMBER
*/
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `DELETE FROM members
         WHERE id = $1
         RETURNING id`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Member not found"
        });
      }

      res.json({
        message: "Member deleted successfully"
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