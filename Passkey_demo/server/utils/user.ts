import path from 'node:path'
import Database from 'better-sqlite3'

const dbFilePath = path.join(process.cwd(), 'db.sqlite')
const db = new Database(dbFilePath, { fileMustExist: true })

type User = {
  id: string
  email: string
  credential_id?: string
  public_key?: Uint8Array
  counter?: number
}

export const getUserByEmail = (email: string): User | undefined => {
  return db.prepare<string, User>('SELECT * FROM users WHERE email = ?').get(email)
}

export const saveUser = (user: User): void => {
  db.prepare(`
    INSERT OR REPLACE INTO users
    (id, email, credential_id, public_key, counter)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    user.id,
    user.email,
    user.credential_id,
    user.public_key,
    user.counter,
  )
}