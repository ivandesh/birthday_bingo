import { useState, useEffect } from 'react'
import styles from './PrizeWheel.module.css'

interface PrizeWheelProps {
  prizes: string[]
  winningIndex: number
  onFinished: () => void
}

const COLORS = [
  '#4f46e5', '#ec4899', '#f59e0b', '#10b981',
  '#8b5cf6', '#ef4444', '#06b6d4', '#f97316',
  '#14b8a6', '#6366f1', '#e11d48', '#84cc16',
]

export default function PrizeWheel({ prizes, winningIndex, onFinished }: PrizeWheelProps) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      const sliceAngle = 360 / prizes.length
      const targetAngle = 360 - (sliceAngle * winningIndex + sliceAngle / 2)
      const fullSpins = 360 * 5
      const total = fullSpins + targetAngle
      setRotation(total)
      setSpinning(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [prizes.length, winningIndex])

  function handleTransitionEnd() {
    setDone(true)
  }

  const sliceAngle = 360 / prizes.length
  const fontSize = prizes.length > 8 ? '5' : '7'

  const slices = prizes.map((prize, i) => {
    const startAngle = (i * sliceAngle * Math.PI) / 180
    const endAngle = ((i + 1) * sliceAngle * Math.PI) / 180
    const midAngle = (startAngle + endAngle) / 2
    const x1 = 100 + 100 * Math.sin(startAngle)
    const y1 = 100 - 100 * Math.cos(startAngle)
    const x2 = 100 + 100 * Math.sin(endAngle)
    const y2 = 100 - 100 * Math.cos(endAngle)
    const largeArc = sliceAngle > 180 ? 1 : 0
    const d = `M100,100 L${x1},${y1} A100,100 0 ${largeArc},1 ${x2},${y2} Z`

    const textRadius = 65
    const tx = 100 + textRadius * Math.sin(midAngle)
    const ty = 100 - textRadius * Math.cos(midAngle)
    const textRotation = (midAngle * 180) / Math.PI
    const label = prize.length > 15 ? prize.slice(0, 15) : prize

    return { d, tx, ty, textRotation, label, color: COLORS[i % COLORS.length] }
  })

  return (
    <div className={styles.container}>
      <div className={styles.pointer}>▼</div>
      <div className={styles.wheel}>
        <svg
          viewBox="0 0 200 200"
          className={styles.svg}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slices.map((slice, i) => (
            <g key={i}>
              <path d={slice.d} fill={slice.color} stroke="#fff" strokeWidth="1" />
              <text
                x={slice.tx}
                y={slice.ty}
                fill="#fff"
                fontSize={fontSize}
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${slice.textRotation}, ${slice.tx}, ${slice.ty})`}
              >
                {slice.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {done && (
        <div className={styles.result}>
          <div>🎉 Ви виграли:</div>
          <div className={styles.prizeName}>{prizes[winningIndex]}</div>
          <button className={styles.button} onClick={onFinished}>
            Супер!
          </button>
        </div>
      )}
    </div>
  )
}
