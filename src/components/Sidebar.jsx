import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, CalendarRange, Stethoscope, BriefcaseMedical, Sparkles } from 'lucide-react'

export default function Sidebar() {
  const links = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/appointments', icon: <CalendarDays size={20} />, label: 'Randevular' },
    { to: '/calendar', icon: <CalendarRange size={20} />, label: 'Takvim' },
    { to: '/doctors', icon: <Stethoscope size={20} />, label: 'Doktorlar' },
    { to: '/services', icon: <BriefcaseMedical size={20} />, label: 'Hizmetler' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="icon"><Sparkles size={28} color="var(--accent)" /></span>
        <h1>Diş Kliniği</h1>
      </div>
      <nav className="sidebar-nav">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            end={link.to === '/'}
          >
            <span className="icon" style={{display: 'flex', alignItems: 'center'}}>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
