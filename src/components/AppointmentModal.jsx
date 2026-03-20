import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Edit3, FilePlus2, X, Save, Check } from 'lucide-react'

export default function AppointmentModal({ data, onClose, onSaved }) {
  const [doctors, setDoctors] = useState([])
  const [services, setServices] = useState([])
  const [form, setForm] = useState({
    hasta_ad_soyad: '', hasta_telefon: '', doktor_id: '', hizmet_id: '',
    tarih: '', saat: '', hizmet_durumu: 'bekliyor', notlar: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchOptions()
    if (data) {
      setForm({
        hasta_ad_soyad: data.hasta_ad_soyad || '',
        hasta_telefon: data.hasta_telefon || '',
        doktor_id: data.doktor_id || '',
        hizmet_id: data.hizmet_id || '',
        tarih: data.tarih || '',
        saat: data.saat?.slice(0, 5) || '',
        hizmet_durumu: data.hizmet_durumu || 'bekliyor',
        notlar: data.notlar || ''
      })
    }
  }, [data])

  async function fetchOptions() {
    const { data: d } = await supabase.from('doktorlar').select('*').eq('aktif', true)
    const { data: s } = await supabase.from('hizmetler').select('*').eq('aktif', true).order('kategori')
    setDoctors(d || [])
    setServices(s || [])
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)

    const doctor = doctors.find(d => d.id == form.doktor_id)
    const service = services.find(s => s.id == form.hizmet_id)

    const record = {
      hasta_ad_soyad: form.hasta_ad_soyad,
      hasta_telefon: form.hasta_telefon,
      doktor_id: parseInt(form.doktor_id),
      doktor_ad_soyad: doctor?.ad_soyad || '',
      hizmet_id: parseInt(form.hizmet_id),
      hizmet_adi: service?.hizmet_adi || '',
      hizmet_tutari: service?.fiyat || 0,
      sure_dakika: service?.sure_dakika || 60,
      tarih: form.tarih,
      saat: form.saat,
      hizmet_durumu: form.hizmet_durumu,
      notlar: form.notlar
    }

    if (data) {
      if (form.hizmet_durumu === 'iptal' && data.hizmet_durumu !== 'iptal') {
        record.iptal_tarihi = new Date().toISOString()
      }
      await supabase.from('randevular').update(record).eq('id', data.id)
    } else {
      await supabase.from('randevular').insert(record)
    }

    setSaving(false)
    onSaved()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{display:'flex', alignItems:'center', gap: 8}}>
            {data ? <><Edit3 size={20} color="var(--accent)" /> Randevu Düzenle</> : <><FilePlus2 size={20} color="var(--accent)" /> Yeni Randevu</>}
          </h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Hasta Adı Soyadı *</label>
              <input className="form-control" name="hasta_ad_soyad" value={form.hasta_ad_soyad} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Telefon *</label>
              <input className="form-control" name="hasta_telefon" value={form.hasta_telefon} onChange={handleChange} required placeholder="905xx..." />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Doktor *</label>
              <select className="form-control" name="doktor_id" value={form.doktor_id} onChange={handleChange} required>
                <option value="">Seçin...</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.ad_soyad} — {d.uzmanlik}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Hizmet *</label>
              <select className="form-control" name="hizmet_id" value={form.hizmet_id} onChange={handleChange} required>
                <option value="">Seçin...</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.hizmet_adi} — {Number(s.fiyat).toLocaleString('tr-TR')} ₺</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tarih *</label>
              <input className="form-control" type="date" name="tarih" value={form.tarih} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Saat *</label>
              <input className="form-control" type="time" name="saat" value={form.saat} onChange={handleChange} required />
            </div>
          </div>

          {data && (
            <div className="form-group">
              <label>Durum</label>
              <select className="form-control" name="hizmet_durumu" value={form.hizmet_durumu} onChange={handleChange}>
                <option value="bekliyor">Bekliyor</option>
                <option value="tamamlandi">Tamamlandı</option>
                <option value="iptal">İptal</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Notlar</label>
            <textarea className="form-control" name="notlar" value={form.notlar} onChange={handleChange} rows={3} />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}><X size={16} /> Vazgeç</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <div className="spinner" style={{width: 16, height: 16, borderTopColor: '#0a0e1a', marginRight: 8}}></div> : (data ? <Save size={16} /> : <Check size={16} />)}
              {saving ? 'Kaydediliyor...' : (data ? 'Güncelle' : 'Oluştur')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
