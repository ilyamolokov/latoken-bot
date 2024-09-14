// choices[0].message.content
require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");

const { runPrompt } = require("./openai-config.js");
const {
  createWelcomeMessage,
  LATOKEN_URL,
  CULTURE_DECK_QUIZ_QUESTIONS,
} = require("./utils.js");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.on("message", async (message) => {
  const { id: chat_id } = message.chat;
  const text = message.text;

  try {
    if (text == "/start") {
      return bot.sendMessage(chat_id, createWelcomeMessage(message.chat), {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Сайт LATOKEN", url: LATOKEN_URL }],
            [{ text: "Culture Deck Квиз", callback_data: "quiz" }],
          ],
        },
      });
    }

    const loader = await bot.sendMessage(chat_id, "♻️ Формирую ответ...");
    const gptResponse = await runPrompt(text);

    return await bot.editMessageText(gptResponse, {
      chat_id,
      message_id: loader.message_id,
    });
  } catch (e) {
    return bot.sendMessage(
      chat_id,
      "❌ Произошла ошибка, пожалуйста повторите попытку позже"
    );
  }
});

bot.on("callback_query", async (callbackQuery) => {
  const message = callbackQuery.message;
  const data = callbackQuery.data;
  const chat_id = message.chat.id;

  try {
    if (data == "quiz") {
      return bot.sendMessage(chat_id, CULTURE_DECK_QUIZ_QUESTIONS[0], {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Следующий вопрос", url: LATOKEN_URL }],
            [{ text: "Завершить", callback_data: "end_quiz" }],
          ],
        },
      });
    }

    if(data == "end_quiz") {
      
    }
  } catch (error) {
    return bot.sendMessage(
      chat_id,
      "❌ Произошла ошибка, пожалуйста повторите попытку позже"
    );
  }
});
