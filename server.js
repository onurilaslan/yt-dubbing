require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');

const { downloadVideo } = require('./services/downloadVideo');
const { extractAudio } = require('./services/extractAudio');
const { transcribeAudio } = require('./services/transcribe');
const { translateText } = require('./services/translate');
const { textToSpeech } = require('./services/tts');
const { mergeAudioWithVideo } = require('./services/mergeAudioVideo');

const app = express();
const PORT = 3000;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry fonksiyonu, rate limit hatası alırsak tekrar dener
async function retryRequest(func, retries = 3, delayMs = 5000) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await func();
    } catch (error) {
      lastError = error;
      if (error.response && error.response.status === 429) {
        console.log(`Rate limit hatası alındı, ${delayMs / 1000} saniye sonra tekrar deneyelim...`);
        await delay(delayMs);  // 5 saniye bekle
      } else {
        throw error;
      }
    }
  }
  throw lastError;  // Son hata ile sonlandır
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('uploads')); // videoları buradan servis eder

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/process', async (req, res) => {
  const youtubeUrl = req.body.youtubeUrl;
  const language = req.body.language;

  if (!youtubeUrl) return res.status(400).send('YouTube linki girilmedi.');

  try {
    console.log('Adım 1: Videoyu indiriyoruz...');
    // 1. Videoyu indir
    const videoPath = await retryRequest(() => downloadVideo(youtubeUrl));
    await delay(5000); // 5 saniye bekle

    console.log('Adım 2: Sesi çıkarıyoruz...');
    // 2. Sesi çıkar
    const audioPath = './uploads/audio.wav';
    await retryRequest(() => extractAudio(videoPath, audioPath));
    await delay(5000); // 5 saniye bekle

    console.log('Adım 3: Ses dosyasını yazıya döküyoruz...');
    // 3. Ses dosyasını yazıya dök
    const transcript = await retryRequest(() => transcribeAudio(audioPath));

    console.log('Adım 4: Metni çeviriyoruz...');
    // 4. Metni çevir
    const translated = await retryRequest(() => translateText(transcript, language));
    await delay(5000); // 5 saniye bekle

    console.log('Adım 5: Yeni dilde ses üretiyoruz...');
    // 5. Yeni dilde ses üret
    const ttsPath = './uploads/dub_audio.mp3';
    await retryRequest(() => textToSpeech(translated, ttsPath, language));
    await delay(5000); // 5 saniye bekle

    console.log('Adım 6: Sesi videoya ekliyoruz...');
    // 6. Sesi tekrar videoya ekle
    const outputVideo = './uploads/output.mp4';
    await retryRequest(() => mergeAudioWithVideo(videoPath, ttsPath, outputVideo));
    await delay(5000); // 5 saniye bekle

    // 7. Sonucu kullanıcıya sun
    res.send(`
      <h2>Dublajlı Video:</h2>
      <video src="/output.mp4" controls width="720"></video>
      <br><a href="/output.mp4" download>İndir</a>
      <br><a href="/">Yeni video işlemek için geri dön</a>
    `);
  } catch (err) {
    console.error('Hata:', err);
    res.status(500).send(`Bir hata oluştu: ${err.message || err}`);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Sunucu çalışıyor: http://localhost:${PORT}`);
});
