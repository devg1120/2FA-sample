export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', async (event) => {
    event.context.session = await useSession(event, {
      password: process.env.NUXT_SESSION_PASSWORD || '',
      cookie: {
        maxAge: 60 * 60 * 24, // 1 day
        secure: false,
        httpOnly: true,
      }
    })
  })
})

type sessionData = {
  userId?: string
  challenge?: string
}

declare module 'h3' {
  interface H3EventContext {
    session: Awaited<ReturnType<typeof useSession<sessionData>>>
  }
}
