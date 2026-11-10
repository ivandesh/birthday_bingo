import { BrowserRouter, Routes, Route } from 'react-router-dom'

function Placeholder({ name }: { name: string }) {
  return <div>{name} — coming soon</div>
}

export default function App() {
  return (
    <BrowserRouter basename="/birthday-bingo">
      <Routes>
        <Route path="/" element={<Placeholder name="Join" />} />
        <Route path="/play" element={<Placeholder name="Play" />} />
        <Route path="/manage-party" element={<Placeholder name="Admin" />} />
        <Route path="/manage-party/print" element={<Placeholder name="Print" />} />
      </Routes>
    </BrowserRouter>
  )
}
