import { Scenes } from 'telegraf'
import checkUserIsAdmin from '../middlewares/checkUserIsAdmin'
import { SCENE } from '../const/sceneId'
import { PEContext } from '../types/custom-context'

const scene = new Scenes.BaseScene<PEContext>(SCENE.DEFAULT)
scene
  // .command('help')
  .command('admin', checkUserIsAdmin)
  .use(replyWithMainView)

async function replyWithMainView(ctx: PEContext) {
  if (ctx.chat.id !== ctx.config.telegram.adminChatId) {
    return ctx.scene.enter(SCENE.USER_MAIN)
  }
}

export default scene
