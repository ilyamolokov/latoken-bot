const { OpenAI } = require("openai");
const fs = require("fs");

const openai = new OpenAI();
let assistant;

async function main() {
  assistant = await openai.beta.assistants.create({
    name: "Latoken Culture Deck Assistant",
    instructions:
      "Ты помощник, который отвечает на вопросы пользователя по Latoken и Culture Deck",
    model: "gpt-4o",
    tools: [{ type: "file_search" }],
  });

  const fileStreams = [
    "docs/latoken-info.md",
    "docs/culture.md",
    "docs/cut-cancer.md",
    "docs/career-review.md",
    "docs/fire-good-ones-for-freedom.md",
    "docs/get-stock-options.md",
    "docs/goal-of-life-share-in-nasdaq-index.md",
    "docs/investors-vs-employees.md",
    "docs/report-free-riding.md",
    "docs/the-principles-olympics-of-freedom-and-responsibility-tob-build-the-future.md",
    "docs/wartime-principles.md",
    "docs/who-are-you.md",
    "docs/why-to-join-latoken.md",
  ].map((path) => fs.createReadStream(path));

  let vectorStore = await openai.beta.vectorStores.create({
    name: "Latoken and Culture Deck",
  });

  await openai.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
    files: fileStreams,
  });

  await openai.beta.assistants.update(assistant.id, {
    tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
  });
}

main();

function runPrompt(prompt) {
  return new Promise(async (resolve, reject) => {
    if (!assistant) {
      return reject("Assistant is not initialized.");
    }

    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content: `В ответе обязательно очищай Markdown разметку, не используй аннотации и сноски .\nПользователь: ${prompt}`,
        },
      ],
    });

    const stream = openai.beta.threads.runs
      .stream(thread.id, { assistant_id: assistant.id })
      // .on("textCreated", () => console.log("assistant >"))
      // .on("toolCallCreated", (event) => console.log("assistant " + event.type))
      .on("messageDone", async (event) => {
        if (event.content[0].type === "text") {
          const { text } = event.content[0];
          resolve(text.value);
        }
      });
  });
}

module.exports = {
  runPrompt,
};
