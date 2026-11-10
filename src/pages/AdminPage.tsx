import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Config } from '../types'
import ChallengeManager from '../components/ChallengeManager'
import PrizeManager from '../components/PrizeManager'
import CardGenerator from '../components/CardGenerator'
import LiveDashboard from '../components/LiveDashboard'
import styles from './AdminPage.module.css'

type Tab = 'setup' | 'cards' | 'dashboard'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('setup')
  const [config, setConfig] = useState<Config | null>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  async function loadConfig() {
    const { data, error } = await supabase
      .from('config')
      .select('*')
      .limit(1)
      .single()
    if (!error && data) setConfig(data)
  }

  async function setGridSize(size: number) {
    if (!config) return
    const { data, error } = await supabase
      .from('config')
      .update({ grid_size: size })
      .eq('id', config.id)
      .select()
      .single()
    if (!error && data) setConfig(data)
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Керування грою</h1>

      <nav className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'setup' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('setup')}
        >
          Налаштування
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'cards' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('cards')}
        >
          Картки
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'dashboard' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Дашборд
        </button>
      </nav>

      <div className={styles.content}>
        {activeTab === 'setup' && (
          <div>
            <section className={styles.gridSection}>
              <h2 className={styles.sectionTitle}>Розмір поля</h2>
              <div className={styles.gridButtons}>
                <button
                  className={`${styles.gridBtn} ${config?.grid_size === 4 ? styles.gridBtnActive : ''}`}
                  onClick={() => setGridSize(4)}
                >
                  4×4
                </button>
                <button
                  className={`${styles.gridBtn} ${config?.grid_size === 5 ? styles.gridBtnActive : ''}`}
                  onClick={() => setGridSize(5)}
                >
                  5×5
                </button>
              </div>
            </section>

            <ChallengeManager />
            <PrizeManager />
          </div>
        )}

        {activeTab === 'cards' && (
          <CardGenerator gridSize={config?.grid_size ?? 5} />
        )}

        {activeTab === 'dashboard' && (
          <LiveDashboard />
        )}
      </div>
    </div>
  )
}
