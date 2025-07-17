import { useState, useEffect } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import BookManagement from './pages/BookManagement'
import EmailCampaigns from './pages/EmailCampaigns'
import Sidebar from './components/layout/Sidebar'
import { Toaster } from './components/ui/toaster'
import { blink } from './lib/blink'

function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'dashboard' | 'books' | 'campaigns' | 'analytics' | 'settings' | 'profile'>('landing')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
      
      // Auto-navigate to dashboard if user is authenticated
      if (state.user && !state.isLoading) {
        setCurrentPage('dashboard')
      } else if (!state.user && !state.isLoading) {
        setCurrentPage('landing')
      }
    })
    return unsubscribe
  }, [])

  const handleGetStarted = () => {
    if (user) {
      setCurrentPage('dashboard')
    } else {
      blink.auth.login()
    }
  }

  const handleNavigation = (page: 'landing' | 'dashboard' | 'books' | 'campaigns' | 'analytics' | 'settings' | 'profile') => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-white font-bold">IU</span>
            </div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  const isAuthenticated = user && currentPage !== 'landing'

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        {isAuthenticated && (
          <Sidebar 
            currentPage={currentPage as 'dashboard' | 'books' | 'campaigns' | 'analytics' | 'settings' | 'profile'} 
            onNavigate={handleNavigation} 
            user={user} 
          />
        )}
        
        <div className={isAuthenticated ? 'lg:ml-64' : ''}>
          {currentPage === 'landing' ? (
            <LandingPage onGetStarted={handleGetStarted} />
          ) : currentPage === 'dashboard' ? (
            <Dashboard onNavigate={handleNavigation} />
          ) : currentPage === 'books' ? (
            <BookManagement />
          ) : currentPage === 'campaigns' ? (
            <EmailCampaigns />
          ) : currentPage === 'analytics' ? (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Analytics</h2>
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </div>
          ) : currentPage === 'settings' ? (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Settings</h2>
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </div>
          ) : currentPage === 'profile' ? (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Profile</h2>
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </div>
          ) : (
            <Dashboard onNavigate={handleNavigation} />
          )}
        </div>
        
        <Toaster />
      </div>
    </ThemeProvider>
  )
}

export default App