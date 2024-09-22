import fs from "fs";
import { OpenAI } from "openai";
import { removeCitations } from "./utils";

const openai = new OpenAI();
let assistant: OpenAI.Beta.Assistants.Assistant;

async function main() {
  assistant = await openai.beta.assistants.create({
    name: "Latoken Culture Deck Assistant",
    instructions: "Ты бот помощник компании LATOKEN.",
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
    "docs/the-principles-olympics-of-freedom-and-responsibility-to-build-the-future.md",
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

export async function runPrompt(prompt: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    if (!assistant) {
      return reject("Assistant is not initialized.");
    }

    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content: `Пользователь: ${prompt}`,
        },
      ],
    });

    const stream = openai.beta.threads.runs
      .stream(thread.id, { assistant_id: assistant.id })
      .on("messageDone", async (event) => {
        if (event.content[0].type !== "text") return;
        const { text } = event.content[0];
        resolve(removeCitations(text.value));
      });
  });
}

interface IAnswerStatus {
  success: boolean;
  message: string;
}
export async function checkQuestion(
  question: string,
  userAnswer: string
): Promise<IAnswerStatus> {
  return new Promise(async (resolve, reject) => {
    if (!assistant) {
      return reject("Assistant is not initialized.");
    }

    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content: `Проверь правильно ли пользователь ответил на вопрос, ответ считается правильным если он включает 70% ключевых моментов. Верни строку в формате ключ=значение, где поле success — это true или false, поле message — это строка с комментарием для пользователя, не длиннее 100 символов, поля должны быть разделены символом |. Пример: success=true|message=Операция выполнена успешно.\nВопрос:${question}\nОтвет пользователя: ${userAnswer}`,
        },
      ],
    });

    const stream = openai.beta.threads.runs
      .stream(thread.id, { assistant_id: assistant.id })
      .on("messageDone", async (event) => {
        if (event.content[0].type !== "text") return;

        const { text } = event.content[0];
        const result = {} as IAnswerStatus;
        const string = text.value;
        const pairs = string.split("|");

        pairs.forEach((pair) => {
          const [k, v] = pair.split("=");
          const key = k.trim();
          const value = v.trim();

          if (key === "success") {
            result[key] = value === "true" ? true : false;
          }

          if (key === "message") {
            result[key] = removeCitations(value);
          }
        });
        resolve(result);
      });
  });
}
