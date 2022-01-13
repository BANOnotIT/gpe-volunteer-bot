declare module 'bot-config' {
  export type BotConfig = {
    server: {
      /**
       * Порт, на котором должен слушать webhook
       */
      port: string
    }
    telegram: {
      /**
             * Если установлен, например `http://domain.com/path`, то зарегистрирует этот вебхук у телеграма
             и запустит локальный http сервер на порту {@link server.port} с прослушкой на `/path`.
             * Если не установлен, то будет использоваться Longpoll
             */
      webhook: null | string
      /**
       * Bot API token для телеграма. Получить можно у https://t.me/BotFather.
       */
      token: string
      /**
       * ID чата с админами
       */
      adminChatId: number
    }
    /**
         * URL к Redis. Если установлено, то все сессии хранятся там,
         если не установлено, то в памяти процесса.
         */
    redis?: string

    /**
     * {@link https://knexjs.org/#Installation-client}
     */
    database: { connection: string }
  }
}
