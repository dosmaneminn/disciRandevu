import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AppointmentModal from '../components/AppointmentModal'
import { PlusCircle, Search, Clock, CheckCircle2, XCircle, Edit, Trash2, Inbox } from 'lucide-react'

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)

  useEffect(() => { fetchAppointments() }, [])

  async function fetchAppointments() {
    const { data } = await supabase
      .from('randevular')
      .select('*')
      .order('tarih', { ascending: false })
      .order('saat', { ascending: false })
    setAppointments(data || [])
    setLoading(false)
  }

  async function handleStatusChange(id, status) {
    const updates = { hizmet_durumu: status }
    if (status === 'iptal') updates.iptal_tarihi = new Date().toISOString()
    await supabase.from('randevular').update(updates).eq('id', id)
    fetchAppointments()
  }

  async function handleDelete(id) {
    if (!confirm('Bu randevuyu silmek istediğinize emin misiniz?')) return
    await supabase.from('randevular').delete().eq('id', id)
    fetchAppointments()
  }

  const filtered = appointments.filter(r => {
    const matchSearch = !search || 
      r.hasta_ad_soyad?.toLowerCase().includes(search.toLowerCase()) ||
      r.randevu_no?.toLowerCase().includes(search.toLowerCase()) ||
      r.hasta_telefon?.includes(search)
    const matchStatus = filterStatus === 'all' || r.hizmet_durumu === filterStatus
    return matchSearch && matchStatus
  })

  const statusBadge = (status) => {
    if (status === 'bekliyor') return <span className="badge badge-waiting"><Clock size={12} /> Bekliyor</span>
    if (status === 'tamamlandi') return <span className="badge badge-completed"><CheckCircle2 size={12} /> Tamamlandı</span>
    if (status === 'iptal') return <span className="badge badge-cancelled"><XCircle size={12} /> İptal</span>
    return <span className="badge">{status}</span>
  }

  if (loading) return <div className="loading"><div className="spinner"></div>Yükleniyor...</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Randevular</h2>
          <p>{appointments.length} randevu kayıtlı</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditData(null); setModalOpen(true) }}>
          <PlusCircle size={16} /> Yeni Randevu
        </button>
      </div>

      <div className="search-bar">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input className="form-control" style={{ width: '100%', paddingLeft: 42 }} placeholder="Hasta adı, randevu no veya telefon ile ara..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: 180 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Tüm Durumlar</option>
          <option value="bekliyor">Bekliyor</option>
          <option value="tamamlandi">Tamamlandı</option>
          <option value="iptal">İptal</option>
        </select>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><Inbox size={48} /></div>
            <h3>Randevu bulunamadı</h3>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Randevu No</th>
                  <th>Hasta</th>
                  <th>Telefon</th>
                  <th>Doktor</th>
                  <th>Hizmet</th>
                  <th>Tarih</th>
                  <th>Saat</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td style={{ color: 'var(--accent-hover)', fontWeight: 600, fontFamily: 'monospace' }}>{r.randevu_no}</td>
                    <td style={{ color: 'var(--text-primary)' }}>{r.hasta_ad_soyad}</td>
                    <td>{r.hasta_telefon}</td>
                    <td>{r.doktor_ad_soyad}</td>
                    <td>{r.hizmet_adi}</td>
                    <td>{r.tarih}</td>
                    <td>{r.saat?.slice(0, 5)}</td>
                    <td>{statusBadge(r.hizmet_durumu)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setEditData(r); setModalOpen(true) }}>
                          <Edit size={14} />
                        </button>
                        {r.hizmet_durumu === 'bekliyor' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => handleStatusChange(r.id, 'tamamlandi')}>
                              <CheckCircle2 size={14} />
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(r.id, 'iptal')}>
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <AppointmentModal
          data={editData}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); fetchAppointments() }}
        />
      )}
    </div>
  )
}
