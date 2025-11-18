require("dotenv").config();
const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

// ======================= ЛОГИ ==========================
console.log("OWNER_ID:", process.env.OWNER_ID);
console.log("CHANNEL_ID:", process.env.CHANNEL_ID);
console.log("THREAD_CHAT_ID:", process.env.THREAD_CHAT_ID);

// ======================= /post ==========================
bot.command("post", async (ctx) => {
  const userId = ctx.from.id;
  const OWNER_ID = Number(process.env.OWNER_ID);

  if (userId !== OWNER_ID) {
    return ctx.reply("❌ У вас нет прав публиковать посты.");
  }

  const text = ctx.message.text.replace("/post", "").trim();

  if (!text) {
    return ctx.reply(
      "Напиши текст после команды:\n\n`/post Текст твоего поста`"
    );
  }

  try {
    await ctx.telegram.sendMessage(process.env.CHANNEL_ID, text);
    ctx.reply("✅ Пост опубликован в канал!");
  } catch (error) {
    console.error("Ошибка публикации:", error.description);
    ctx.reply(
      "❌ Ошибка публикации. Проверь CHANNEL_ID и полномочия бота в канале."
    );
  }
});

console.log("DEBUG: OWNER_ID from env =", JSON.stringify(process.env.OWNER_ID));
bot.command("debug", (ctx) => {
  ctx.reply(`OWNER_ID: "${process.env.OWNER_ID}"\nYour ID: "${ctx.from.id}"`);
});


// ======================= /chatid ==========================
bot.command("chatid", (ctx) => {
  ctx.reply(`Chat ID: ${ctx.chat.id}`);
});

// ======================= АВТООТВЕТЫ В КОММЕНТАРИЯХ ==========================
bot.on("message", async (ctx) => {
  const chatId = ctx.chat.id;

  if (String(chatId) === process.env.THREAD_CHAT_ID) {
    const msg = ctx.message.text?.toLowerCase() || "";

    if (msg.includes("привет")) {
      return ctx.reply("Привет! Я присматриваю за комментариями 😎");
    }

    if (msg.includes("бот")) {
      return ctx.reply("Кто звал бота? Я тут 🤖🔥");
    }

    if (msg.includes("дрон") || msg.includes("коптер")) {
      return ctx.reply("Дроны — это стиль жизни 🚁🔥");
    }

    const jokes = [
      "Звучит убедительно… почти 😏",
      "Записываю в мудрости канала 📚😂",
      "Интересное мнение… *очень* интересное 😅",
      "Сильно сказано. Ничего не понятно, но очень интересно 👀, наверное)",
      "👀"
    ];

    if (Math.random() < 0.07) {
      const joke = jokes[Math.floor(Math.random() * jokes.length)];
      return ctx.reply(joke);
    }
  }
});

// ======================= /start ==========================
bot.start((ctx) =>
  ctx.reply(
    "🔥 Привет! Я CrazyBot — бот канала *Crazy life*.\n\n" +
    "Команды:\n" +
    "• /post — публиковать посты в канал (только владелец)\n" +
    "• /chatid — получить ID чата\n" +
    "• Автоответы под постами канала уже включены 😎"
  )
);

// ======================= ЗАПУСК ==========================
bot.launch();
console.log("🤖 Бот запущен!");
