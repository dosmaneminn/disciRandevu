import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { PlusCircle, Edit, CheckCircle2, XCircle, Sparkles, Save, Check, X, Ban } from 'lucide-react'

export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [form, setForm] = useState({ kategori: 'Genel', hizmet_adi: '', aciklama: '', fiyat: '', sure_dakika: 60 })
  const [saving, setSaving] = useState(false)
  const [filterCat, setFilterCat] = useState('all')

  useEffect(() => { fetchServices() }, [])

  async function fetchServices() {
    const { data } = await supabase.from('hizmetler').select('*').order('kategori').order('hizmet_adi')
    setServices(data || [])
    setLoading(false)
  }

  function openModal(svc = null) {
    if (svc) {
      setForm({ kategori: svc.kategori, hizmet_adi: svc.hizmet_adi, aciklama: svc.aciklama || '', fiyat: svc.fiyat, sure_dakika: svc.sure_dakika })
      setEditData(svc)
    } else {
      setForm({ kategori: 'Genel', hizmet_adi: '', aciklama: '', fiyat: '', sure_dakika: 60 })
      setEditData(null)
    }
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const record = { ...form, fiyat: parseFloat(form.fiyat), sure_dakika: parseInt(form.sure_dakika) }
    if (editData) {
      await supabase.from('hizmetler').update(record).eq('id', editData.id)
    } else {
      await supabase.from('hizmetler').insert(record)
    }
    setSaving(false)
    setModalOpen(false)
    fetchServices()
  }

  async function toggleActive(svc) {
    await supabase.from('hizmetler').update({ aktif: !svc.aktif }).eq('id', svc.id)
    fetchServices()
  }

  const categories = [...new Set(services.map(s => s.kategori))]
  const filtered = filterCat === 'all' ? services : services.filter(s => s.kategori === filterCat)

  if (loading) return <div className="loading"><div className="spinner"></div>Yükleniyor...</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Hizmetler</h2>
          <p>{services.length} hizmet kayıtlı</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <PlusCircle size={16} /> Yeni Hizmet
        </button>
      </div>

      <div className="doctor-tabs" style={{ marginBottom: 20 }}>
        <button className={`doctor-tab ${filterCat === 'all' ? 'active' : ''}`} onClick={() => setFilterCat('all')}>Tümü</button>
        {categories.map(c => (
          <button key={c} className={`doctor-tab ${filterCat === c ? 'active' : ''}`} onClick={() => setFilterCat(c)}>{c}</button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Kategori</th>
                <th>Hizmet Adı</th>
                <th>Fiyat</th>
                <th>Süre</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td><span className="badge badge-waiting">{s.kategori}</span></td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.hizmet_adi}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 600 }}>{Number(s.fiyat).toLocaleString('tr-TR')} ₺</td>
                  <td>{s.sure_dakika} dk</td>
                  <td>
                    <span className={`badge ${s.aktif ? 'badge-completed' : 'badge-cancelled'}`}>
                      {s.aktif ? <><CheckCircle2 size={12}/> Aktif</> : <><XCircle size={12}/> Pasif</>}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openModal(s)}>
                        <Edit size={14} />
                      </button>
                      <button className="btn btn-sm" onClick={() => toggleActive(s)} style={{ background: s.aktif ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', color: s.aktif ? 'var(--danger)' : 'var(--success)', border: 'none' }}>
                        {s.aktif ? <Ban size={14}/> : <Check size={14}/>}
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
                {editData ? <><Edit size={20} color="var(--accent)" /> Hizmet Düzenle</> : <><Sparkles size={20} color="var(--accent)" /> Yeni Hizmet</>}
              </h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Kategori *</label>
                  <input className="form-control" value={form.kategori} onChange={e => setForm({...form, kategori: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Hizmet Adı *</label>
                  <input className="form-control" value={form.hizmet_adi} onChange={e => setForm({...form, hizmet_adi: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Açıklama</label>
                <textarea className="form-control" value={form.aciklama} onChange={e => setForm({...form, aciklama: e.target.value})} rows={2} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Fiyat (₺) *</label>
                  <input className="form-control" type="number" step="0.01" value={form.fiyat} onChange={e => setForm({...form, fiyat: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Süre (dakika) *</label>
                  <input className="form-control" type="number" value={form.sure_dakika} onChange={e => setForm({...form, sure_dakika: e.target.value})} required />
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
