import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ClipboardList, Clock, CheckCircle2, XCircle, Calendar, Inbox } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, waiting: 0, completed: 0, cancelled: 0 })
  const [upcoming, setUpcoming] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const today = new Date().toISOString().split('T')[0]

    const { data: all } = await supabase.from('randevular').select('*')
    const { data: upcomingData } = await supabase
      .from('randevular')
      .select('*')
      .gte('tarih', today)
      .eq('hizmet_durumu', 'bekliyor')
      .order('tarih', { ascending: true })
      .order('saat', { ascending: true })
      .limit(8)

    if (all) {
      setStats({
        total: all.length,
        waiting: all.filter(r => r.hizmet_durumu === 'bekliyor').length,
        completed: all.filter(r => r.hizmet_durumu === 'tamamlandi').length,
        cancelled: all.filter(r => r.hizmet_durumu === 'iptal').length,
      })
    }
    setUpcoming(upcomingData || [])
    setLoading(false)
  }

  if (loading) return <div className="loading"><div className="spinner"></div>Yükleniyor...</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Kliniğinize genel bakış</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon blue"><ClipboardList size={26} color="var(--info)" /></div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Toplam Randevu</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon yellow"><Clock size={26} color="var(--warning)" /></div>
          <div className="stat-info">
            <h3>{stats.waiting}</h3>
            <p>Bekleyen</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon green"><CheckCircle2 size={26} color="var(--success)" /></div>
          <div className="stat-info">
            <h3>{stats.completed}</h3>
            <p>Tamamlanan</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon red"><XCircle size={26} color="var(--danger)" /></div>
          <div className="stat-info">
            <h3>{stats.cancelled}</h3>
            <p>İptal</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={20} color="var(--accent)" /> Yaklaşan Randevular
        </h3>
        {upcoming.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><Inbox size={48} /></div>
            <h3>Yaklaşan randevu yok</h3>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Randevu No</th>
                  <th>Hasta</th>
                  <th>Doktor</th>
                  <th>Hizmet</th>
                  <th>Tarih</th>
                  <th>Saat</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map(r => (
                  <tr key={r.id}>
                    <td style={{ color: 'var(--accent-hover)', fontWeight: 600 }}>{r.randevu_no}</td>
                    <td style={{ color: 'var(--text-primary)' }}>{r.hasta_ad_soyad}</td>
                    <td>{r.doktor_ad_soyad}</td>
                    <td>{r.hizmet_adi}</td>
                    <td>{r.tarih}</td>
                    <td>{r.saat?.slice(0, 5)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
