import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

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
        {doctors.map(d => (
          <button key={d.id} className={`doctor-tab ${selectedDoctor === d.id ? 'active' : ''}`} onClick={() => setSelectedDoctor(d.id)}>
            {d.ad_soyad}
          </button>
        ))}
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
                  {events.slice(0, 3).map(e => (
                    <div key={e.id} className={`calendar-event ${e.hizmet_durumu === 'iptal' ? 'cancelled' : ''}`}>
                      {e.saat?.slice(0, 5)} {e.hasta_ad_soyad?.split(' ')[0]}
                    </div>
                  ))}
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
