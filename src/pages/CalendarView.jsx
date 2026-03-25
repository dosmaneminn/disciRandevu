import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ChevronLeft, ChevronRight, X, Clock, User, Stethoscope, BriefcaseMedical, Phone, DollarSign, Timer, FileText, Calendar } from 'lucide-react'

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

const DOCTOR_COLORS = [
  { bg: 'rgba(20, 184, 166, 0.15)', border: '#14b8a6', text: '#2dd4bf' }, // Teal
  { bg: 'rgba(6, 182, 212, 0.15)', border: '#06b6d4', text: '#22d3ee' },  // Cyan
  { bg: 'rgba(96, 165, 250, 0.15)', border: '#60a5fa', text: '#93c5fd' }, // Blue
  { bg: 'rgba(167, 139, 250, 0.15)', border: '#a78bfa', text: '#c4b5fd' },// Purple
  { bg: 'rgba(244, 114, 182, 0.15)', border: '#f472b6', text: '#f9a8d4' },// Pink
]

function formatLocalDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState('all')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedDayEvents, setSelectedDayEvents] = useState([])

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
    const firstDay = formatLocalDate(new Date(year, month, 1))
    const lastDay = formatLocalDate(new Date(year, month + 1, 0))

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
    const dateStr = formatLocalDate(date)
    return appointments.filter(a => a.tarih === dateStr)
  }

  function getDoctorColor(doctorId) {
    const defaultColor = DOCTOR_COLORS[0]
    if (!doctors.length) return defaultColor
    const index = doctors.findIndex(d => d.id === doctorId)
    return index >= 0 ? DOCTOR_COLORS[index % DOCTOR_COLORS.length] : defaultColor
  }

  function handleDayClick(date) {
    const events = getEventsForDay(date)
    setSelectedDay(date)
    setSelectedDayEvents(events.sort((a, b) => (a.saat || '').localeCompare(b.saat || '')))
  }

  function closeDayModal() {
    setSelectedDay(null)
    setSelectedDayEvents([])
  }

  const today = new Date()
  const isToday = (d) => d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()

  const statusMap = {
    bekliyor: { label: 'Bekliyor', className: 'badge-waiting' },
    tamamlandi: { label: 'Tamamlandı', className: 'badge-completed' },
    iptal: { label: 'İptal Edildi', className: 'badge-cancelled' },
  }

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
                <div 
                  key={i} 
                  className={`calendar-day ${day.otherMonth ? 'other-month' : ''} ${isToday(day.date) ? 'today' : ''}`}
                  onClick={() => handleDayClick(day.date)}
                >
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

      {/* ─── Day Detail Modal ─── */}
      {selectedDay && (
        <div className="modal-overlay" onClick={closeDayModal}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 620 }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={20} color="var(--accent)" />
                {selectedDay.getDate()} {MONTHS[selectedDay.getMonth()]} {selectedDay.getFullYear()}
                {isToday(selectedDay) && <span className="badge badge-completed" style={{ marginLeft: 8, fontSize: 10 }}>Bugün</span>}
              </h3>
              <button className="modal-close" onClick={closeDayModal}><X size={20} /></button>
            </div>

            {selectedDayEvents.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <Calendar size={40} color="var(--text-muted)" />
                <h3 style={{ marginTop: 12 }}>Bu gün için randevu yok</h3>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {selectedDayEvents.length} randevu
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(() => {
                      const w = selectedDayEvents.filter(e => e.hizmet_durumu === 'bekliyor').length
                      const c = selectedDayEvents.filter(e => e.hizmet_durumu === 'tamamlandi').length
                      const x = selectedDayEvents.filter(e => e.hizmet_durumu === 'iptal').length
                      return (
                        <>
                          {w > 0 && <span className="badge badge-waiting" style={{ fontSize: 10 }}>{w} Bekliyor</span>}
                          {c > 0 && <span className="badge badge-completed" style={{ fontSize: 10 }}>{c} Tamamlandı</span>}
                          {x > 0 && <span className="badge badge-cancelled" style={{ fontSize: 10 }}>{x} İptal</span>}
                        </>
                      )
                    })()}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '55vh', overflowY: 'auto' }}>
                  {selectedDayEvents.map(r => {
                    const color = getDoctorColor(r.doktor_id)
                    const status = statusMap[r.hizmet_durumu] || { label: r.hizmet_durumu, className: '' }
                    return (
                      <div
                        key={r.id}
                        style={{
                          padding: 18,
                          background: 'var(--bg-glass)',
                          border: '1px solid var(--border)',
                          borderLeft: `3px solid ${r.hizmet_durumu === 'iptal' ? 'var(--danger)' : color.border}`,
                          borderRadius: 'var(--radius-sm)',
                          transition: 'var(--transition)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.background = 'var(--bg-glass-hover)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-glass)'; e.currentTarget.style.borderLeftColor = r.hizmet_durumu === 'iptal' ? 'var(--danger)' : color.border }}
                      >
                        {/* Header: Saat + Durum */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Clock size={16} color="var(--accent)" />
                            <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Outfit'", color: 'var(--text-primary)' }}>
                              {r.saat?.slice(0, 5)}
                            </span>
                            {r.randevu_no && (
                              <span style={{ fontSize: 11, color: 'var(--accent-hover)', fontFamily: "'JetBrains Mono'", fontWeight: 600, marginLeft: 4 }}>
                                {r.randevu_no}
                              </span>
                            )}
                          </div>
                          <span className={`badge ${status.className}`}>{status.label}</span>
                        </div>

                        {/* Details Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <User size={14} color="var(--text-muted)" />
                            <div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Hasta</div>
                              <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{r.hasta_ad_soyad || '-'}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Stethoscope size={14} color="var(--text-muted)" />
                            <div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Doktor</div>
                              <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{r.doktor_ad_soyad || '-'}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BriefcaseMedical size={14} color="var(--text-muted)" />
                            <div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Hizmet</div>
                              <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{r.hizmet_adi || '-'}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Phone size={14} color="var(--text-muted)" />
                            <div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Telefon</div>
                              <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{r.hasta_telefon || '-'}</div>
                            </div>
                          </div>
                        </div>

                        {/* Footer: Tutar + Süre */}
                        <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                          {r.hizmet_tutari && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--success)' }}>
                              <DollarSign size={12} />
                              {Number(r.hizmet_tutari).toLocaleString('tr-TR')} ₺
                            </div>
                          )}
                          {r.sure_dakika && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                              <Timer size={12} />
                              {r.sure_dakika} dk
                            </div>
                          )}
                          {r.notlar && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                              <FileText size={12} />
                              Not var
                            </div>
                          )}
                        </div>

                        {/* Notlar */}
                        {r.notlar && (
                          <div style={{ marginTop: 10, padding: 10, background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-xs)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            {r.notlar}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
