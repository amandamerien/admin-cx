import { z } from 'zod'
import { tp } from '@/utils/fastify.js'
import { exigirEscrita, exigirGestaoDeEquipe, exigirSessao } from './guarda.js'
import {
  acessoInputSchema,
  acessoSchema,
  acessosEquipeSchema,
  administradorInputSchema,
  administradorPatchSchema,
  administradorSchema,
  anotacaoInputSchema,
  anotacaoPatchSchema,
  anotacaoSchema,
  arquivoInputSchema,
  arquivoSchema,
  atividadesSchema,
  clienteInputSchema,
  clientePatchSchema,
  clienteSchema,
  erroSchema,
  funilInputSchema,
  funilPatchSchema,
  funilSchema,
  invoiceInputSchema,
  invoiceSchema,
  invoicesSchema,
  itemChecklistPatchSchema,
  itemChecklistSchema,
  notaInputSchema,
  notaSchema,
  okSchema,
  painelSchema,
} from './schemas.js'

const paramsId = z.object({ id: z.string() })

/**
 * Rotas do painel de clientes.
 *
 * Toda rota exige sessão; as de escrita exigem também o papel (a mesma matriz
 * de permissões que a tela usa para esconder botões). O GET /painel devolve o
 * retrato inteiro porque a tela trabalha com as listas em memória e filtra
 * client-side — uma chamada, um render.
 */
