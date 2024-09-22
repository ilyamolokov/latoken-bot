import { Chat } from "node-telegram-bot-api";

export const LATOKEN_URL = "https://latoken.com/";

export function createWelcomeMessage(chat: Chat) {
  const { username, first_name } = chat;
  return `Здравствуйте, ${
    Boolean(first_name) ? first_name : "@" + username
  }! 👋\nЭто официальный бот компании LATOKEN! 🚀
  \nЗдесь вы можете задать любые вопросы, касающиеся нашей компании, и я с удовольствием помогу вам! 💬
  \nТакже вы можете посетить наш сайт для получения дополнительной информации 🌍 или пройти увлекательный квиз по Culture Deck! 📝✨
  \nДобро пожаловать в мир LATOKEN! 🌐`;
}

export function removeCitations(text: string) {
  return text.replace(/【\d+:\d+†source】/g, "");
}

export const QUESTIONS = [
  "Почему Латокен помогает людям изучать и покупать активы?",
  "Зачем нужен Sugar Cookie тест?",
  "Зачем нужен Wartime СЕО?",
  "В каких случаях стресс полезен и в каких вреден?",
];
