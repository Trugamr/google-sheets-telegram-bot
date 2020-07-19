require('dotenv').config()

const Telegraf = require('telegraf')
const axios = require('axios')
const { TELEGRAM_BOT_TOKEN } = process.env

const bot = new Telegraf(TELEGRAM_BOT_TOKEN)

bot.start(ctx => {
  ctx.reply(`Hello ${ctx.from.username || ctx.from.first_name}`)
})

// Google Sheets
// LINK https://docs.google.com/spreadsheets/d/1efBLqeNzl0bnbezXL-bme-wyK4NLS8bZ3fvWfmDuACA/edit#gid=1062363836
// JSON LINK https://spreadsheets.google.com/feeds/cells/1efBLqeNzl0bnbezXL-bme-wyK4NLS8bZ3fvWfmDuACA/1/public/full?alt=json
// JSON LINK TEMPLATE https://spreadsheets.google.com/feeds/cells/<ID>/<SHEENUMBER>/public/full?alt=json

let dataStore = []

const getData = async () => {
  try {
    const response = await axios.get(
      'https://spreadsheets.google.com/feeds/cells/1efBLqeNzl0bnbezXL-bme-wyK4NLS8bZ3fvWfmDuACA/1/public/full?alt=json'
    )
    const data = response.data
    const entries = data.feed.entry

    entries.forEach(entry => {
      dataStore.push({
        row: entry.gs$cell.row,
        col: entry.gs$cell.col,
        value: entry.gs$cell.$t
      })
    })
  } catch (error) {
    console.log('FAILED TO GET GOOGLE SHEETS DATA', error)
  }
}

// Get Data on start
getData()

// Commands
bot.command('fact', ctx => {
  let maxRow = dataStore.find(item => item['row'] == '1' && item['col'] == '2')
  if (maxRow) maxRow = parseInt(maxRow['value'])
  else return

  const randomNumber = Math.floor(Math.random() * maxRow) + 1

  const fact = dataStore.find(
    item => item['row'] == randomNumber.toString() && item['col'] == '5'
  )['value']

  ctx.reply(
    `
  *Fact #${randomNumber}:*
  _${fact}_
  `,
    {
      parse_mode: 'markdown'
    }
  )
})

bot.command('update', async ctx => {
  try {
    dataStore = []
    await getData()
    ctx.reply('Updated data.')
  } catch (error) {
    console.log('FAILED TO UPDATE DATA', error)
    ctx.reply('Failed to update data.')
  }
})

bot.launch()
