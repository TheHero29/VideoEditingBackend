const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const  Video  = require('../models/video'); 

const uploadDir = 'uploads/';

//function to get video duration
const getVideoMetadata = async (filePath) => {
    try {
      const metadata = await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
          if (err) {
            return reject(err);
          }
          resolve(metadata);
        });
      });
  
      const duration = metadata.format.duration;
      const size = metadata.format.size;
  
      return { duration, size };
    } catch (error) {
      throw new Error(`Error getting video metadata: ${error.message}`);
    }
  };

// Function to upload a video
async function uploadVideo(file) {
    const filePath = path.join(uploadDir, file.filename);
    const {duration,size} = await getVideoMetadata(filePath);
    console.log(duration,size);
    if(duration > 40 || duration < 5){
      throw new Error('Video duration should not be more than 40 sec or less than 5 sec' );
      return null;
    }

    if(size > 7 * 1024 * 1024){
        throw new Error('File size should be less than 7mb' );
        return null;
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
    // console.log(video);
    const trimmedFilePath = path.join(uploadDir, `trimmed-${video.filename}`);
    const oldpath = path.join(uploadDir,video.filename);
    await new Promise((resolve, reject) => {
        ffmpeg(oldpath)
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
  try{
    const videos = await Video.findAll({ where: { id: videoIds } });
    if (videos.length !== videoIds.length) {
        throw new Error('Not all videos found');
    }

    const mergedFilePath = path.join(uploadDir, `merged-${Date.now()}.mp4`);
    const ffmpegCommand = ffmpeg();

    const inputFiles = videos.map((video) => {return path.join(uploadDir, video.filename)});
    inputFiles.forEach((file) => {
        ffmpegCommand.addInput(file);
    });

      ffmpegCommand
      .complexFilter([
        {
          filter: 'concat',
          options: {
            n: inputFiles.length,
            v: 1,
            a: 1,
            safe: 0 // Add this if needed for certain filesystem issues
          },
          inputs: inputFiles.map((file, index) => `[${index}:v][${index}:a]`).join('')
        }
      ])
      .outputOptions('-map [v]')
      .output(mergedFilePath)
      .on('end', () => {
        console.log('Merging finished');
      })
      .on('error', (err) => {
        console.error('Error merging:', err);
        throw new Error('Error merging videos');
      })
      .run();
      // .mergeToFile(mergedFilePath, uploadDir); 
    return mergedFilePath;
  }
  catch(err){
    throw new Error(err.message);
  }
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
