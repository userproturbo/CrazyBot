
require("dotenv").config();
const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

// СНАЧАЛА команды
bot.command("chatid", (ctx) => {
  ctx.reply(`Chat ID: ${ctx.chat.id}`);
});

// ПОТОМ общий обработчик сообщений
bot.on("message", async (ctx) => {
  const chatId = ctx.chat.id;

  if (String(chatId) === process.env.THREAD_CHAT_ID) {
    const msg = ctx.message.text?.toLowerCase() || "";

    if (msg.includes("привет")) {
      return ctx.reply("Привет! Я слежу за порядком под постами 😎");
    }

    if (msg.includes("бот")) {
      return ctx.reply("Кто сказал 'бот'? Я тут! 🤖🔥");
    }

    if (msg.includes("дрон")) {
      return ctx.reply("Дроны — жизнь. Ждём новых полётов 🚁🔥");
    }

    const jokes = [
      "Интересно... но звучит как бред 🤨",
      "Записал в великие мысли канала 🧠😂",
      "Ой всё 😏",
      "Можно было и лучше 😅",
    ];

    if (Math.random() < 0.08) {
      const joke = jokes[Math.floor(Math.random() * jokes.length)];
      return ctx.reply(joke);
    }
  }
});

// /start и т.д. ниже
bot.start((ctx) =>
  ctx.reply("Привет! Я CrazyBot — бот канала Crazy life. Готов публиковать и троллить 😎")
);

bot.launch();
console.log("Бот запущен 🤖");
