// services/transcribeAudio.js

const speech = require('@google-cloud/speech');
const fs = require('fs');
const path = require('path');

// Google Cloud istemcisini başlat
const client = new speech.SpeechClient();

async function transcribeAudio(audioPath) {
  const file = fs.readFileSync(audioPath);
  const audioBytes = file.toString('base64');

  const audio = {
    content: audioBytes,
  };

  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'en-US', // İhtiyaca göre dil kodunu değiştirebilirsiniz
  };

  const request = {
    audio: audio,
    config: config,
  };

  try {
    // API'ye ses gönderimi ve yanıt alımı
    const [response] = await client.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    return transcription;
  } catch (err) {
    console.error('Google Speech-to-Text API hatası:', err);
    throw err;
  }
}

module.exports = { transcribeAudio };
