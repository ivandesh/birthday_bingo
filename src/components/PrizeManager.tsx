import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Prize } from '../types'
import styles from './PrizeManager.module.css'

export default function PrizeManager() {
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadPrizes()
  }, [])

  async function loadPrizes() {
    const { data, error } = await supabase
      .from('prizes')
      .select('*')
      .order('created_at', { ascending: true })
    if (!error && data) setPrizes(data)
  }

  async function addPrize() {
    const name = newName.trim()
    if (!name) return
    setLoading(true)
    const { error } = await supabase.from('prizes').insert({ name })
    if (!error) {
      setNewName('')
      await loadPrizes()
    }
    setLoading(false)
  }

  function startEdit(prize: Prize) {
    setEditingId(prize.id)
    setEditName(prize.name)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
  }

  async function saveEdit(id: string) {
    const name = editName.trim()
    if (!name) return
    setLoading(true)
    const { error } = await supabase.from('prizes').update({ name }).eq('id', id)
    if (!error) {
      setEditingId(null)
      setEditName('')
      await loadPrizes()
    }
    setLoading(false)
  }

  async function deletePrize(id: string) {
    if (!confirm('Видалити цей приз?')) return
    setLoading(true)
    const { error } = await supabase.from('prizes').delete().eq('id', id)
    if (!error) await loadPrizes()
    setLoading(false)
  }

  const available = prizes.filter(p => !p.won_by).length
  const won = prizes.filter(p => p.won_by).length

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Призи</h2>
      <p className={styles.count}>
        Доступні: {available} | Виграні: {won}
      </p>

      <div className={styles.addRow}>
        <input
          className={styles.input}
          type="text"
          placeholder="Новий приз..."
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addPrize()}
          disabled={loading}
        />
        <button className={styles.btnPrimary} onClick={addPrize} disabled={loading || !newName.trim()}>
          Додати
        </button>
      </div>

      <ul className={styles.list}>
        {prizes.map(prize => (
          <li key={prize.id} className={`${styles.item} ${prize.won_by ? styles.won : ''}`}>
            {prize.won_by && <span className={styles.wonBadge}>✅</span>}
            {editingId === prize.id ? (
              <div className={styles.editRow}>
                <input
                  className={styles.input}
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveEdit(prize.id)
                    if (e.key === 'Escape') cancelEdit()
                  }}
                  autoFocus
                  disabled={loading}
                />
                <button className={styles.btnPrimary} onClick={() => saveEdit(prize.id)} disabled={loading}>
                  Зберегти
                </button>
                <button className={styles.btnSecondary} onClick={cancelEdit} disabled={loading}>
                  Скасувати
                </button>
              </div>
            ) : (
              <div className={styles.viewRow}>
                <span className={styles.text}>{prize.name}</span>
                {!prize.won_by && (
                  <>
                    <button className={styles.btnIcon} onClick={() => startEdit(prize)} title="Редагувати" disabled={loading}>
                      ✏️
                    </button>
                    <button className={styles.btnIcon} onClick={() => deletePrize(prize.id)} title="Видалити" disabled={loading}>
                      🗑️
                    </button>
                  </>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
