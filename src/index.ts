require("dotenv").config();

import TelegramBot from "node-telegram-bot-api";

import { createWelcomeMessage, LATOKEN_URL, QUESTIONS } from "./utils";
import { checkQuestion, runPrompt } from "./openai-config";

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN ?? "", {
  polling: true,
});

let isQuizMode = false;
let questionIndex = 0;

bot.on("message", async (message) => {
  const { id: chat_id } = message.chat;
  const text = message.text ?? '';

  try {
    if (isQuizMode) {
      const loader = await bot.sendMessage(chat_id, "♻️ Формирую ответ...");
      const response = await checkQuestion(QUESTIONS[questionIndex], text);
      const { success, message: responseMessage } = response;

      if (success) {
        questionIndex++;
        if (questionIndex === QUESTIONS.length) {
          isQuizMode = false;
          questionIndex = 0;
          return await bot.editMessageText(
            `Верно!\nПоздравляю 🎉, вы ответили правильно на все вопросы, так держать!`,
            {
              chat_id,
              message_id: loader.message_id,
            }
          );
        }
        isQuizMode = false;
        return await bot.editMessageText(`Верно!`, {
          chat_id,
          message_id: loader.message_id,
          reply_markup: {
            inline_keyboard: [
              [{ text: "Следующий вопрос", callback_data: "next_question" }],
              [{ text: "Завершить Квиз", callback_data: "end_quiz" }],
            ],
          },
        });
      } else {
        return await bot.editMessageText(
          `Неправильно, попробуй еще раз!\n${responseMessage}`,
          {
            chat_id,
            message_id: loader.message_id,
            reply_markup: {
              inline_keyboard: [
                [{ text: "Завершить Квиз", callback_data: "end_quiz" }],
              ],
            },
          }
        );
      }
    } else {
      if (text === "/start") {
        return bot.sendMessage(chat_id, createWelcomeMessage(message.chat), {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Сайт LATOKEN", url: LATOKEN_URL }],
              [
                {
                  text: "Начать Culture Deck Квиз",
                  callback_data: "next_question",
                },
              ],
            ],
          },
        });
      }

      const loader = await bot.sendMessage(chat_id, "♻️ Формирую ответ...");
      const gptResponse = await runPrompt(text);

      return await bot.editMessageText(gptResponse, {
        chat_id,
        message_id: loader.message_id,
        parse_mode: "Markdown",
      });
    }
  } catch (e) {
    console.log(e);
    return bot.sendMessage(
      chat_id,
      "❌ Произошла ошибка, пожалуйста повторите попытку позже"
    );
  }
});

bot.on("callback_query", async (query) => {
  const message = query.message;
  if (!message) return;

  const data = query.data;
  const chat_id = message.chat.id;

  try {
    if (data === "next_question") {
      isQuizMode = true;
      await bot.answerCallbackQuery(query.id);
      return bot.sendMessage(chat_id, QUESTIONS[questionIndex], {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Завершить Квиз", callback_data: "end_quiz" }],
          ],
        },
      });
    }

    if (data === "end_quiz") {
      isQuizMode = false;
      questionIndex = 0;
      await bot.answerCallbackQuery(query.id);
      return bot.sendMessage(chat_id, createWelcomeMessage(message.chat), {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Сайт LATOKEN", url: LATOKEN_URL }],
            [{ text: "Culture Deck Квиз", callback_data: "next_question" }],
          ],
        },
      });
    }
  } catch (error) {
    return bot.sendMessage(
      chat_id,
      "❌ Произошла ошибка, пожалуйста повторите попытку позже"
    );
  }
});
