const fs = require('fs');
const axios = require('axios');

exports.textToSpeech = async (text, outputPath, language) => {
  const response = await axios.post(
    'https://api.openai.com/v1/audio/speech',
    {
      model: 'tts-1',
      input: text,
      voice: language === 'tr' ? 'nova' : 'shimmer',
    },
    {
      responseType: 'stream',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const writer = fs.createWriteStream(outputPath);
  response.data.pipe(writer);

  return new Promise((resolve) => {
    writer.on('finish', resolve);
  });
};
