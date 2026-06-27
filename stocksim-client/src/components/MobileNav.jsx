import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Briefcase, TrendingUp, LogOut, Trophy } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function MobileNav() {
  const location = useLocation()
  const { logout } = useAuth()
  const navigate = useNavigate()


const tabs = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Portfolio', path: '/portfolio', icon: Briefcase },
  { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
]

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-[#2a2a3d] bg-[#0a0a0f]/95 backdrop-blur-md">
      <div className="flex items-center justify-around px-4 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = location.pathname === tab.path
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive
                  ? 'text-purple-400'
                  : 'text-[#475569] hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{tab.name}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-purple-400" />
              )}
            </Link>
          )
        })}

        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-[#475569] hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span className="text-xs font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}