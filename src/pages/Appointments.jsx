import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import AppointmentModal from '../components/AppointmentModal'
import AppointmentDetailModal from '../components/AppointmentDetailModal'
import { PlusCircle, Search, Clock, CheckCircle2, XCircle, Edit, Trash2, Inbox, Eye, Printer } from 'lucide-react'

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailData, setDetailData] = useState(null)

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

  async function handleStatusChange(id, status, e) {
    e.stopPropagation()
    const updates = { hizmet_durumu: status }
    if (status === 'iptal') updates.iptal_tarihi = new Date().toISOString()
    await supabase.from('randevular').update(updates).eq('id', id)
    fetchAppointments()
  }

  async function handleDelete(id, e) {
    e.stopPropagation()
    if (!confirm('Bu randevuyu silmek istediğinize emin misiniz?')) return
    await supabase.from('randevular').delete().eq('id', id)
    fetchAppointments()
  }

  function handleEdit(r, e) {
    e.stopPropagation()
    setEditData(r)
    setModalOpen(true)
  }

  function handleViewDetails(r) {
    setDetailData(r)
    setDetailModalOpen(true)
  }

  function handlePrint() {
    const printWindow = window.open('', '', 'height=600,width=800')
    const htmlContent = `
      <html>
        <head>
          <title>Randevu Raporu</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h2 { color: #14b8a6; border-bottom: 2px solid #14b8a6; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .date-generated { font-size: 11px; color: #666; margin-top: 30px; text-align: right; }
          </style>
        </head>
        <body>
          <h2>Diş Kliniği Randevu Raporu</h2>
          <table>
            <thead>
              <tr>
                <th>Randevu No</th>
                <th>Tarih</th>
                <th>Saat</th>
                <th>Hasta</th>
                <th>Telefon</th>
                <th>Doktor</th>
                <th>Hizmet</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(r => `
                <tr>
                  <td>${r.randevu_no}</td>
                  <td>${r.tarih}</td>
                  <td>${r.saat?.slice(0, 5)}</td>
                  <td>${r.hasta_ad_soyad}</td>
                  <td>${r.hasta_telefon}</td>
                  <td>${r.doktor_ad_soyad}</td>
                  <td>${r.hizmet_adi}</td>
                  <td>${r.hizmet_durumu}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="date-generated">Oluşturuldu: ${new Date().toLocaleString('tr-TR')}</div>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `
    printWindow.document.write(htmlContent)
    printWindow.document.close()
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
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={16} /> Rapor Yazdır
          </button>
          <button className="btn btn-primary" onClick={() => { setEditData(null); setModalOpen(true) }}>
            <PlusCircle size={16} /> Yeni Randevu
          </button>
        </div>
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
                  <tr key={r.id} onClick={() => handleViewDetails(r)} style={{ cursor: 'pointer' }}>
                    <td style={{ color: 'var(--accent-hover)', fontWeight: 600, fontFamily: 'monospace' }}>{r.randevu_no}</td>
                    <td style={{ color: 'var(--text-primary)' }}>{r.hasta_ad_soyad}</td>
                    <td>{r.hasta_telefon}</td>
                    <td>{r.doktor_ad_soyad}</td>
                    <td>{r.hizmet_adi}</td>
                    <td>{r.tarih}</td>
                    <td>{r.saat?.slice(0, 5)}</td>
                    <td>{statusBadge(r.hizmet_durumu)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                        <button className="btn btn-secondary btn-sm" onClick={(e) => handleEdit(r, e)} title="Düzenle">
                          <Edit size={14} />
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); handleViewDetails(r) }} title="Detay">
                          <Eye size={14} />
                        </button>
                        {r.hizmet_durumu === 'bekliyor' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={(e) => handleStatusChange(r.id, 'tamamlandi', e)} title="Tamamlandı İşaretle">
                              <CheckCircle2 size={14} />
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={(e) => handleStatusChange(r.id, 'iptal', e)} title="İptal Et">
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={(e) => handleDelete(r.id, e)} title="Sil">
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

      {detailModalOpen && (
        <AppointmentDetailModal
          appointment={detailData}
          onClose={() => setDetailModalOpen(false)}
        />
      )}
    </div>
  )
}
