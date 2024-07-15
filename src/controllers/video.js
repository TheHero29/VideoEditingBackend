const express = require("express");
const path = require("path");
const { uploadVideo, trimVideo, mergeVideos } = require("../services/video");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const router = express.Router();
const upload = require("../middleware/upload");

// Route to handle video upload
router.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const file = req.file;
    
    // throwing error if no file uploaded
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const video = await uploadVideo(file);
    res.status(201).json({ message: "Video uploaded successfully", video });
  } catch (error) {
    fs.unlinkSync("uploads/" + req.file.filename);
    res.status(400).json(error.message);
  }
});

// Route to handle video trimming
router.post("/trim", async (req, res) => {
  try {
    const { videoId, startTime, endTime } = req.body;
    const trimmedVideo = await trimVideo(videoId, startTime, endTime);
    res
      .status(200)
      .json({ message: "Video trimmed successfully", trimmedVideo });
  } catch (error) {
    console.error("Error trimming video:", error);
    res.status(500).json({ error: "Failed to trim video" });
  }
});

// Route to handle video merging
router.post("/merge", async (req, res) => {
  try {
    const { videoIds } = req.body;
    const mergedVideo = await mergeVideos(videoIds);
    res
      .status(200)
      .json({ message: "Videos merged successfully", mergedVideo });
  } catch (error) {
    console.error("Error merging videos:", error);
    res.status(500).json({ error: "Failed to merge videos" });
  }
});

module.exports = router;
