import { QRCodeSVG } from 'qrcode.react'
import { CardCell } from '../types'
import styles from './PrintableCard.module.css'

interface Props {
  cardNumber: number
  token: string
  cells: CardCell[]
  gridSize: number
  baseUrl: string
}

export default function PrintableCard({ cardNumber, token, cells, gridSize, baseUrl }: Props) {
  const qrValue = `${baseUrl}?card=${token}`

  // Build a 2D grid for rendering
  const grid: (CardCell | undefined)[][] = Array.from({ length: gridSize }, (_, row) =>
    Array.from({ length: gridSize }, (_, col) =>
      cells.find((c) => c.row === row && c.col === col)
    )
  )

  return (
    <div className={styles.cardWrapper}>
      {/* Front side */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Картка #{cardNumber}</h2>
        <table className={styles.grid}>
          <tbody>
            {grid.map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className={styles.cell}>
                    {cell?.challenge_text ?? ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Back side */}
      <div className={`${styles.card} ${styles.cardBack}`}>
        <h2 className={styles.cardTitle}>Картка #{cardNumber}</h2>
        <QRCodeSVG value={qrValue} size={150} />
        <p className={styles.tokenText}>{token}</p>
      </div>
    </div>
  )
}
