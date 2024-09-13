const { OpenAI } = require("openai");
const { CONTEXT } = require("./utils.js");

const client = new OpenAI();

async function runPrompt(prompt) {
  const response = await client.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "Ты помощник, который отвечает только на вопросы по тексту. Не используй Markdown разметку",
      },
      {
        role: "user",
        content: `Текст: ${CONTEXT}\nПользователь: ${prompt}`,
      },
    ],
    model: "gpt-4o",
  });

  return response.choices[0].message.content;
}

module.exports = {
  runPrompt,
};
