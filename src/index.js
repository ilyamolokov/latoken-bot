// choices[0].message.content
require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");

const { runPrompt } = require("./openai-config.js");
const { createWelcomeMessage, LATOKEN_URL } = require("./utils.js");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.on("message", async (msg) => {
  const { id: chat_id } = msg.chat;
  const text = msg.text;
  const welcomeMessage = createWelcomeMessage(msg.chat);

  try {
    if (text == "/start") {
      return bot.sendMessage(chat_id, welcomeMessage, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Сайт LATOKEN", url: LATOKEN_URL }],
            [{ text: "Квиз", url: LATOKEN_URL }],
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
