const translate = require('@vitalets/google-translate-api');

exports.translateText = async (text, targetLang) => {
  const result = await translate(text, { to: targetLang });
  return result.text;
};
