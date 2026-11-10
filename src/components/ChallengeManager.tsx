import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Challenge } from '../types'
import styles from './ChallengeManager.module.css'

export default function ChallengeManager() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [newText, setNewText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadChallenges()
  }, [])

  async function loadChallenges() {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: true })
    if (!error && data) setChallenges(data)
  }

  async function addChallenge() {
    const text = newText.trim()
    if (!text) return
    setLoading(true)
    const { error } = await supabase.from('challenges').insert({ text })
    if (!error) {
      setNewText('')
      await loadChallenges()
    }
    setLoading(false)
  }

  function startEdit(challenge: Challenge) {
    setEditingId(challenge.id)
    setEditText(challenge.text)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditText('')
  }

  async function saveEdit(id: string) {
    const text = editText.trim()
    if (!text) return
    setLoading(true)
    const { error } = await supabase.from('challenges').update({ text }).eq('id', id)
    if (!error) {
      setEditingId(null)
      setEditText('')
      await loadChallenges()
    }
    setLoading(false)
  }

  async function deleteChallenge(id: string) {
    if (!confirm('Видалити цей челендж?')) return
    setLoading(true)
    const { error } = await supabase.from('challenges').delete().eq('id', id)
    if (!error) await loadChallenges()
    setLoading(false)
  }

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Челенджі</h2>
      <p className={styles.count}>Всього: {challenges.length}</p>

      <div className={styles.addRow}>
        <input
          className={styles.input}
          type="text"
          placeholder="Новий челендж..."
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addChallenge()}
          disabled={loading}
        />
        <button className={styles.btnPrimary} onClick={addChallenge} disabled={loading || !newText.trim()}>
          Додати
        </button>
      </div>

      <ul className={styles.list}>
        {challenges.map(ch => (
          <li key={ch.id} className={styles.item}>
            {editingId === ch.id ? (
              <div className={styles.editRow}>
                <input
                  className={styles.input}
                  type="text"
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveEdit(ch.id)
                    if (e.key === 'Escape') cancelEdit()
                  }}
                  autoFocus
                  disabled={loading}
                />
                <button className={styles.btnPrimary} onClick={() => saveEdit(ch.id)} disabled={loading}>
                  Зберегти
                </button>
                <button className={styles.btnSecondary} onClick={cancelEdit} disabled={loading}>
                  Скасувати
                </button>
              </div>
            ) : (
              <div className={styles.viewRow}>
                <span className={styles.text}>{ch.text}</span>
                <button className={styles.btnIcon} onClick={() => startEdit(ch)} title="Редагувати" disabled={loading}>
                  ✏️
                </button>
                <button className={styles.btnIcon} onClick={() => deleteChallenge(ch.id)} title="Видалити" disabled={loading}>
                  🗑️
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
