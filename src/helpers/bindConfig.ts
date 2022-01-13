import { Telegraf } from 'telegraf'
import { BotConfig } from 'bot-config'
import { PEContext } from '../types/custom-context'

export default (bot: Telegraf<PEContext>, config: BotConfig) =>
  bot.use((ctx, next) => {
    ctx.config = config
    return next()
  })
