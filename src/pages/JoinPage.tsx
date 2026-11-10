import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import type { Player } from '../types'
import styles from './JoinPage.module.css'

export default function JoinPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get('card')

  const [player, setPlayer] = useState<Player | null>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(!!token)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) return
    lookupPlayer(token)
  }, [token])

  async function lookupPlayer(cardToken: string) {
    setLoading(true)
    setError('')

    const { data, error: dbError } = await supabase
      .from('players')
      .select('*')
      .eq('card_token', cardToken)
      .single()

    if (dbError || !data) {
      setError('Картку не знайдено. Перевірте QR-код.')
      setLoading(false)
      return
    }

    const foundPlayer = data as Player

    if (foundPlayer.name) {
      localStorage.setItem('playerToken', cardToken)
      navigate('/play')
      return
    }

    setPlayer(foundPlayer)
    setLoading(false)
  }

  async function handleJoin() {
    if (!name.trim() || !player || !token) return

    setSubmitting(true)
    setError('')

    const { error: updateError } = await supabase
      .from('players')
      .update({ name: name.trim() })
      .eq('id', player.id)

    if (updateError) {
      setError('Помилка при збереженні. Спробуйте ще раз.')
      setSubmitting(false)
      return
    }

    localStorage.setItem('playerToken', token)
    navigate('/play')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleJoin()
    }
  }

  if (!token) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>🎂 Birthday Bingo!</h1>
        <p className={styles.error}>Невірне посилання. Відскануйте QR-код на вашій картці.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>🎂 Birthday Bingo!</h1>
        <p>Завантаження...</p>
      </div>
    )
  }

  if (error && !player) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>🎂 Birthday Bingo!</h1>
        <p className={styles.error}>{error}</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🎂 Birthday Bingo!</h1>
      <p className={styles.subtitle}>Введіть ваше ім'я щоб приєднатися</p>
      <div className={styles.form}>
        <input
          className={styles.input}
          type="text"
          placeholder="Ваше ім'я..."
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        {error && <p className={styles.error}>{error}</p>}
        <button
          className={styles.button}
          onClick={handleJoin}
          disabled={!name.trim() || submitting}
        >
          Приєднатися
        </button>
      </div>
    </div>
  )
}
