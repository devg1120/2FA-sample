import { generateAuthenticationOptions } from '@simplewebauthn/server'

export default defineEventHandler(async (event) => {
  // リクエストボディからメールアドレスを取得
  const { email } = await readBody(event)
  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid Request' })
  }

  // DBからユーザ情報を取得
  const user = getUserByEmail(email)
  if (!user || !user.credential_id) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid Request' })
  }

  // PublicKeyCredentialRequestOptionsJSONを生成する
  const options = await generateAuthenticationOptions({
    rpID: 'localhost',
    allowCredentials: [
      { id: user.credential_id },
    ],
    userVerification: 'preferred',
  })

  // challenge保存
  await event.context.session.update({ challenge: options.challenge })

  // PublicKeyCredentialRequestOptionsJSONを返却
  return options
})