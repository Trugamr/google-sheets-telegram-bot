require('dotenv').config()

const Telegraf = require('telegraf')
const { TELEGRAM_BOT_TOKEN } = process.env

const bot = new Telegraf(TELEGRAM_BOT_TOKEN)

bot.start(ctx => {
  ctx.reply(`Hello ${ctx.from.username || ctx.from.first_name}`)
})

bot.launch()
