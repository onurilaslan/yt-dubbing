const ffmpeg = require('fluent-ffmpeg');

exports.mergeAudioWithVideo = (videoPath, audioPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .addInput(audioPath)
      .outputOptions('-map 0:v:0', '-map 1:a:0', '-c:v copy', '-shortest')
      .save(outputPath)
      .on('end', resolve)
      .on('error', reject);
  });
};
