import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AdminPage from './pages/AdminPage'
import PrintPage from './pages/PrintPage'

function Placeholder({ name }: { name: string }) {
  return <div>{name} — coming soon</div>
}

export default function App() {
  return (
    <BrowserRouter basename="/birthday-bingo">
      <Routes>
        <Route path="/" element={<Placeholder name="Join" />} />
        <Route path="/play" element={<Placeholder name="Play" />} />
        <Route path="/manage-party" element={<AdminPage />} />
        <Route path="/manage-party/print" element={<PrintPage />} />
      </Routes>
    </BrowserRouter>
  )
}
