import { cn } from '@repo/ui'
import {
  type Administrador,
  AVATAR_LABEL,
  type AvatarId,
  avatarDoResponsavel,
} from './dados'

/* Bichinhos de pixel.
 *
 * Cada avatar é um polígono desenhado numa grade de 16x16 com
 * `shapeRendering="crispEdges"`: sem antialiasing, a borda sai em degrau, que
 * é o que dá o aspecto de pixel art. O bicho é preto sobre o quadrado
 * colorido, e os olhos são dois (ou três) retângulos brancos. */

interface Desenho {
  fundo: string
  corpo: string
  olhos: { x: number; y: number; l: number; a: number }[]
}

const OLHOS_PADRAO = [
  { x: 5, y: 7, l: 2, a: 3 },
  { x: 9, y: 7, l: 2, a: 3 },
]

const DESENHOS: Record<AvatarId, Desenho> = {
  estrela: {
    fundo: '#E8453C',
    corpo: '8,0 10,4 12,6 16,8 12,10 10,12 8,16 6,12 4,10 0,8 4,6 6,4',
    olhos: OLHOS_PADRAO,
  },
  espinho: {
    fundo: '#F5D53F',
    corpo: '16,8 12,5 12,1 8,3 4,1 4,5 0,8 4,11 4,15 8,13 12,15 12,11',
    olhos: OLHOS_PADRAO,
  },
  losango: {
    fundo: '#3DC963',
    corpo:
      '8,0 11,3 11,5 13,5 16,8 13,11 11,11 11,13 8,16 5,13 5,11 3,11 0,8 3,5 5,5 5,3',
    olhos: OLHOS_PADRAO,
  },
  capsula: {
    fundo: '#3B82F6',
    corpo: '4,4 12,4 12,5 14,5 14,11 12,11 12,12 4,12 4,11 2,11 2,5 4,5',
    olhos: [
      { x: 4, y: 7, l: 2, a: 2 },
      { x: 7, y: 7, l: 2, a: 2 },
      { x: 10, y: 7, l: 2, a: 2 },
    ],
  },
  gota: {
    fundo: '#B07BF0',
    corpo: '1,3 15,3 15,5 12,10 9,14 8,16 7,14 4,10 1,5',
    olhos: [
      { x: 5, y: 6, l: 2, a: 3 },
      { x: 9, y: 6, l: 2, a: 3 },
    ],
  },
  coracao: {
    fundo: '#EE6FA0',
    corpo: '1,4 4,1 8,4 12,1 15,4 15,7 8,15 1,7',
    olhos: [
      { x: 4, y: 6, l: 2, a: 3 },
      { x: 10, y: 6, l: 2, a: 3 },
    ],
  },
  bolha: {
    fundo: '#22B8C4',
    corpo: '5,1 11,1 15,5 15,11 11,15 5,15 1,11 1,5',
    olhos: OLHOS_PADRAO,
  },
}

interface AvatarProps {
  avatar: AvatarId
  /* Tamanho vem por classe (`size-8`, `size-10`...) para acompanhar o lugar
     onde o avatar é usado. */
  className?: string
  /* Quando o avatar aparece sozinho, sem o nome ao lado, ele precisa de um
     rótulo — normalmente o nome da pessoa. */
  rotulo?: string
}

export function Avatar({ avatar, className, rotulo }: AvatarProps) {
  const desenho = DESENHOS[avatar]

  return (
    <svg
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      role="img"
      aria-label={rotulo ?? AVATAR_LABEL[avatar]}
      className={cn('size-8 shrink-0 rounded-[26%]', className)}
    >
      <rect width="16" height="16" fill={desenho.fundo} />
      <polygon points={desenho.corpo} fill="#131316" />
      {desenho.olhos.map((olho) => (
        <rect
          key={`${olho.x}-${olho.y}`}
          x={olho.x}
          y={olho.y}
          width={olho.l}
          height={olho.a}
          fill="#FFFFFF"
        />
      ))}
    </svg>
  )
}

/* Nome de alguém da equipe com o avatar do lado — pequeno, só para bater o
   olho e saber de quem é. Sem avatar quando o nome não é de ninguém
   cadastrado. */
export function NomeComAvatar({
  administradores,
  nome,
  className,
}: {
  administradores: Administrador[]
  nome: string
  className?: string
}) {
  const avatar = avatarDoResponsavel(administradores, nome)

  return (
    <span className={cn('flex min-w-0 items-center gap-2', className)}>
      {avatar && (
        <Avatar
          avatar={avatar}
          rotulo={nome}
          className="size-4 rounded-[4px]"
        />
      )}
      <span className="truncate">{nome}</span>
    </span>
  )
}
