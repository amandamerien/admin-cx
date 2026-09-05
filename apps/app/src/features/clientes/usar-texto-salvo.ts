import { useEffect, useRef, useState } from 'react'

/* Quanto tempo de teclado parado antes de mandar para o servidor. */
const ESPERA_MS = 500

/* Texto que se digita agora e se salva depois.
 *
 * O mural guarda tudo no servidor, e cada gravação recarrega o painel inteiro.
 * Ligar o campo direto nesse valor fazia a digitação sumir: a letra só voltava
 * depois da ida e volta, então o campo apagava e reordenava o que tinha acabado
 * de ser escrito. Aqui quem manda no campo é o estado local; o servidor recebe
 * o texto quando a pessoa dá uma pausa, sai do campo ou fecha a tela.
 */
export function useTextoSalvo(
  textoRemoto: string,
  onSalvar: (texto: string) => void,
) {
  const [texto, setTexto] = useState(textoRemoto)

  const pendente = useRef<number | null>(null)
  const textoRef = useRef(textoRemoto)
  /* Último valor que sabemos estar no servidor — serve para distinguir a
     edição de outra pessoa do eco do que nós mesmos mandamos. */
  const remotoConhecido = useRef(textoRemoto)
  /* A função de salvar troca a cada render; o timer precisa da mais recente
     sem ser reagendado por isso. */
  const salvarRef = useRef(onSalvar)
  salvarRef.current = onSalvar

  function gravar(valor: string) {
    pendente.current = null
    remotoConhecido.current = valor
    salvarRef.current(valor)
  }

  useEffect(() => {
    if (textoRemoto === remotoConhecido.current) return
    remotoConhecido.current = textoRemoto

    /* Com edição em voo, o que veio do servidor está atrasado: deixar entrar
       apagaria a frase pela metade. */
    if (pendente.current !== null) return

    textoRef.current = textoRemoto
    setTexto(textoRemoto)
  }, [textoRemoto])

  /* Trocar de seção no meio da frase não pode perder o que foi escrito. Só a
     saída importa aqui — daí a lista de dependências vazia. */
  // biome-ignore lint/correctness/useExhaustiveDependencies: roda só na saída
  useEffect(() => {
    return () => {
      if (pendente.current === null) return
      window.clearTimeout(pendente.current)
      gravar(textoRef.current)
    }
  }, [])

  function mudar(valor: string) {
    textoRef.current = valor
    setTexto(valor)

    if (pendente.current !== null) window.clearTimeout(pendente.current)
    pendente.current = window.setTimeout(() => gravar(valor), ESPERA_MS)
  }

  /* Sair do campo não espera a pausa: salva na hora. */
  function salvarAgora() {
    if (pendente.current === null) return
    window.clearTimeout(pendente.current)
    gravar(textoRef.current)
  }

  return { texto, mudar, salvarAgora }
}
