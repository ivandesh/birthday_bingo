import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { findCompletedLines, type CellGrid } from '../utils/bingoDetection'
import BingoGrid from '../components/BingoGrid'
import PrizeWheel from '../components/PrizeWheel'
import CongratsScreen from '../components/CongratsScreen'
import type { Player, CardCell, ClaimedLine } from '../types'
import styles from './PlayPage.module.css'

export default function PlayPage() {
  const navigate = useNavigate()

  const [player, setPlayer] = useState<Player | null>(null)
  const [cells, setCells] = useState<CardCell[]>([])
  const [claimedLines, setClaimedLines] = useState<ClaimedLine[]>([])
  const [gridSize, setGridSize] = useState(5)
  const [loading, setLoading] = useState(true)
  const [showWheel, setShowWheel] = useState(false)
  const [showCongrats, setShowCongrats] = useState(false)
  const [availablePrizes, setAvailablePrizes] = useState<string[]>([])
  const [winningIndex, setWinningIndex] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem('playerToken')
    if (!token) {
      navigate('/')
      return
    }

    async function loadData() {
      try {
        const { data: configData } = await supabase
          .from('config')
          .select('grid_size')
          .single()
        if (configData) setGridSize(configData.grid_size)

        const { data: playerData } = await supabase
          .from('players')
          .select('*')
          .eq('card_token', token)
          .single()
        if (!playerData) {
          navigate('/')
          return
        }
        setPlayer(playerData)

        const { data: cardsData } = await supabase
          .from('cards')
          .select('*, challenges(text)')
          .eq('player_id', playerData.id)

        if (cardsData) {
          const mappedCells: CardCell[] = cardsData.map((c: any) => ({
            ...c,
            challenge_text: (c.challenges as any).text,
          }))
          setCells(mappedCells)
        }

        const { data: claimedData } = await supabase
          .from('claimed_lines')
          .select('*')
          .eq('player_id', playerData.id)
        if (claimedData) setClaimedLines(claimedData)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [navigate])

  const checkForBingo = useCallback(
    async (updatedCells: CardCell[], currentClaimedLines: ClaimedLine[], currentPlayer: Player) => {
      const grid: CellGrid = Array.from({ length: gridSize }, (_, row) =>
        Array.from({ length: gridSize }, (_, col) => {
          const cell = updatedCells.find(c => c.row === row && c.col === col)
          return cell ? cell.completed : false
        })
      )

      const completedLines = findCompletedLines(grid)

      const newLines = completedLines.filter(
        line =>
          !currentClaimedLines.some(
            cl => cl.line_type === line.type && cl.line_index === line.index
          )
      )

      if (newLines.length === 0) return

      const isFirst = currentClaimedLines.length === 0

      let prizeId: string | null = null

      if (isFirst) {
        const { data: allAvailable } = await supabase
          .from('prizes')
          .select('*')
          .is('won_by', null)

        if (allAvailable && allAvailable.length > 0) {
          const randomIdx = Math.floor(Math.random() * allAvailable.length)
          const prize = allAvailable[randomIdx]

          await supabase
            .from('prizes')
            .update({ won_by: currentPlayer.id })
            .eq('id', prize.id)
            .is('won_by', null)

          prizeId = prize.id

          setAvailablePrizes(allAvailable.map((p: any) => p.name))
          setWinningIndex(randomIdx)
        }
      }

      const insertRows = newLines.map((line, i) => ({
        player_id: currentPlayer.id,
        line_type: line.type,
        line_index: line.index,
        is_first: isFirst && i === 0,
        prize_id: isFirst && i === 0 ? prizeId : null,
      }))

      const { data: insertedLines } = await supabase
        .from('claimed_lines')
        .insert(insertRows)
        .select()

      if (insertedLines) {
        setClaimedLines(prev => [...prev, ...insertedLines])
      }

      if (isFirst) {
        setShowWheel(true)
      } else {
        setShowCongrats(true)
      }
    },
    [gridSize]
  )

  async function handleMarkComplete(cellId: string) {
    await supabase
      .from('cards')
      .update({ completed: true })
      .eq('id', cellId)

    const updatedCells = cells.map(c =>
      c.id === cellId ? { ...c, completed: true } : c
    )
    setCells(updatedCells)

    if (player) {
      await checkForBingo(updatedCells, claimedLines, player)
    }
  }

  if (loading) {
    return <div className={styles.page}>Завантаження...</div>
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{player?.name}</h1>
      <BingoGrid
        cells={cells}
        gridSize={gridSize}
        onMarkComplete={handleMarkComplete}
      />

      {showWheel && availablePrizes.length > 0 && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2>🎉 БІНГО!</h2>
            <PrizeWheel
              prizes={availablePrizes}
              winningIndex={winningIndex}
              onFinished={() => setShowWheel(false)}
            />
          </div>
        </div>
      )}

      {showCongrats && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <CongratsScreen onClose={() => setShowCongrats(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
