import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { PlusCircle, Edit, CheckCircle2, XCircle, UserPlus, Save, Check, X, Ban } from 'lucide-react'

export default function Doctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [form, setForm] = useState({ ad_soyad: '', uzmanlik: 'Genel Diş Hekimi', telefon: '', email: '', calisma_baslangic: '09:00', calisma_bitis: '18:00' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchDoctors() }, [])

  async function fetchDoctors() {
    const { data } = await supabase.from('doktorlar').select('*').order('id')
    setDoctors(data || [])
    setLoading(false)
  }

  function openModal(doc = null) {
    if (doc) {
      setForm({ ad_soyad: doc.ad_soyad, uzmanlik: doc.uzmanlik, telefon: doc.telefon || '', email: doc.email || '', calisma_baslangic: doc.calisma_baslangic || '09:00', calisma_bitis: doc.calisma_bitis || '18:00' })
      setEditData(doc)
    } else {
      setForm({ ad_soyad: '', uzmanlik: 'Genel Diş Hekimi', telefon: '', email: '', calisma_baslangic: '09:00', calisma_bitis: '18:00' })
      setEditData(null)
    }
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    if (editData) {
      await supabase.from('doktorlar').update(form).eq('id', editData.id)
    } else {
      await supabase.from('doktorlar').insert(form)
    }
    setSaving(false)
    setModalOpen(false)
    fetchDoctors()
  }

  async function toggleActive(doc) {
    await supabase.from('doktorlar').update({ aktif: !doc.aktif }).eq('id', doc.id)
    fetchDoctors()
  }

  if (loading) return <div className="loading"><div className="spinner"></div>Yükleniyor...</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Doktorlar</h2>
          <p>{doctors.length} doktor kayıtlı</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <PlusCircle size={16} /> Yeni Doktor
        </button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Ad Soyad</th>
                <th>Uzmanlık</th>
                <th>Telefon</th>
                <th>Çalışma Saatleri</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map(d => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{d.ad_soyad}</td>
                  <td><span className="badge badge-waiting">{d.uzmanlik}</span></td>
                  <td>{d.telefon}</td>
                  <td>{d.calisma_baslangic?.slice(0,5)} - {d.calisma_bitis?.slice(0,5)}</td>
                  <td>
                    <span className={`badge ${d.aktif ? 'badge-completed' : 'badge-cancelled'}`}>
                      {d.aktif ? <><CheckCircle2 size={12}/> Aktif</> : <><XCircle size={12}/> Pasif</>}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openModal(d)}>
                        <Edit size={14} />
                      </button>
                      <button className="btn btn-sm" onClick={() => toggleActive(d)} style={{ background: d.aktif ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', color: d.aktif ? 'var(--danger)' : 'var(--success)', border: 'none' }}>
                        {d.aktif ? <Ban size={14}/> : <Check size={14}/>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{display:'flex', alignItems:'center', gap: 8}}>
                {editData ? <><Edit size={20} color="var(--accent)" /> Doktor Düzenle</> : <><UserPlus size={20} color="var(--accent)" /> Yeni Doktor</>}
              </h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Ad Soyad *</label>
                  <input className="form-control" value={form.ad_soyad} onChange={e => setForm({...form, ad_soyad: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Uzmanlık *</label>
                  <input className="form-control" value={form.uzmanlik} onChange={e => setForm({...form, uzmanlik: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Telefon</label>
                  <input className="form-control" value={form.telefon} onChange={e => setForm({...form, telefon: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input className="form-control" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Çalışma Başlangıç</label>
                  <input className="form-control" type="time" value={form.calisma_baslangic} onChange={e => setForm({...form, calisma_baslangic: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Çalışma Bitiş</label>
                  <input className="form-control" type="time" value={form.calisma_bitis} onChange={e => setForm({...form, calisma_bitis: e.target.value})} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}><X size={16} /> Vazgeç</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <div className="spinner" style={{width: 16, height: 16, borderTopColor: '#0a0e1a', marginRight: 8}}></div> : <Save size={16} />} 
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
