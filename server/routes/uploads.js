import express from "express";
import {
  authenticateToken,
  requireAdmin
} from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  requireAdmin,
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image."
      });
    }

    res.status(201).json({
      message: "Image uploaded successfully",
      imageUrl: `/uploads/${req.file.filename}`
    });
  }
);

export default router;