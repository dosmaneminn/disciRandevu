import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Appointments from './pages/Appointments'
import CalendarView from './pages/CalendarView'
import Doctors from './pages/Doctors'
import Services from './pages/Services'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/services" element={<Services />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
