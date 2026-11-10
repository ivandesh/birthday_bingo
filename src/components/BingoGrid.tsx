import BingoCell from './BingoCell'
import styles from './BingoGrid.module.css'
import type { CardCell } from '../types'

interface BingoGridProps {
  cells: CardCell[]
  gridSize: number
  onMarkComplete: (cellId: string) => void
}

export default function BingoGrid({ cells, gridSize, onMarkComplete }: BingoGridProps) {
  const grid: (CardCell | undefined)[][] = Array.from({ length: gridSize }, (_, row) =>
    Array.from({ length: gridSize }, (_, col) =>
      cells.find(c => c.row === row && c.col === col)
    )
  )

  return (
    <table className={styles.table}>
      <tbody>
        {grid.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, colIndex) =>
              cell ? (
                <BingoCell
                  key={cell.id}
                  text={cell.challenge_text}
                  completed={cell.completed}
                  onToggle={() => onMarkComplete(cell.id)}
                />
              ) : (
                <td key={`empty-${rowIndex}-${colIndex}`} />
              )
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
