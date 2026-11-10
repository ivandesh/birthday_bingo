import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AdminPage from './pages/AdminPage'
import PrintPage from './pages/PrintPage'
import JoinPage from './pages/JoinPage'
import PlayPage from './pages/PlayPage'

export default function App() {
  return (
    <BrowserRouter basename="/birthday-bingo">
      <Routes>
        <Route path="/" element={<JoinPage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/manage-party" element={<AdminPage />} />
        <Route path="/manage-party/print" element={<PrintPage />} />
      </Routes>
    </BrowserRouter>
  )
}
