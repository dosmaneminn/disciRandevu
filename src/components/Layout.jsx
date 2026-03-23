import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Footer from './Footer'

export default function Layout() {
  return (
    <>
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginLeft: 'var(--sidebar-width)', minHeight: '100vh' }}>
        <main className="main-content" style={{ marginLeft: 0, flex: 1 }}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  )
}