export const painelRoute = tp(async (scope) => {
  // ─── Retrato completo ─────────────────────────────────────

  scope.get(
    '/painel',
    {
      schema: {
        tags: ['Painel'],
        summary: 'Tudo que a área de clientes precisa para montar',
        response: { 200: painelSchema, 401: erroSchema, 403: erroSchema },
      },
    },
    async (request, reply) => {
      if (!(await exigirSessao(scope, request, reply))) return
      return reply.status(200).send(await scope.services.painel.getPainel())
    },
  )

  // ─── Clientes ─────────────────────────────────────────────

  scope.post(
    '/clientes',
    {
      schema: {
        tags: ['Clientes'],
        summary: 'Cadastra um cliente (já cria o checklist de onboarding)',
        body: clienteInputSchema,
        response: { 201: clienteSchema, 401: erroSchema, 403: erroSchema },
      },
    },
    async (request, reply) => {
      const autor = await exigirEscrita(scope, request, reply)
      if (!autor) return

      const cliente = await scope.services.painel.criarCliente(request.body)
      await scope.services.painel.registrarAtividade({
        autorId: autor.id,
        autorNome: autor.nome,
        acao: 'cliente_criado',
        alvo: cliente.nome,
      })
      return reply.status(201).send(cliente)
    },
  )

  scope.patch(
    '/clientes/:id',
    {
      schema: {
        tags: ['Clientes'],
        summary: 'Edita um cliente',
        params: paramsId,
        body: clientePatchSchema,
        response: {
          200: clienteSchema,
          401: erroSchema,
          403: erroSchema,
          404: erroSchema,
        },
      },
    },
    async (request, reply) => {
      if (!(await exigirEscrita(scope, request, reply))) return
      const cliente = await scope.services.painel.atualizarCliente(
        request.params.id,
        request.body,
      )
      if (!cliente)
        return reply.status(404).send({ error: 'Cliente não encontrado' })
      return reply.status(200).send(cliente)
    },
  )

  scope.delete(
    '/clientes/:id',
    {
      schema: {
        tags: ['Clientes'],
        summary: 'Exclui o cliente e tudo que pende dele',
        params: paramsId,
        response: {
          200: okSchema,
          401: erroSchema,
          403: erroSchema,
          404: erroSchema,
        },
      },
    },
    async (request, reply) => {
      if (!(await exigirEscrita(scope, request, reply))) return
      const ok = await scope.services.painel.excluirCliente(request.params.id)
      if (!ok)
        return reply.status(404).send({ error: 'Cliente não encontrado' })
      return reply.status(200).send({ ok })
    },
  )

  // ─── Funis ────────────────────────────────────────────────

  scope.post(
    '/funis',
    {
      schema: {
        tags: ['Funis'],
        summary: 'Cadastra um funil',
        body: funilInputSchema,
        response: { 201: funilSchema, 401: erroSchema, 403: erroSchema },
      },
    },
    async (request, reply) => {
      const autor = await exigirEscrita(scope, request, reply)
      if (!autor) return

      const funil = await scope.services.painel.criarFunil(request.body)
      await scope.services.painel.registrarAtividade({
        autorId: autor.id,
        autorNome: autor.nome,
        acao: 'entrega_criada',
        alvo: funil.nome,
      })
      return reply.status(201).send(funil)
    },
  )

  scope.patch(
    '/funis/:id',
    {
      schema: {
        tags: ['Funis'],
        summary: 'Edita o funil (etapa, status, responsável, entrega)',
        params: paramsId,
        body: funilPatchSchema,
        response: {
          200: funilSchema,
          401: erroSchema,
          403: erroSchema,
          404: erroSchema,
        },
      },
    },
    async (request, reply) => {
      const autor = await exigirEscrita(scope, request, reply)
      if (!autor) return
      const funil = await scope.services.painel.atualizarFunil(
        request.params.id,
        request.body,
      )
      if (!funil)
        return reply.status(404).send({ error: 'Funil não encontrado' })

      /* Só a mudança de status vira notícia: renomear ou trocar a data não
         interessa a quem está olhando o feed. */
      if (request.body.status) {
        await scope.services.painel.registrarAtividade({
          autorId: autor.id,
          autorNome: autor.nome,
          acao: 'entrega_movida',
          alvo: funil.nome,
          detalhe: funil.status,
        })
      }

      return reply.status(200).send(funil)
    },
  )

  scope.delete(
    '/funis/:id',
    {
      schema: {
        tags: ['Funis'],
        summary: 'Exclui um funil',
        params: paramsId,
        response: {
          200: okSchema,
          401: erroSchema,
          403: erroSchema,
          404: erroSchema,
        },
      },
    },
    async (request, reply) => {
      if (!(await exigirEscrita(scope, request, reply))) return
      const ok = await scope.services.painel.excluirFunil(request.params.id)
      if (!ok) return reply.status(404).send({ error: 'Funil não encontrado' })
      return reply.status(200).send({ ok })
    },
  )

  // ─── Arquivos ─────────────────────────────────────────────

  scope.post(
    '/arquivos',
    {
      schema: {
        tags: ['Clientes'],
        summary: 'Adiciona um link de material ao cliente',
        body: arquivoInputSchema,
        response: { 201: arquivoSchema, 401: erroSchema, 403: erroSchema },
      },
    },
    async (request, reply) => {
      const autor = await exigirEscrita(scope, request, reply)
      if (!autor) return

      const arquivo = await scope.services.painel.criarArquivo(request.body)
      await scope.services.painel.registrarAtividade({
        autorId: autor.id,
        autorNome: autor.nome,
        acao: 'arquivo_adicionado',
        alvo: arquivo.nome,
      })

      return reply.status(201).send(arquivo)
    },
  )

  scope.delete(
    '/arquivos/:id',
    {
      schema: {
        tags: ['Clientes'],
        summary: 'Remove um link de material',
        params: paramsId,
        response: {
          200: okSchema,
          401: erroSchema,
          403: erroSchema,
          404: erroSchema,
        },
      },
    },
    async (request, reply) => {
      if (!(await exigirEscrita(scope, request, reply))) return
      const ok = await scope.services.painel.excluirArquivo(request.params.id)
      if (!ok)
        return reply.status(404).send({ error: 'Arquivo não encontrado' })
      return reply.status(200).send({ ok })
    },
  )

  // ─── Acessos ──────────────────────────────────────────────

  scope.post(
    '/acessos',
    {
      schema: {
        tags: ['Clientes'],
        summary: 'Guarda um acesso de plataforma do cliente',
        body: acessoInputSchema,
        response: { 201: acessoSchema, 401: erroSchema, 403: erroSchema },
      },
    },
    async (request, reply) => {
      if (!(await exigirEscrita(scope, request, reply))) return
      return reply
        .status(201)
        .send(await scope.services.painel.criarAcesso(request.body))
    },
  )

  scope.delete(
    '/acessos/:id',
    {
      schema: {
        tags: ['Clientes'],
        summary: 'Remove um acesso',
        params: paramsId,
        response: {
          200: okSchema,
          401: erroSchema,
          403: erroSchema,
          404: erroSchema,
        },
      },
    },
    async (request, reply) => {
      if (!(await exigirEscrita(scope, request, reply))) return
      const ok = await scope.services.painel.excluirAcesso(request.params.id)
      if (!ok) return reply.status(404).send({ error: 'Acesso não encontrado' })
      return reply.status(200).send({ ok })
    },
  )

  // ─── Notas do cliente ─────────────────────────────────────

  scope.post(
    '/notas',
    {
      schema: {
        tags: ['Clientes'],
        summary: 'Escreve uma nota na ficha do cliente',
        body: notaInputSchema,
        response: { 201: notaSchema, 401: erroSchema, 403: erroSchema },
      },
    },
    async (request, reply) => {
      const autor = await exigirEscrita(scope, request, reply)
      if (!autor) return

      /* A assinatura vem da sessão, nunca do corpo: quem escreveu é quem
         está logado. */
      const nota = await scope.services.painel.criarNota(
        request.body.clienteId,
        request.body.texto,
        autor,
      )
      await scope.services.painel.registrarAtividade({
        autorId: autor.id,
        autorNome: autor.nome,
        acao: 'nota_escrita',
        alvo: await scope.services.painel.nomeDoCliente(request.body.clienteId),
      })

      return reply.status(201).send(nota)
    },
  )

  scope.delete(
    '/notas/:id',
    {
      schema: {
        tags: ['Clientes'],
        summary: 'Apaga uma nota',
        params: paramsId,
        response: {
          200: okSchema,
          401: erroSchema,
          403: erroSchema,
          404: erroSchema,
        },
      },
    },
    async (request, reply) => {
      if (!(await exigirEscrita(scope, request, reply))) return
      const ok = await scope.services.painel.excluirNota(request.params.id)
      if (!ok) return reply.status(404).send({ error: 'Nota não encontrada' })
      return reply.status(200).send({ ok })
    },
  )

  // ─── Checklist ────────────────────────────────────────────

  scope.patch(
    '/checklist/:id',
    {
      schema: {
        tags: ['Checklist'],
        summary: 'Marca o item como recebido ou guarda o link do material',
        params: paramsId,
        body: itemChecklistPatchSchema,
        response: {
          200: itemChecklistSchema,
          401: erroSchema,
          403: erroSchema,
          404: erroSchema,
        },
      },
    },
    async (request, reply) => {
      if (!(await exigirEscrita(scope, request, reply))) return
      const item = await scope.services.painel.atualizarItemChecklist(
        request.params.id,
        request.body,
      )
      if (!item) return reply.status(404).send({ error: 'Item não encontrado' })
      return reply.status(200).send(item)
    },
  )

  // ─── Mural ────────────────────────────────────────────────

  scope.post(
    '/anotacoes',
    {
      schema: {
        tags: ['Mural'],
        summary: 'Cola um post-it, emoji ou comentário no quadro',
        body: anotacaoInputSchema,
        response: { 201: anotacaoSchema, 401: erroSchema, 403: erroSchema },
      },
    },
    async (request, reply) => {
      const autor = await exigirEscrita(scope, request, reply)
      if (!autor) return
      return reply
        .status(201)
        .send(await scope.services.painel.criarAnotacao(request.body, autor))
    },
  )

  scope.patch(
    '/anotacoes/:id',
    {
      schema: {
        tags: ['Mural'],
        summary: 'Move a anotação ou muda o texto e a cor',
        params: paramsId,
        body: anotacaoPatchSchema,
        response: {
          200: anotacaoSchema,
          401: erroSchema,
          403: erroSchema,
          404: erroSchema,
        },
      },
    },
    async (request, reply) => {
      if (!(await exigirEscrita(scope, request, reply))) return
      const anotacao = await scope.services.painel.atualizarAnotacao(
        request.params.id,
        request.body,
      )
      if (!anotacao)
        return reply.status(404).send({ error: 'Anotação não encontrada' })
      return reply.status(200).send(anotacao)
    },
  )

  scope.delete(
    '/anotacoes/:id',
    {
      schema: {
        tags: ['Mural'],
        summary: 'Tira a anotação do quadro',
        params: paramsId,
        response: {
          200: okSchema,
          401: erroSchema,
          403: erroSchema,
          404: erroSchema,
        },
      },
    },
    async (request, reply) => {
      if (!(await exigirEscrita(scope, request, reply))) return
      const ok = await scope.services.painel.excluirAnotacao(request.params.id)
      if (!ok)
        return reply.status(404).send({ error: 'Anotação não encontrada' })
      return reply.status(200).send({ ok })
    },
  )

  // ─── Atividades ───────────────────────────────────────────

  scope.get(
    '/atividades',
    {
      schema: {
        tags: ['Painel'],
        summary:
          'O que aconteceu no painel, do mais recente para o mais antigo',
        response: { 200: atividadesSchema, 401: erroSchema, 403: erroSchema },
      },
    },
    async (request, reply) => {
      if (!(await exigirSessao(scope, request, reply))) return
      const atividades = await scope.services.painel.listarAtividades()
      return reply.status(200).send({ atividades })
    },
  )

  // ─── Invoices ─────────────────────────────────────────────

  scope.get(
    '/invoices',
    {
      schema: {
        tags: ['Invoices'],
        summary: 'Invoices emitidos, do mais recente para o mais antigo',
        response: { 200: invoicesSchema, 401: erroSchema, 403: erroSchema },
      },
    },
    async (request, reply) => {
      if (!(await exigirSessao(scope, request, reply))) return
      const invoices = await scope.services.painel.listarInvoices()
      return reply.status(200).send({ invoices })
    },
  )

  scope.post(
    '/invoices',
    {
      schema: {
        tags: ['Invoices'],
        summary: 'Emite um invoice',
        body: invoiceInputSchema,
        response: { 201: invoiceSchema, 401: erroSchema, 403: erroSchema },
      },
    },
    async (request, reply) => {
      const autor = await exigirEscrita(scope, request, reply)
      if (!autor) return

      const invoice = await scope.services.painel.criarInvoice(request.body)
      await scope.services.painel.registrarAtividade({
        autorId: autor.id,
        autorNome: autor.nome,
        acao: 'invoice_criado',
        alvo: invoice.nome || `Nº ${invoice.numero}`,
      })
      return reply.status(201).send(invoice)
    },
  )

  scope.put(
    '/invoices/:id',
    {
      schema: {
        tags: ['Invoices'],
        summary: 'Reescreve um invoice já emitido',
        params: paramsId,
        body: invoiceInputSchema,
        response: {
          200: invoiceSchema,
          401: erroSchema,
          403: erroSchema,
          404: erroSchema,
        },
      },
    },
    async (request, reply) => {
      if (!(await exigirEscrita(scope, request, reply))) return
      const invoice = await scope.services.painel.atualizarInvoice(
        request.params.id,
        request.body,
      )
      if (!invoice)
        return reply.status(404).send({ error: 'Invoice não encontrado' })
      return reply.status(200).send(invoice)
    },
  )

  scope.delete(
    '/invoices/:id',
    {
      schema: {
        tags: ['Invoices'],
        summary: 'Exclui um invoice',
        params: paramsId,
        response: {
          200: okSchema,
          401: erroSchema,
          403: erroSchema,
          404: erroSchema,
        },
      },
    },
    async (request, reply) => {
      if (!(await exigirEscrita(scope, request, reply))) return
      const ok = await scope.services.painel.excluirInvoice(request.params.id)
      if (!ok)
        return reply.status(404).send({ error: 'Invoice não encontrado' })
      return reply.status(200).send({ ok })
    },
  )

  // ─── Acessos da equipe ────────────────────────────────────

  scope.get(
    '/acessos-equipe',
    {
      schema: {
        tags: ['Equipe'],
        summary: 'Entradas no painel, uma por login',
        response: {
          200: acessosEquipeSchema,
          401: erroSchema,
          403: erroSchema,
        },
      },
    },
    async (request, reply) => {
      /* Só administrador vê: a lista mostra IP e navegador de todo mundo. */
      if (!(await exigirGestaoDeEquipe(scope, request, reply))) return

      const acessos = await scope.services.painel.listarAcessos()
      return reply.status(200).send({ acessos })
    },
  )

  // ─── Equipe ───────────────────────────────────────────────

  scope.post(
    '/administradores',
    {
      schema: {
        tags: ['Equipe'],
        summary: 'Cadastra uma pessoa na equipe e cria o acesso dela',
        body: administradorInputSchema,
        response: {
          201: administradorSchema,
          400: erroSchema,
          401: erroSchema,
          403: erroSchema,
        },
      },
    },
    async (request, reply) => {
      const autor = await exigirGestaoDeEquipe(scope, request, reply)
      if (!autor) return

      const { senha, ...ficha } = request.body

      /* Não há cadastro público: a conta do Better Auth nasce aqui, junto com
         a ficha. Cadastrar alguém na equipe É criar o acesso dessa pessoa —
         se a conta não sai, o cadastro inteiro não acontece. */
      const criado = await scope.services.auth.auth.api
        .signUpEmail({
          body: { email: ficha.email, password: senha, name: ficha.nome },
        })
        .catch(() => null)

      if (!criado?.user) {
        return reply.status(400).send({
          error:
            'Não foi possível criar o acesso — esse e-mail já está em uso?',
        })
      }

      await scope.services.painel.descartarSessoesDe(criado.user.id)

      const administrador = await scope.services.painel.criarAdministrador(
        ficha,
        criado.user.id,
      )
      await scope.services.painel.registrarAtividade({
        autorId: autor.id,
        autorNome: autor.nome,
        acao: 'pessoa_adicionada',
        alvo: administrador.nome,
      })
      return reply.status(201).send(administrador)
    },
  )

  scope.patch(
    '/administradores/:id',
    {
      schema: {
        tags: ['Equipe'],
        summary: 'Edita a ficha de alguém da equipe',
        params: paramsId,
        body: administradorPatchSchema,
        response: {
          200: administradorSchema,
          400: erroSchema,
          401: erroSchema,
          403: erroSchema,
          404: erroSchema,
        },
      },
    },
    async (request, reply) => {
      const autor = await exigirGestaoDeEquipe(scope, request, reply)
      if (!autor) return

      const { senha, ...ficha } = request.body
      const atual = await scope.services.painel.buscarAdministrador(
        request.params.id,
      )
      if (!atual)
        return reply.status(404).send({ error: 'Pessoa não encontrada' })

      /* Só quem foi cadastrado antes de a conta ser obrigatória chega aqui sem
         acesso; a senha informada na edição é o que cria a conta que faltava. */
      if (senha && !atual.userId) {
        const email = ficha.email ?? atual.email
        if (!email) {
          return reply
            .status(400)
            .send({ error: 'Informe o e-mail para criar o acesso' })
        }

        const criado = await scope.services.auth.auth.api
          .signUpEmail({
            body: { email, password: senha, name: ficha.nome ?? atual.nome },
          })
          .catch(() => null)

        if (!criado?.user) {
          return reply.status(400).send({
            error:
              'Não foi possível criar o acesso — esse e-mail já está em uso?',
          })
        }

        await scope.services.painel.descartarSessoesDe(criado.user.id)
        await scope.services.painel.vincularConta(atual.id, criado.user.id)
      }

      const administrador = await scope.services.painel.atualizarAdministrador(
        request.params.id,
        ficha,
      )
      if (!administrador)
        return reply.status(404).send({ error: 'Pessoa não encontrada' })
      return reply.status(200).send(administrador)
    },
  )

  scope.delete(
    '/administradores/:id',
    {
      schema: {
        tags: ['Equipe'],
        summary: 'Remove alguém da equipe',
        params: paramsId,
        response: {
          200: okSchema,
          401: erroSchema,
          403: erroSchema,
          404: erroSchema,
        },
      },
    },
    async (request, reply) => {
      if (!(await exigirGestaoDeEquipe(scope, request, reply))) return
      const ok = await scope.services.painel.excluirAdministrador(
        request.params.id,
      )
      if (!ok) return reply.status(404).send({ error: 'Pessoa não encontrada' })
      return reply.status(200).send({ ok })
    },
  )
})
