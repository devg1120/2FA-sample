<script setup lang="ts">
import { startRegistration, startAuthentication } from '@simplewebauthn/browser'

const username = ref('')
const isUserNameValid = computed(() => username.value.trim().length > 0)

const register = async (email: string): Promise<void> => {
  // PublicKeyCredentialCreationOptionsを取得する
  const options = await $fetch('/api/auth/register/options', {
    method: 'POST',
    body: { email },
  })

  // WebAuthnAPI経由で認証器に認証情報をリクエスト
  // startRegistrationは内部でnavigator.credentials.create()を呼び出す
  // 認証器はユーザ検証（本人確認）を行う
  const attestationResponse = await startRegistration({ optionsJSON: options })

  // attestationResponseを送信して登録する
  const { verified } = await $fetch('/api/auth/register/verify', {
    method: 'POST',
    body: {
      email,
      attestationResponse,
    },
  })

  // 結果を表示
  alert(verified ? '登録成功' : '登録失敗')
}

const login = async (email: string): Promise<void> => {
  // PublicKeyCredentialRequestOptionsを取得する
  const options = await $fetch('/api/auth/login/options', {
    method: 'POST',
    body: { email },
  })

  // WebAuthnAPI経由で認証器に認証リクエストを送信
  // startAuthenticationは内部でnavigator.credentials.get()を呼び出す
  // 認証器はユーザ検証（本人確認）を行う
  const assertionResponse = await startAuthentication({ optionsJSON: options })

  // assertionResponseを送信して認証する
  const { verified } = await $fetch('/api/auth/login/verify', {
    method: 'POST',
    body: {
      email,
      assertionResponse,
    },
  })

  // 認証に失敗したらアラートを表示して終了
  if (!verified) {
    alert('ログイン失敗')
    return
  }

  // 認証が成功したら保護されたページに遷移
  await navigateTo('/protected', { external: true })
}
</script>

<template>
  <div class="container">
    <h1 class="title">Passkey 認証デモ</h1>
    <label class="label">ユーザー名</label>
    <input
        v-model="username"
        type="text"
        placeholder="demo@example.com"
        class="input"
    />
    <button
        @click="register(username)"
        class="button register"
        :class="{
          disabled: !isUserNameValid
        }"
        :disabled="!isUserNameValid"
    >🔐 パスキー登録</button>
    <button
        @click="login(username)"
        class="button login"
        :class="{
          disabled: !isUserNameValid
        }"
        :disabled="!isUserNameValid"
    >➡️ ログイン</button>
  </div>
</template>

<style scoped>
.container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  font-family: sans-serif;
}
.title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  text-align: center;
}
.label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}
.input {
  width: 100%;
  padding: 0.6rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 1rem;
}
.button {
  display: block;
  width: 100%;
  padding: 0.6rem;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  margin-bottom: 0.75rem;
  cursor: pointer;
}
.disabled {
  cursor: not-allowed;
}
.register {
  background-color: #0070f3;
  color: white;
}
.login {
  background-color: #00b894;
  color: white;
}
</style>