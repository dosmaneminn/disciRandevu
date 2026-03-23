import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

const DOCTOR_COLORS = [
  { bg: 'rgba(20, 184, 166, 0.15)', border: '#14b8a6', text: '#2dd4bf' }, // Teal
  { bg: 'rgba(6, 182, 212, 0.15)', border: '#06b6d4', text: '#22d3ee' },  // Cyan
  { bg: 'rgba(96, 165, 250, 0.15)', border: '#60a5fa', text: '#93c5fd' }, // Blue
  { bg: 'rgba(167, 139, 250, 0.15)', border: '#a78bfa', text: '#c4b5fd' },// Purple
  { bg: 'rgba(244, 114, 182, 0.15)', border: '#f472b6', text: '#f9a8d4' },// Pink
]

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState('all')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDoctors() }, [])
  useEffect(() => { fetchAppointments() }, [currentDate, selectedDoctor])

  async function fetchDoctors() {
    const { data } = await supabase.from('doktorlar').select('*').eq('aktif', true)
    setDoctors(data || [])
  }

  async function fetchAppointments() {
    setLoading(true)
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).toISOString().split('T')[0]
    const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0]

    let query = supabase.from('randevular').select('*')
      .gte('tarih', firstDay).lte('tarih', lastDay)

    if (selectedDoctor !== 'all') query = query.eq('doktor_id', selectedDoctor)

    const { data } = await query
    setAppointments(data || [])
    setLoading(false)
  }

  function prevMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }
  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  function getCalendarDays() {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)

    let startDay = firstDayOfMonth.getDay() - 1
    if (startDay < 0) startDay = 6

    const days = []
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(year, month, -i)
      days.push({ date: d, otherMonth: true })
    }
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push({ date: new Date(year, month, i), otherMonth: false })
    }
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), otherMonth: true })
    }
    return days
  }

  function getEventsForDay(date) {
    const dateStr = date.toISOString().split('T')[0]
    return appointments.filter(a => a.tarih === dateStr)
  }

  function getDoctorColor(doctorId) {
    const defaultColor = DOCTOR_COLORS[0]
    if (!doctors.length) return defaultColor
    const index = doctors.findIndex(d => d.id === doctorId)
    return index >= 0 ? DOCTOR_COLORS[index % DOCTOR_COLORS.length] : defaultColor
  }

  const today = new Date()
  const isToday = (d) => d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Takvim</h2>
          <p>Randevuları takvim görünümünde inceleyin</p>
        </div>
      </div>

      <div className="doctor-tabs">
        <button className={`doctor-tab ${selectedDoctor === 'all' ? 'active' : ''}`} onClick={() => setSelectedDoctor('all')}>
          Tüm Doktorlar
        </button>
        {doctors.map((d, i) => {
          const color = DOCTOR_COLORS[i % DOCTOR_COLORS.length]
          return (
            <button key={d.id} className={`doctor-tab ${selectedDoctor === d.id ? 'active' : ''}`} onClick={() => setSelectedDoctor(d.id)}>
               <div style={{ width: 8, height: 8, borderRadius: '50%', background: color.border, display: 'inline-block', marginRight: 6 }}></div>
              {d.ad_soyad}
            </button>
          )
        })}
      </div>

      <div className="card">
        <div className="calendar-header">
          <div className="calendar-nav">
            <button onClick={prevMonth} style={{display:'flex', alignItems:'center', justifyContent:'center'}}><ChevronLeft size={18} /></button>
            <h3>{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
            <button onClick={nextMonth} style={{display:'flex', alignItems:'center', justifyContent:'center'}}><ChevronRight size={18} /></button>
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div>Yükleniyor...</div>
        ) : (
          <div className="calendar-grid">
            {DAYS.map(d => <div key={d} className="calendar-day-header">{d}</div>)}
            {getCalendarDays().map((day, i) => {
              const events = getEventsForDay(day.date)
              return (
                <div key={i} className={`calendar-day ${day.otherMonth ? 'other-month' : ''} ${isToday(day.date) ? 'today' : ''}`}>
                  <div className="day-number">{day.date.getDate()}</div>
                  {events.slice(0, 3).map(e => {
                    const color = getDoctorColor(e.doktor_id)
                    return (
                      <div 
                        key={e.id} 
                        className={`calendar-event ${e.hizmet_durumu === 'iptal' ? 'cancelled' : ''}`}
                        style={{
                          background: e.hizmet_durumu !== 'iptal' ? color.bg : undefined,
                          color: e.hizmet_durumu !== 'iptal' ? color.text : undefined,
                          borderLeftColor: e.hizmet_durumu !== 'iptal' ? color.border : undefined,
                        }}
                      >
                        {e.saat?.slice(0, 5)} {e.hasta_ad_soyad?.split(' ')[0]}
                      </div>
                    )
                  })}
                  {events.length > 3 && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingLeft: 6, marginTop: 4 }}>
                      +{events.length - 3} daha
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
