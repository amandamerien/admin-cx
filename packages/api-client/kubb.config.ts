import { defineConfig, type UserConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginReactQuery } from '@kubb/plugin-react-query'
import { pluginTs } from '@kubb/plugin-ts'

/**
 * Kubb lê o OpenAPI da API (apps/api/openapi.yaml) e gera:
 *  - models/  → tipos TypeScript de cada rota
 *  - hooks/   → hooks do TanStack Query (queries + mutations), por tag
 * Cliente HTTP: axios (configurado em src/setup.ts).
 */
export default defineConfig({
  input: {
    path: '../../apps/api/openapi.yaml',
  },
  output: {
    path: './gen',
    clean: true,
    format: false,
  },
  plugins: [
    pluginOas({ generators: [] }),
    pluginTs({
      output: { path: 'models' },
    }),
    pluginReactQuery({
      output: { path: './hooks' },
      group: {
        type: 'tag',
        name: ({ group }) => `${group}Hooks`,
      },
      client: {
        dataReturnType: 'full',
      },
      mutation: {
        methods: ['post', 'put', 'patch', 'delete'],
      },
      infinite: false,
      query: {
        methods: ['get'],
        importPath: '@tanstack/react-query',
      },
      suspense: {},
    }),
  ],
}) as UserConfig
