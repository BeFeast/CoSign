import { customAlphabet } from 'nanoid'

const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'
const gen = customAlphabet(alphabet, 12)

export const id = () => gen()
export const token = () => customAlphabet(alphabet, 24)()

export const now = () => new Date().toISOString()
