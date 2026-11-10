import styles from './BingoCell.module.css'

interface BingoCellProps {
  text: string
  completed: boolean
  onToggle: () => void
}

export default function BingoCell({ text, completed, onToggle }: BingoCellProps) {
  function handleClick() {
    if (completed) return
    const confirmed = window.confirm(`Відмітити як виконане?\n\n"${text}"`)
    if (confirmed) onToggle()
  }

  return (
    <td
      className={`${styles.cell} ${completed ? styles.completed : ''}`}
      onClick={handleClick}
    >
      {completed && <span className={styles.checkmark}>✓</span>}
      <span className={styles.text}>{text}</span>
    </td>
  )
}
