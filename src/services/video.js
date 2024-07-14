const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const  Video  = require('../models/video'); // Assuming Sequelize model for Video

const uploadDir = 'uploads/';

//function to get video duration
function getVideoDuration(filePath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                reject(err);
            } else {
                resolve(metadata.format.duration);
            }
        });
    });
  }


// Function to upload a video
async function uploadVideo(file) {
    const filePath = path.join(uploadDir, file.filename);
    const duration = await getVideoDuration(filePath);

    // throwing error if video duration is more than 25 seconds orless than 5 seconds
    const videoDuration = getVideoDuration(file.path);
    if(videoDuration > 25 || videoDuration < 5){
      return res.status(400).json({ error: 'Video duration should not be more than 25 sec or less than 5 sec' });
    }

    // Save video metadata to the database
    const video = await Video.create({
        filename: file.filename,
        size: file.size,
        duration: duration,
        mimeType: file.mimetype,
        path: filePath,
    });

    return video;
}

// Function to trim a video
async function trimVideo(videoId, startTime, endTime) {
    const video = await Video.findByPk(videoId);
    if (!video) {
        throw new Error('Video not found');
    }

    const trimmedFilePath = path.join(uploadDir, `trimmed-${video.filename}`);
    await new Promise((resolve, reject) => {
        ffmpeg(video.path)
            .setStartTime(startTime)
            .setDuration(endTime - startTime)
            .output(trimmedFilePath)
            .on('end', resolve)
            .on('error', reject)
            .run();
    });

    return {
        original: video,
        trimmed: trimmedFilePath,
    };
}

// Function to merge multiple videos
async function mergeVideos(videoIds) {
    const videos = await Video.findAll({ where: { id: videoIds } });
    if (videos.length !== videoIds.length) {
        throw new Error('Not all videos found');
    }

    const mergedFilePath = path.join(uploadDir, `merged-${Date.now()}.mp4`);
    const ffmpegCommand = ffmpeg();

    videos.forEach((video) => {
        ffmpegCommand.input(video.path);
    });

    await new Promise((resolve, reject) => {
        ffmpegCommand
            .on('end', resolve)
            .on('error', reject)
            .mergeToFile(mergedFilePath);
    });

    return mergedFilePath;
}

// Function to generate a shareable link with expiry
function generateShareableLink(videoId, expiryTime) {
    // Implement logic to generate shareable link with expiry
    // This could involve creating a token or short-lived URL
}

module.exports = {
    uploadVideo,
    trimVideo,
    mergeVideos,
    generateShareableLink,
};
