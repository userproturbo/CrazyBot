require("dotenv").config();
const { Telegraf } = require("telegraf");
const OpenAI = require("openai");

const bot = new Telegraf(process.env.BOT_TOKEN);

// =============== OPENAI ===============
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const MODEL = process.env.OPENAI_MODEL || "gpt-5.1-flash";

// =============== РЕШАЕМ, ОТВЕЧАТЬ ЛИ GPT ===============
function shouldGPTReply(ctx) {
  const msg = ctx.message;
  if (!msg || !msg.text) return false;

  if (msg.from?.is_bot) return false;

  const chatType = ctx.chat.type;

  // В ЛИЧКЕ — всегда отвечаем
  if (chatType === "private") return true;

  // В группе — если есть упоминание или ответ боту
  const entities = msg.entities || [];
  const hasMention = entities.some(
    (e) => e.type === "mention" || e.type === "text_mention"
  );

  const isReplyToBot =
    msg.reply_to_message &&
    msg.reply_to_message.from &&
    ctx.botInfo &&
    msg.reply_to_message.from.id === ctx.botInfo.id;

  return hasMention || isReplyToBot;
}

// =============== GPT 5.1 ОТВЕТ ===============
bot.on("text", async (ctx) => {
  try {
    if (!shouldGPTReply(ctx)) return;

    const userText = ctx.message.text;

    await ctx.sendChatAction("typing");

    const response = await openai.responses.create({
      model: MODEL,
      input: [
        {
          role: "system",
          content:
            "Ты — дерзкий, смешной, слегка токсичный, но дружелюбный бот по имени Крейзи Лось. " +
            "Общайся на 'ты', используй юмор, подколы, сарказм, но не оскорбляй. " +
            "Без политики, мата, экстремизма. Пиши живо, коротко или средне."
        },
        {
          role: "user",
          content: userText
        }
      ],
      max_output_tokens: 300,
      temperature: 0.9
    });

    const replyText =
      response.output_text || "Мне даже нечего сказать… 😅";

    return ctx.reply(replyText, {
      reply_to_message_id: ctx.message.message_id
    });
  } catch (err) {
    console.error("GPT error:", err);
    return ctx.reply("⚠️ Ошибка GPT, попробуй позже.");
  }
});

// =============== ЗАПУСК ===============
bot.launch();
console.log("🤖 GPT бот запущен!");
