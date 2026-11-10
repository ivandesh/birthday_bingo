import styles from './CongratsScreen.module.css'

interface Props {
  onClose: () => void
}

export default function CongratsScreen({ onClose }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.emoji}>🔥</div>
      <h2>Ще одне БІНГО!</h2>
      <p>Ти просто вогонь!</p>
      <button onClick={onClose}>Супер!</button>
    </div>
  )
}
