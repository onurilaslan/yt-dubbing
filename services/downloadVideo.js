const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

exports.downloadVideo = (url) => {
  return new Promise((resolve, reject) => {
    // video ve ses ayrı ayrı indirilsin, sonra otomatik birleştirilsin
    const outputTemplate = 'uploads/video.%(ext)s';
    const command = `yt-dlp -f bestvideo+bestaudio --merge-output-format mp4 -o "${outputTemplate}" "${url}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('yt-dlp hata:', stderr);
        return reject(new Error(stderr || 'yt-dlp başarısız oldu.'));
      }

      // İndirilen dosyayı bul
      const files = fs.readdirSync('./uploads');
      const downloadedFile = files.find(file =>
        file.startsWith('video.') && file.endsWith('.mp4')
      );

      if (!downloadedFile) return reject(new Error('İndirilen video bulunamadı.'));

      resolve(path.join('./uploads', downloadedFile));
    });
  });
};
