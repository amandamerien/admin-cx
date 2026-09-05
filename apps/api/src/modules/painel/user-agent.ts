/* Lê navegador e sistema do user-agent.
 *
 * Sem biblioteca de propósito: a lista de navegadores que a equipe usa é
 * curta, e uma dependência para isso traria uma base de centenas de regras que
 * ninguém aqui vai consultar. A ordem importa — Edge e Opera se anunciam como
 * Chrome, e o Chrome se anuncia como Safari. */
const NAVEGADORES: [RegExp, string][] = [
  [/\bEdg[A-Z]?\//, 'Edge'],
  [/\bOPR\/|\bOpera\//, 'Opera'],
  [/\bArc\//, 'Arc'],
  [/\bBrave\//, 'Brave'],
  [/\bFirefox\//, 'Firefox'],
  [/\bChrome\//, 'Chrome'],
  [/\bSafari\//, 'Safari'],
]

const SISTEMAS: [RegExp, string][] = [
  [/\biPhone\b/, 'iPhone'],
  [/\biPad\b/, 'iPad'],
  [/\bAndroid\b/, 'Android'],
  [/\bMac OS X\b|\bMacintosh\b/, 'macOS'],
  [/\bWindows NT\b/, 'Windows'],
  [/\bLinux\b/, 'Linux'],
]

function primeiro(lista: [RegExp, string][], agente: string) {
  return lista.find(([padrao]) => padrao.test(agente))?.[1] ?? null
}

export function lerUserAgent(agente: string | null) {
  if (!agente) return { navegador: null, sistema: null }

  return {
    navegador: primeiro(NAVEGADORES, agente),
    sistema: primeiro(SISTEMAS, agente),
  }
}
