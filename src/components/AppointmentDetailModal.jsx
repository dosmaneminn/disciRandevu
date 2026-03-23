import { X, Clock, User, Stethoscope, BriefcaseMedical, Phone, Calendar, FileText, DollarSign, Timer } from 'lucide-react'

export default function AppointmentDetailModal({ appointment, onClose }) {
  if (!appointment) return null

  const r = appointment

  const statusMap = {
    bekliyor: { label: 'Bekliyor', className: 'badge-waiting' },
    tamamlandi: { label: 'Tamamlandı', className: 'badge-completed' },
    iptal: { label: 'İptal Edildi', className: 'badge-cancelled' },
  }

  const status = statusMap[r.hizmet_durumu] || { label: r.hizmet_durumu, className: '' }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={20} color="var(--accent)" />
            Randevu Detayı
          </h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <span style={{ fontFamily: "'JetBrains Mono'", color: 'var(--accent-hover)', fontWeight: 600, fontSize: 15 }}>
            {r.randevu_no}
          </span>
          <span className={`badge ${status.className}`}>{status.label}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <DetailItem icon={<User size={16} />} label="Hasta" value={r.hasta_ad_soyad} />
          <DetailItem icon={<Phone size={16} />} label="Telefon" value={r.hasta_telefon} />
          <DetailItem icon={<Stethoscope size={16} />} label="Doktor" value={r.doktor_ad_soyad} />
          <DetailItem icon={<BriefcaseMedical size={16} />} label="Hizmet" value={r.hizmet_adi} />
          <DetailItem icon={<Calendar size={16} />} label="Tarih" value={r.tarih} />
          <DetailItem icon={<Clock size={16} />} label="Saat" value={r.saat?.slice(0, 5)} />
          <DetailItem icon={<DollarSign size={16} />} label="Tutar" value={r.hizmet_tutari ? `${Number(r.hizmet_tutari).toLocaleString('tr-TR')} ₺` : '-'} />
          <DetailItem icon={<Timer size={16} />} label="Süre" value={r.sure_dakika ? `${r.sure_dakika} dk` : '-'} />
        </div>

        {r.notlar && (
          <div style={{ marginTop: 20, padding: 14, background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, fontFamily: "'Outfit'" }}>Notlar</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.notlar}</p>
          </div>
        )}

        {r.iptal_tarihi && (
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--danger)' }}>
            İptal tarihi: {new Date(r.iptal_tarihi).toLocaleString('tr-TR')}
          </div>
        )}

        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
          Oluşturulma: {r.created_at ? new Date(r.created_at).toLocaleString('tr-TR') : '-'}
        </div>
      </div>
    </div>
  )
}

function DetailItem({ icon, label, value }) {
  return (
    <div style={{ padding: 12, background: 'var(--bg-glass)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ color: 'var(--accent)' }}>{icon}</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: "'Outfit'" }}>{label}</span>
      </div>
      <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{value || '-'}</div>
    </div>
  )
}
