const ffmpeg = require('fluent-ffmpeg');

function extractAudio(videoPath, outputAudioPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .noVideo()
      .audioCodec('pcm_s16le')
      .audioChannels(1)
      .audioFrequency(16000)
      .format('wav')
      .on('end', () => {
        console.log('🎧 Ses çıkarma işlemi tamamlandı.');
        resolve(outputAudioPath);
      })
      .on('error', (err) => {
        console.error('❌ Ses çıkarma hatası:', err.message);
        reject(err);
      })
      .save(outputAudioPath);
  });
}

module.exports = { extractAudio };
