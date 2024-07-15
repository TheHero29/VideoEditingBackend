const express = require('express');
const path = require('path');
const { uploadVideo, trimVideo, mergeVideos } = require('../services/video');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const router = express.Router();
const upload = require('../middleware/upload');

// //function to get video duration
// function getVideoDuration(filePath) {
//   return new Promise((resolve, reject) => {
//       ffmpeg.ffprobe(filePath, (err, metadata) => {
//           if (err) {
//               reject(err);
//           } else {
//               resolve(metadata.format.duration);
//           }
//       });
//   });
// }

// Route to handle video upload
router.post('/upload', upload.single('video'), async (req, res) => {
    try {
        // console.log("request body:"+req.body)
        // const { size, duration } = req.body;
        const file = req.file;

        // throwing error if no file uploaded
        if (!file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        // if(size > 5 * 1024 * 1024){
        //   return res.status(400).json({ error: 'File size limit exceeded' });
        // }
        // // throwing error if video duration is more than 25 seconds orless than 5 seconds
        // const videoDuration = getVideoDuration(file.path);
        // if(videoDuration > 25 || videoDuration < 5){
        //   return res.status(400).json({ error: 'Video duration should not be more than 25 sec or less than 5 sec' });
        // }

        const video = await uploadVideo(file);
        res.status(201).json({ message: 'Video uploaded successfully', video });
    } catch (error) {
        // console.error('Error uploading video:', error);
        // res.status(500).json({ error: 'Failed to upload video' });
        fs.unlinkSync("uploads/" + req.file.filename);
        res.status(400).json(error.message);
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
