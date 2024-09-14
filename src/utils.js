const LATOKEN_URL = "https://latoken.com/";

function createWelcomeMessage(chat) {
  const { username, first_name } = chat;
  return `Привет, ${
    Boolean(first_name) ? first_name : "@" + username
  }! 👋\nРад видеть тебя в официальном боте компании LATOKEN! 🚀
  \nЗдесь ты можешь задавать любые вопросы, касающиеся нашей компании, и я с удовольствием помогу тебе! 💬
  \nТакже ты можешь посетить наш сайт для получения дополнительной информации 🌍 или пройти увлекательный квиз по Culture Deck! 📝✨
  \nДобро пожаловать в мир LATOKEN! 🌐`;
}

const CULTURE_DECK_QUIZ_QUESTIONS = [
  "Первый вопрос:\nПочему Латокен помогает людям изучать и покупать активы?",
  "Второй вопрос:\nЗачем нужен Sugar Cookie тест?",
  "Третий вопрос:\nЗачем нужен Wartime СЕО?",
  "Последний вопрос:\nВ каких случаях стресс полезен и в каких вреден?",
];

module.exports = {
  createWelcomeMessage,
  LATOKEN_URL,
  CULTURE_DECK_QUIZ_QUESTIONS,
};
