import { verifyAuthenticationResponse } from '@simplewebauthn/server'

export default defineEventHandler(async (event) => {
  // メールアドレスとAuthenticatorAssertionResponseを取得
  const { email, assertionResponse } = await readBody(event)
  if (!email || !assertionResponse) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid Request' })
  }

  // 保存しておいたchallengeを取得
  const { challenge } = event.context.session.data
  if (!challenge) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid Request' })
  }

  // DBからユーザ情報を取得
  const user = getUserByEmail(email)
  if (!user?.credential_id || !user?.public_key || user?.counter === undefined) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid Request' })
  }

  // リクエストを検証
  const { verified, authenticationInfo } = await verifyAuthenticationResponse({
    response: assertionResponse,
    expectedChallenge: challenge,
    expectedOrigin: 'http://localhost:3000',
    expectedRPID: 'localhost',
    credential: {
      id: user.credential_id,
      publicKey: user.public_key,
      counter: user.counter,
    },
  })

  // 検証に成功した場合
  if (verified) {
    // counterを更新
    saveUser({ ...user, counter: authenticationInfo.newCounter })

    // セッションにログインユーザのIDをセット
    await event.context.session.update({
      userId: user.id,
      challenge: undefined,
    })
  }

  // 検証結果を返す
  return { verified }
})