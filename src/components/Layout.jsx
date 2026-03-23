import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Sidebar from './Sidebar'
import Footer from './Footer'
import { Bell } from 'lucide-react'

export default function Layout() {
  const [notifications, setNotifications] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    fetchRecent()

    const subscription = supabase
      .channel('public:randevular')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'randevular' }, payload => {
        const newR = payload.new
        setNotifications(prev => [{
          id: newR.id,
          message: `Yeni randevu: ${newR.hasta_ad_soyad} (${newR.tarih} ${newR.saat?.slice(0,5)})`,
          time: new Date().toISOString(),
          read: false
        }, ...prev].slice(0, 5))
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }, [])

  async function fetchRecent() {
    const { data } = await supabase
      .from('randevular')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (data) {
      setNotifications(data.map(r => ({
        id: r.id,
        message: `Yeni randevu: ${r.hasta_ad_soyad} (${r.tarih} ${r.saat?.slice(0,5)})`,
        time: r.created_at,
        read: true
      })))
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  function handleBellClick() {
    setShowDropdown(!showDropdown)
    if (!showDropdown && unreadCount > 0) {
      setNotifications(prev => prev.map(n => ({...n, read: true})))
    }
  }

  return (
    <>
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginLeft: 'var(--sidebar-width)', minHeight: '100vh' }}>
        
        {/* Topbar with Notifications */}
        <header style={{ 
          height: 64, 
          borderBottom: '1px solid var(--border)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-end',
          padding: '0 40px',
          background: 'var(--bg-glass)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={handleBellClick}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                transition: 'var(--transition)'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 8,
                  height: 8,
                  background: 'var(--danger)',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px var(--danger)'
                }} />
              )}
            </button>

            {showDropdown && (
              <div style={{
                position: 'absolute',
                top: 50,
                right: 0,
                width: 320,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-soft)',
                overflow: 'hidden',
                animation: 'slideUp 0.2s ease',
                zIndex: 60
              }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 14 }}>
                  Bildirimler
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    Bildirim yok
                  </div>
                ) : (
                  <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {notifications.map(n => (
                      <div key={n.id} style={{ 
                        padding: '14px 18px', 
                        borderBottom: '1px solid rgba(255,255,255,0.02)',
                        background: !n.read ? 'var(--bg-glass)' : 'transparent',
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: 'var(--text-secondary)'
                      }}>
                        <div style={{ color: !n.read ? 'var(--text-primary)' : 'inherit' }}>{n.message}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                          {new Date(n.time).toLocaleString('tr-TR')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <main className="main-content" style={{ marginLeft: 0, flex: 1 }}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  )
}
