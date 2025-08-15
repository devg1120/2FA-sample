# WebAutun Example

Simple example of WebAuthn using Hono.

## Setup

```bash
cd backend
npm install
# init database
npm run init:db
npm run dev
```

```bash
cd frontend
npx serve -p 3001
```

## Test

1. Create Passkey test http://localhost:3001/register
2. Sign in test http://localhost:3001/signin
