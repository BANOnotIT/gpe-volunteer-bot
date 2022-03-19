import { Markup, Scenes } from 'telegraf'
import { SCENE } from '../const/sceneId'
import { PEContext } from '../types/custom-context'
import phrases from '../helpers/strings'
import { join } from 'path'

const sceneKeyboard = Markup.keyboard([
  [
    Markup.button.text(phrases.professions.ballHandler.categoryBtn()),
    Markup.button.text(phrases.professions.cleaner.categoryBtn()),
    Markup.button.text(phrases.professions.advertisers.categoryBtn()),
  ],
  [Markup.button.text(phrases.common.backBtn())],
])
  .resize(true)
  .oneTime(true)

enum VideoExamplesActions {
  ballHandler = 'prof:vid:ballHandler',
  cleaner = 'prof:vid:cleaner',
}

export const ProfessionsScene = new Scenes.BaseScene<PEContext>(SCENE.PROFESSIONS)
  .hears(phrases.professions.ballHandler.categoryBtn(), async (ctx, next) => {
    const currentPhrases = phrases.professions.ballHandler
    const videoKeyboard = Markup.inlineKeyboard([
      Markup.button.callback(currentPhrases.examplesBtn(), VideoExamplesActions.ballHandler),
    ])
    await ctx.reply(currentPhrases.rules__html(), { parse_mode: 'HTML', reply_markup: videoKeyboard.reply_markup })
    return next()
  })
  .hears(phrases.professions.cleaner.categoryBtn(), async (ctx, next) => {
    const currentPhrases = phrases.professions.cleaner
    const videoKeyboard = Markup.inlineKeyboard([
      Markup.button.callback(currentPhrases.examplesBtn(), VideoExamplesActions.cleaner),
    ])
    await ctx.reply(currentPhrases.rules__html(), { parse_mode: 'HTML', reply_markup: videoKeyboard.reply_markup })
    return next()
  })
  .hears(phrases.professions.advertisers.categoryBtn(), async (ctx, next) => {
    const currentPhrases = phrases.professions.advertisers

    await ctx.reply(currentPhrases.rules__html(), { parse_mode: 'HTML' })
    return next()
  })
  .hears(phrases.common.backBtn(), async (ctx) => ctx.scene.enter(SCENE.USER_MAIN))
  .action(VideoExamplesActions.ballHandler, async (ctx) => {
    const currentPhrases = phrases.professions.ballHandler.video
    await ctx.replyWithVideo(
      { source: join(process.cwd(), 'files', 'ball.giveOut.mp4') },
      {
        caption: currentPhrases.giveOut(),
      },
    )
    await ctx.replyWithVideo(
      { source: join(process.cwd(), 'files', 'ball.pass.mp4') },
      {
        caption: currentPhrases.pass(),
      },
    )
  })
  .action(VideoExamplesActions.cleaner, async (ctx) => {
    const currentPhrases = phrases.professions.cleaner.video
    await ctx.replyWithVideo(
      { source: join(process.cwd(), 'files', 'cleaner.mp4') },
      {
        caption: currentPhrases.simple(),
      },
    )
  })
  .enter(replyWithMainView)
  .use(replyWithMainView)

async function replyWithMainView(ctx: PEContext) {
  await ctx.reply(phrases.professions.generalInfo(), sceneKeyboard)
}
