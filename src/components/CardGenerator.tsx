import styles from './CardGenerator.module.css'

interface Props {
  gridSize: number
}

export default function CardGenerator({ gridSize }: Props) {
  return (
    <div className={styles.stub}>
      CardGenerator (розмір: {gridSize}×{gridSize}) — скоро буде
    </div>
  )
}
