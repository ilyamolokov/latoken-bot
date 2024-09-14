const LATOKEN_URL = "https://latoken.com/";

function createWelcomeMessage(chat) {
  const { username, first_name } = chat;
  return `Здравствуйте, ${
    Boolean(first_name) ? first_name : "@" + username
  }! 👋\nЭто официальный бот компании LATOKEN! 🚀
  \nЗдесь вы можете задать любые вопросы, касающиеся нашей компании, и я с удовольствием помогу вам! 💬
  \nТакже вы можете посетить наш сайт для получения дополнительной информации 🌍 или пройти увлекательный квиз по Culture Deck! 📝✨
  \nДобро пожаловать в мир LATOKEN! 🌐`;
}

const QUESTIONS = [
  "Почему Латокен помогает людям изучать и покупать активы?",
  "Зачем нужен Sugar Cookie тест?",
  "Зачем нужен Wartime СЕО?",
  "В каких случаях стресс полезен и в каких вреден?",
];

module.exports = {
  createWelcomeMessage,
  LATOKEN_URL,
  QUESTIONS,
};
