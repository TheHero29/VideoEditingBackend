const express = require('express');
const path = require('path');
const { uploadVideo, trimVideo, mergeVideos } = require('../services/videoService');

const router = express.Router();
const upload = require('../middleware/upload');

// Route to handle video upload
router.post('/upload', upload.single('video'), async (req, res) => {
    try {
        const { size, duration } = req.body;
        const file = req.file;

        // throwing error if file size is exceeded or no file uploaded
        if (!file) {
          return res.status(400).json({ error: 'File size limit exceeded or no file uploaded' });
        }

        const video = await uploadVideo(file, size, duration);
        res.status(201).json({ message: 'Video uploaded successfully', video });
    } catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).json({ error: 'Failed to upload video' });
    }
});

// Route to handle video trimming
router.post('/trim', async (req, res) => {
    try {
        const { videoId, startTime, endTime } = req.body;
        const trimmedVideo = await trimVideo(videoId, startTime, endTime);
        res.status(200).json({ message: 'Video trimmed successfully', trimmedVideo });
    } catch (error) {
        console.error('Error trimming video:', error);
        res.status(500).json({ error: 'Failed to trim video' });
    }
});

// Route to handle video merging
router.post('/merge', async (req, res) => {
    try {
        const { videoIds } = req.body;
        const mergedVideo = await mergeVideos(videoIds);
        res.status(200).json({ message: 'Videos merged successfully', mergedVideo });
    } catch (error) {
        console.error('Error merging videos:', error);
        res.status(500).json({ error: 'Failed to merge videos' });
    }
});

module.exports = router;
