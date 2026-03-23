import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ClipboardList, Clock, CheckCircle2, XCircle, Calendar, Inbox, TrendingUp, PieChart } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart as RPieChart, Pie } from 'recharts'

const COLORS = ['#14b8a6', '#06b6d4', '#60a5fa', '#a78bfa', '#f472b6', '#fb923c', '#fbbf24', '#34d399']

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, waiting: 0, completed: 0, cancelled: 0 })
  const [upcoming, setUpcoming] = useState([])
  const [weekData, setWeekData] = useState([])
  const [serviceData, setServiceData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    const { data: all } = await supabase.from('randevular').select('*')
    const { data: upcomingData } = await supabase
      .from('randevular')
      .select('*')
      .gte('tarih', todayStr)
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

      // Last 7 days trend
      const days = []
      const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        const count = all.filter(r => r.tarih === dateStr).length
        days.push({ name: dayNames[d.getDay()], randevu: count, date: dateStr })
      }
      setWeekData(days)

      // Service distribution
      const svcMap = {}
      all.forEach(r => {
        if (r.hizmet_adi) {
          svcMap[r.hizmet_adi] = (svcMap[r.hizmet_adi] || 0) + 1
        }
      })
      const svcArr = Object.entries(svcMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8)
      setServiceData(svcArr)
    }

    setUpcoming(upcomingData || [])
    setLoading(false)
  }

  if (loading) return <div className="loading"><div className="spinner"></div>Yükleniyor...</div>

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
          <p style={{ color: 'var(--accent-hover)', fontWeight: 700 }}>{payload[0].value} randevu</p>
        </div>
      )
    }
    return null
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Kliniğinize genel bakış</p>
        </div>
      </div>

      {/* Stats */}
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

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginBottom: 32 }}>
        {/* 7-Day Trend */}
        <div className="card">
          <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }}>
            <TrendingUp size={20} color="var(--accent)" /> Son 7 Gün Randevu Trendi
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weekData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="randevu" stroke="#14b8a6" strokeWidth={2.5} fill="url(#areaGrad)" dot={{ fill: '#14b8a6', strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: '#2dd4bf' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Service Distribution */}
        <div className="card">
          <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }}>
            <PieChart size={20} color="var(--accent)" /> Hizmet Dağılımı
          </h3>
          {serviceData.length === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <Inbox size={36} color="var(--text-muted)" />
              <h3 style={{ marginTop: 10 }}>Veri yok</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ResponsiveContainer width="50%" height={180}>
                <RPieChart>
                  <Pie data={serviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} strokeWidth={0}>
                    {serviceData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                </RPieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {serviceData.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }}></div>
                    <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming */}
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
