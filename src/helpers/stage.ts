import { Telegraf, Scenes } from 'telegraf'
import { SCENE } from '../const/sceneId'
import main from '../scenes/main'
import { PEContext } from '../types/custom-context'
import { RegisterScene } from '../scenes/RegisterScene'
import { UserMainScene } from '../scenes/UserMainScene'
const debug = require('debug')('bot:stage')

export function setupStage(bot: Telegraf<PEContext>) {
  const stage = new Scenes.Stage<PEContext>([main, RegisterScene, UserMainScene], { default: SCENE.DEFAULT })

  bot.use(stage.middleware())
  debug('Stage set')
}
