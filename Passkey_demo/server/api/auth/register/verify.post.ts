import { verifyRegistrationResponse } from '@simplewebauthn/server'

export default defineEventHandler(async (event) => {
  // メールアドレスとAuthenticatorAttestationResponse）を取得
  const { email, attestationResponse } = await readBody(event)
  if (!email || !attestationResponse) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid Request' })
  }

  // 保存しておいたchallengeを取得
  const { challenge } = event.context.session.data
  if (!challenge) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid Request' })
  }

  // DBからユーザ情報を取得
  const user = getUserByEmail(email)
  if (!user) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid Request' })
  }

  // リクエストを検証
  const { verified, registrationInfo } = await verifyRegistrationResponse({
    response: attestationResponse,
    expectedChallenge: challenge,
    expectedOrigin: 'http://localhost:3000',
    expectedRPID: 'localhost',
  })

  // 検証に成功したらDBに保存
  if (verified && registrationInfo) {
    saveUser({
      ...user,
      credential_id: registrationInfo.credential.id,
      public_key: registrationInfo.credential.publicKey,
      counter: registrationInfo.credential.counter,
    })
  }

  // セッションからchallengeを削除
  await event.context.session.update({ challenge: undefined })

  // 検証結果を返す
  return { verified }
})