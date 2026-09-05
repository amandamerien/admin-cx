import { axiosInstance } from '@kubb/plugin-client/clients/axios'

/**
 * Configura o axios que o Kubb usa nos hooks: baseURL da API e
 * `withCredentials` (para enviar o cookie de sessão do Better Auth).
 * Chame uma vez no entrypoint do app (main.tsx) antes de renderizar.
 */
export function setupApiClient(baseURL: string) {
  axiosInstance.defaults.baseURL = baseURL
  axiosInstance.defaults.withCredentials = true
}

export { axiosInstance }
