import { Middleware } from 'telegraf'
import phrases from '../helpers/strings'
import { PEContext } from '../types/custom-context'

const middleware: Middleware<PEContext> = async (ctx, next) => {
  console.log(ctx.chat.id, ctx.config.telegram.adminChatId)
  if (String(ctx.chat.id) === String(ctx.config.telegram.adminChatId)) {
    return next()
  }

  await ctx.reply(phrases.system.accessDenied())
  await ctx.scene.leave()
}
export default middleware
