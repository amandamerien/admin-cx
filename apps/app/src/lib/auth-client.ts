import { createAuthClient } from 'better-auth/react'

/**
 * Client do Better Auth. baseURL aponta para a API; o basePath padrão
 * (/api/auth) casa com o servidor.
 */
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3333',
})

export const { signIn, signUp, signOut, useSession } = authClient
