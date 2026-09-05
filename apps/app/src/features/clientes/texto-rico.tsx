/* Negrito no texto das anotações.
 *
 * A marcação é `**assim**`, guardada como texto puro no banco — nada de HTML.
 * Isso mantém o campo simples de editar, o dado legível fora da tela e sem
 * risco de injeção na hora de mostrar. */
const MARCA = '**'

/* Quebra o texto em pedaços, marcando quais estão em negrito. */
export function pedacosDoTexto(texto: string) {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((pedaco, indice) => ({
    chave: `${indice}-${pedaco}`,
    negrito: pedaco.startsWith(MARCA) && pedaco.endsWith(MARCA),
    conteudo:
      pedaco.startsWith(MARCA) && pedaco.endsWith(MARCA)
        ? pedaco.slice(2, -2)
        : pedaco,
  }))
}

/* Liga e desliga o negrito no trecho selecionado.
 *
 * Devolve o texto novo e onde a seleção deve ficar depois — sem isso o cursor
 * pularia para o fim a cada clique no B. */
export function alternarNegrito(
  texto: string,
  inicio: number,
  fim: number,
): { texto: string; inicio: number; fim: number } {
  const trecho = texto.slice(inicio, fim)
  if (trecho.trim() === '') return { texto, inicio, fim }

  /* Já em negrito: tira as marcas, seja porque elas estão dentro da seleção,
     seja porque a seleção está entre elas. */
  if (trecho.startsWith(MARCA) && trecho.endsWith(MARCA)) {
    const limpo = trecho.slice(2, -2)
    return {
      texto: texto.slice(0, inicio) + limpo + texto.slice(fim),
      inicio,
      fim: inicio + limpo.length,
    }
  }

  const antes = texto.slice(Math.max(0, inicio - 2), inicio)
  const depois = texto.slice(fim, fim + 2)
  if (antes === MARCA && depois === MARCA) {
    return {
      texto: texto.slice(0, inicio - 2) + trecho + texto.slice(fim + 2),
      inicio: inicio - 2,
      fim: fim - 2,
    }
  }

  return {
    texto: texto.slice(0, inicio) + MARCA + trecho + MARCA + texto.slice(fim),
    inicio: inicio + 2,
    fim: fim + 2,
  }
}

/* Mostra o texto com o negrito aplicado. */
export function TextoComNegrito({ texto }: { texto: string }) {
  return (
    <>
      {pedacosDoTexto(texto).map((pedaco) =>
        pedaco.negrito ? (
          <strong key={pedaco.chave} className="font-semibold">
            {pedaco.conteudo}
          </strong>
        ) : (
          <span key={pedaco.chave}>{pedaco.conteudo}</span>
        ),
      )}
    </>
  )
}
