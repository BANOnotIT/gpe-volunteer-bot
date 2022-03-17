import { Telegraf } from 'telegraf'
import * as url from 'url'
import { Connection, createConnection } from 'typeorm'

import { bindSession } from './helpers/redisSession'
import { setupStage } from './helpers/stage'
import bindConfig from './helpers/bindConfig'
import { BotConfig } from 'bot-config'
import { PEContext } from './types/custom-context'
import { Application } from './models/Application'
import { Event } from './models/Event'

const config = require('config') as BotConfig
const debug = require('debug')('bot')

async function setupDb(): Promise<Connection> {
  return createConnection({
    type: 'postgres',
    url: config.database.connection,
    synchronize: true,
    entities: [Application, Event],
  })
}

async function setupBot() {
  const bot = new Telegraf<PEContext>(config.telegram.token)

  bindConfig(bot, config)

  await bindSession(bot, config.redis)

  setupStage(bot)

  // Раньше можно было в HTTP Response выдать команду, вместо ещё одного запроса.
  // Теперь так делать нельзя
  bot.telegram.webhookReply = false

  let webhookConfig: Telegraf.LaunchOptions['webhook'] = undefined
  if (config.telegram.webhook) {
    const webhook = new url.URL(config.telegram.webhook)
    await bot.telegram.setWebhook(webhook.href)
    webhookConfig = {
      port: +config.server.port,
      hookPath: webhook.pathname,
    }
  }

  await bot.launch({
    webhook: webhookConfig,
  })
  if (webhookConfig) debug('Bot started with WebHook on ' + config.telegram.webhook)
  else debug('Bot started with longpoll')
}

Promise.resolve()
  .then(setupDb)
  .then(setupBot)
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
