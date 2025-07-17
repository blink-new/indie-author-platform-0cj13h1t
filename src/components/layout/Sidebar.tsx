import { useState } from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  BookOpen, 
  LayoutDashboard, 
  Mail, 
  BarChart3, 
  Settings,
  LogOut,
  Menu,
  X,
  User,
  CreditCard
} from 'lucide-react'
import { blink } from '../../lib/blink'

interface SidebarProps {
  currentPage: 'dashboard' | 'books' | 'campaigns' | 'analytics' | 'settings' | 'profile'
  onNavigate: (page: 'landing' | 'dashboard' | 'books' | 'campaigns' | 'analytics' | 'settings' | 'profile') => void
  user: {
    id: string
    email: string
    displayName?: string
  } | null
}

export default function Sidebar({ currentPage, onNavigate, user }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const navigation = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      href: 'dashboard'
    },
    {
      id: 'books',
      name: 'Book Management',
      icon: BookOpen,
      href: 'books'
    },
    {
      id: 'campaigns',
      name: 'Email Campaigns',
      icon: Mail,
      href: 'campaigns',
      badge: 'Soon'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: BarChart3,
      href: 'analytics',
      badge: 'Soon'
    }
  ]

  const bottomNavigation = [
    {
      id: 'profile',
      name: 'Profile',
      icon: User,
      href: 'profile',
      badge: 'Soon'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      href: 'settings',
      badge: 'Soon'
    }
  ]

  const handleLogout = () => {
    blink.auth.logout()
    setIsMobileOpen(false)
  }

  const handleNavigation = (page: any) => {
    onNavigate(page)
    setIsMobileOpen(false)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border/40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              IndieUnit
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <Button
            key={item.id}
            variant={currentPage === item.id ? 'secondary' : 'ghost'}
            className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'} ${
              currentPage === item.id ? 'bg-primary/10 text-primary' : ''
            }`}
            onClick={() => handleNavigation(item.href)}
            disabled={item.badge === 'Soon'}
          >
            <item.icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">{item.name}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </Button>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 space-y-2 border-t border-border/40">
        {bottomNavigation.map((item) => (
          <Button
            key={item.id}
            variant={currentPage === item.id ? 'secondary' : 'ghost'}
            className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'} ${
              currentPage === item.id ? 'bg-primary/10 text-primary' : ''
            }`}
            onClick={() => handleNavigation(item.href)}
            disabled={item.badge === 'Soon'}
          >
            <item.icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">{item.name}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </Button>
        ))}

        {/* User Info & Logout */}
        {!isCollapsed && user && (
          <div className="pt-4 border-t border-border/40">
            <div className="px-3 py-2 text-sm text-muted-foreground">
              {user.displayName || user.email}
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start px-3 text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        )}

        {/* Subscription Status */}
        {!isCollapsed && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Free Plan</span>
              <Badge variant="secondary">1/1 Books</Badge>
            </div>
            <Button size="sm" className="w-full" variant="outline">
              <CreditCard className="w-4 h-4 mr-2" />
              Upgrade
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-y-0 left-0 w-64 bg-background border-r border-border/40">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-background border-r border-border/40 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-6 z-10 bg-background border border-border/40 rounded-full"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </Button>

        <SidebarContent />
      </div>
    </>
  )
}