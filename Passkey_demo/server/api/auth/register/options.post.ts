import { randomUUID } from 'node:crypto'
import { generateRegistrationOptions } from '@simplewebauthn/server'
import { isoUint8Array } from '@simplewebauthn/server/helpers'

export default defineEventHandler(async (event) => {
  // リクエストボディからメールアドレスを取得
  const { email } = await readBody(event)
  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid Request' })
  }

  // ユーザIDを生成
  const id = randomUUID()

  // PublicKeyCredentialCreationOptionsJSONを生成する
  // ここで生成したPublicKeyCredentialCreationOptionsJSONはクライアント側でstartRegistration()に渡す
  const options = await generateRegistrationOptions({
    rpName: 'PassKeyDemo',
    rpID: 'localhost',
    userID: isoUint8Array.fromUTF8String(id),
    userName: email,
    attestationType: 'none',
    authenticatorSelection: {
      userVerification: 'preferred',
      residentKey: 'required'
    }
  })

  // ユーザ情報を保存
  saveUser({ id, email })

  // challenge保存
  await event.context.session.update({ challenge: options.challenge })

  // PublicKeyCredentialCreationOptionsJSONを返却
  return options
})