require("dotenv").config();
const { Telegraf } = require("telegraf");
const OpenAI = require("openai");

const bot = new Telegraf(process.env.BOT_TOKEN);

// === OPENAI ===
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Модель GPT по умолчанию
const MODEL = process.env.OPENAI_MODEL || "gpt-5.1-flash";

// === Решаем, когда GPT должен отвечать ===
function shouldGPTReply(ctx) {
  const msg = ctx.message;
  if (!msg?.text) return false;

  // игнорируем сообщения от других ботов
  if (msg.from?.is_bot) return false;

  // 1) В личке — всегда отвечаем
  if (ctx.chat.type === "private") return true;

  // 2) В группе — если есть упоминание
  const entities = msg.entities || [];
  const hasMention = entities.some(
    (e) => e.type === "mention" || e.type === "text_mention"
  );

  // 3) Если ответили на сообщение бота
  const repliedToBot =
    msg.reply_to_message &&
    msg.reply_to_message.from &&
    msg.reply_to_message.from.id === ctx.botInfo.id;

  return hasMention || repliedToBot;
}

// === GPT-ответы ===
bot.on("text", async (ctx) => {
  try {
    if (!shouldGPTReply(ctx)) return;

    const userText = ctx.message.text;

    await ctx.sendChatAction("typing");

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "Ты — Крейзи Лось, дерзкий, смешной, слегка токсичный, но дружелюбный бот. " +
            "Общайся на 'ты', с юмором и сарказмом. Не используй мат, политику, экстремизм. " +
            "Отвечай живо, по-человечески."
        },
        {
          role: "user",
          content: userText
        }
      ],
      temperature: 0.9,
      max_tokens: 350
    });

    const reply = completion.choices[0]?.message?.content || "Эээ… завис 🤯";

    return ctx.reply(reply, {
      reply_to_message_id: ctx.message.message_id
    });

  } catch (err) {
    console.error("GPT ERROR:", err);
  }
});

// === /start ===
bot.start((ctx) =>
  ctx.reply("Привет! Я CrazyBot теперь полностью на GPT 😎")
);

// === запуск ===
bot.launch();
console.log("🤖 GPT-бот запущен!");
