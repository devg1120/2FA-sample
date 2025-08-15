export default defineEventHandler((event) => {
  // 未ログインの場合はトップページにリダイレクト
  if (!event.context.session.data.userId) {
    return sendRedirect(event, '/')
  }

  return 'This is a protected page!'
})