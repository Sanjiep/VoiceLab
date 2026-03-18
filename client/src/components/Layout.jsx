import { useState } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import LogoutModal from './LogoutModal'

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-300">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-56'}`}>
        <Navbar onLogoutClick={() => setShowLogoutConfirm(true)} />
        <main>
          {children}
        </main>
      </div>
      <LogoutModal
        show={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  )
}