import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Player, CardCell } from '../types'
import PrintableCard from '../components/PrintableCard'
import styles from './PrintPage.module.css'

export default function PrintPage() {
  const [gridSize, setGridSize] = useState(5)
  const [players, setPlayers] = useState<Player[]>([])
  const [cardsByPlayer, setCardsByPlayer] = useState<Record<string, CardCell[]>>({})
  const [loading, setLoading] = useState(true)

  const baseUrl = window.location.origin + '/birthday-bingo/'

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    const [configRes, playersRes, cardsRes] = await Promise.all([
      supabase.from('config').select('*').limit(1).single(),
      supabase.from('players').select('*').order('created_at', { ascending: true }),
      supabase.from('cards').select('*, challenges(text)'),
    ])

    if (!configRes.error && configRes.data) setGridSize(configRes.data.grid_size)
    if (!playersRes.error && playersRes.data) setPlayers(playersRes.data)

    if (!cardsRes.error && cardsRes.data) {
      const grouped: Record<string, CardCell[]> = {}
      for (const card of cardsRes.data as any[]) {
        const cell: CardCell = {
          id: card.id,
          player_id: card.player_id,
          challenge_id: card.challenge_id,
          row: card.row,
          col: card.col,
          completed: card.completed,
          challenge_text: (card.challenges as any)?.text ?? '',
        }
        if (!grouped[card.player_id]) grouped[card.player_id] = []
        grouped[card.player_id].push(cell)
      }
      setCardsByPlayer(grouped)
    }

    setLoading(false)
  }

  if (loading) {
    return <div className={styles.loading}>Завантаження…</div>
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Друк карток</h1>
        <button className={styles.printBtn} onClick={() => window.print()}>
          Друкувати
        </button>
      </div>
      <div className={styles.cards}>
        {players.map((player, idx) => (
          <PrintableCard
            key={player.id}
            cardNumber={idx + 1}
            token={player.card_token}
            cells={cardsByPlayer[player.id] ?? []}
            gridSize={gridSize}
            baseUrl={baseUrl}
          />
        ))}
      </div>
    </div>
  )
}
