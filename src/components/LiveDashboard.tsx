import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import type { Player, Prize, ClaimedLine } from '../types'
import styles from './LiveDashboard.module.css'

interface PlayerProgress {
  player: Player
  completedCells: number
  totalCells: number
  bingos: number
}

export default function LiveDashboard() {
  const [players, setPlayers] = useState<PlayerProgress[]>([])
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [gridSize, setGridSize] = useState(4)

  useEffect(() => {
    loadData()

    const prizeSub = supabase
      .channel('prizes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prizes' }, () => {
        loadPrizes()
      })
      .subscribe()

    return () => { supabase.removeChannel(prizeSub) }
  }, [])

  async function loadData() {
    const { data: config } = await supabase.from('config').select('*').single()
    if (config) setGridSize(config.grid_size)

    const { data: playersData } = await supabase
      .from('players')
      .select('*')
      .not('name', 'is', null)
      .order('created_at')

    const { data: cardsData } = await supabase.from('cards').select('*')
    const { data: claimedData } = await supabase.from('claimed_lines').select('*')

    if (playersData && cardsData) {
      const progress: PlayerProgress[] = playersData.map(player => {
        const playerCards = cardsData.filter(c => c.player_id === player.id)
        const completed = playerCards.filter(c => c.completed).length
        const bingos = claimedData?.filter(cl => cl.player_id === player.id).length || 0
        return {
          player,
          completedCells: completed,
          totalCells: playerCards.length,
          bingos,
        }
      })
      setPlayers(progress)
    }

    loadPrizes()
  }

  async function loadPrizes() {
    const { data } = await supabase.from('prizes').select('*, players(name)').order('created_at')
    if (data) setPrizes(data)
  }

  const availablePrizes = prizes.filter(p => !p.won_by)
  const wonPrizes = prizes.filter(p => p.won_by)

  return (
    <div className={styles.container}>
      <h2>Гравці</h2>
      {players.length === 0 ? (
        <p className={styles.empty}>Ще ніхто не приєднався</p>
      ) : (
        <ul className={styles.playerList}>
          {players.map(({ player, completedCells, totalCells, bingos }) => (
            <li key={player.id} className={styles.playerItem}>
              <div className={styles.playerName}>{player.name}</div>
              <div className={styles.playerStats}>
                <span>{completedCells}/{totalCells} клітинок</span>
                {bingos > 0 && <span className={styles.bingoCount}>🎯 {bingos} бінго</span>}
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${(completedCells / totalCells) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2>Призи</h2>
      <p className={styles.prizeStats}>
        Доступні: {availablePrizes.length} | Виграні: {wonPrizes.length}
      </p>
      {wonPrizes.length > 0 && (
        <ul className={styles.wonList}>
          {wonPrizes.map(prize => (
            <li key={prize.id}>
              <strong>{prize.name}</strong> — {(prize as any).players?.name || 'Невідомо'}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
