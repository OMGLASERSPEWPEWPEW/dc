import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MapHome from './pages/MapHome'
import About from './pages/About'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<MapHome />} />
        <Route path="about" element={<About />} />
      </Routes>
    </BrowserRouter>
  )
}
