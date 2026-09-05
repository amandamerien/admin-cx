/* Dados da empresa que emite a nota. Ficam aqui, e não num campo do
 * formulário, porque não mudam de um invoice para o outro. */
export const EMISSOR = {
  razaoSocial: 'INFO TECH TECNOLOGIA LTDA.',
  cnpj: '47.396.414/0001-45',
  endereco:
    'Av. Yojiro Takaoka, n. 4384, Sala 701, Alphaville, Santana de Parnaíba/SP, CEP: 06541-038',
} as const

export interface ItemInvoice {
  id: string
  fornecedor: string
  quantidade: string
  /* Texto, não número: guarda o que a pessoa digitou ("1.250,50" ou
     "1250.50") sem reformatar embaixo do dedo dela. */
  valor: string
}

export interface DadosInvoice {
  numero: string
  data: string
  nome: string
  cpf: string
  email: string
  telefone: string
  endereco: string
  itens: ItemInvoice[]
}

/* Gera um id local para as linhas novas do formulário. O id que vale é o do
 * banco, que chega depois de salvar. */
export function novoItem(): ItemInvoice {
  return {
    id: `item-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    fornecedor: '',
    quantidade: '1',
    valor: '',
  }
}

export function invoiceEmBranco(): DadosInvoice {
  return {
    numero: '',
    data: hojeParaCampo(),
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    endereco: '',
    itens: [novoItem()],
  }
}

/* Aceita "1.234,56" e "1234.56": a pessoa digita do jeito que está acostumada
 * e o total soma do mesmo jeito. Texto que não vira número conta como zero. */
export function paraNumero(valor: string) {
  const limpo = valor.replace(/[^\d,.-]/g, '')
  const normalizado = limpo.includes(',')
    ? limpo.replace(/\./g, '').replace(',', '.')
    : limpo

  const numero = Number.parseFloat(normalizado)
  return Number.isFinite(numero) ? numero : 0
}

export function emReais(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function totalDoInvoice(itens: ItemInvoice[]) {
  return itens.reduce((soma, item) => soma + paraNumero(item.valor), 0)
}

/* 5 de setembro de 2026 — por extenso, como em documento. */
export function dataPorExtenso(iso: string) {
  if (!iso) return '—'
  const data = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(data.getTime())) return '—'

  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

/* AAAA-MM-DD de hoje, para o campo de data já nascer preenchido. */
export function hojeParaCampo() {
  const agora = new Date()
  const mes = `${agora.getMonth() + 1}`.padStart(2, '0')
  const dia = `${agora.getDate()}`.padStart(2, '0')
  return `${agora.getFullYear()}-${mes}-${dia}`
}
