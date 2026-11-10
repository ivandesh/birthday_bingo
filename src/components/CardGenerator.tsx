import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Challenge, Player } from '../types'
import { generateToken } from '../utils/generateToken'
import { generateCardAssignments } from '../utils/shuffleCards'
import styles from './CardGenerator.module.css'

interface Props {
  gridSize: number
}

export default function CardGenerator({ gridSize }: Props) {
  const navigate = useNavigate()
  const [count, setCount] = useState(10)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [challengesRes, playersRes] = await Promise.all([
      supabase.from('challenges').select('*'),
      supabase.from('players').select('*').order('created_at', { ascending: true }),
    ])
    if (!challengesRes.error && challengesRes.data) setChallenges(challengesRes.data)
    if (!playersRes.error && playersRes.data) setPlayers(playersRes.data)
  }

  async function handleGenerate() {
    const totalCells = gridSize * gridSize
    if (challenges.length < totalCells) {
      setError(`Потрібно щонайменше ${totalCells} завдань (зараз: ${challenges.length})`)
      return
    }
    setError(null)
    setGenerating(true)
    try {
      const challengeIds = challenges.map((c) => c.id)
      for (let i = 0; i < count; i++) {
        const token = generateToken(6)
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .insert({ name: `Гравець ${i + 1}`, card_token: token })
          .select()
          .single()
        if (playerError || !playerData) throw playerError ?? new Error('Player insert failed')

        const assignments = generateCardAssignments(challengeIds, gridSize)
        const cardRows = assignments.map((a) => ({
          player_id: playerData.id,
          challenge_id: a.challengeId,
          row: a.row,
          col: a.col,
          completed: false,
        }))
        const { error: cardsError } = await supabase.from('cards').insert(cardRows)
        if (cardsError) throw cardsError
      }
      await loadData()
    } catch (err: any) {
      setError(err?.message ?? 'Помилка генерації')
    } finally {
      setGenerating(false)
    }
  }

  async function handleDeleteAll() {
    const confirmed = window.confirm('Видалити всі картки та гравців? Це незворотно.')
    if (!confirmed) return
    setGenerating(true)
    setError(null)
    try {
      await supabase.from('claimed_lines').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('cards').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('prizes').update({ won_by: null }).neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('players').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      setPlayers([])
    } catch (err: any) {
      setError(err?.message ?? 'Помилка видалення')
    } finally {
      setGenerating(false)
    }
  }

  if (players.length > 0) {
    return (
      <div className={styles.container}>
        <p className={styles.info}>
          Згенеровано <strong>{players.length}</strong> карток
        </p>
        <div className={styles.actions}>
          <button
            className={styles.primaryBtn}
            onClick={() => navigate('/manage-party/print')}
          >
            Друкувати картки
          </button>
          <button
            className={styles.dangerBtn}
            onClick={handleDeleteAll}
            disabled={generating}
          >
            Видалити всі картки
          </button>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <ul className={styles.tokenList}>
          {players.map((p) => (
            <li key={p.id} className={styles.tokenItem}>
              <span className={styles.playerName}>{p.name}</span>
              <code className={styles.token}>{p.card_token}</code>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <p className={styles.info}>
        Доступно завдань: <strong>{challenges.length}</strong>
      </p>
      <div className={styles.formRow}>
        <label className={styles.label} htmlFor="card-count">
          Кількість карток (1–30):
        </label>
        <input
          id="card-count"
          className={styles.input}
          type="number"
          min={1}
          max={30}
          value={count}
          onChange={(e) => setCount(Math.max(1, Math.min(30, Number(e.target.value))))}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <button
        className={styles.primaryBtn}
        onClick={handleGenerate}
        disabled={generating}
      >
        {generating ? 'Генерація…' : 'Згенерувати'}
      </button>
    </div>
  )
}
