import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { blink, getUserProfile, getUserBooks, getEmailSubscribers, getDownloadStats, createUserProfile } from '../lib/blink'
import { 
  BookOpen, 
  Mail, 
  BarChart3, 
  Plus,
  Settings,
  LogOut,
  Users,
  TrendingUp,
  FileText,
  Calendar
} from 'lucide-react'

interface User {
  id: string
  email: string
  displayName?: string
}

interface DashboardProps {
  onNavigate: (page: 'landing' | 'dashboard' | 'books') => void
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBooks: 0,
    emailSubscribers: 0,
    downloads: 0,
    revenue: 0
  })

  const loadUserData = async (userId: string) => {
    try {
      // Try to get user profile, create if doesn't exist
      let profile
      try {
        profile = await getUserProfile(userId)
      } catch (error) {
        // Profile doesn't exist, create it
        const userData = await blink.auth.me()
        profile = await createUserProfile(userData)
      }

      // Load user stats
      const [books, subscribers, downloadStats] = await Promise.all([
        getUserBooks(userId),
        getEmailSubscribers(userId),
        getDownloadStats(userId)
      ])

      setStats({
        totalBooks: books.length,
        emailSubscribers: subscribers.length,
        downloads: downloadStats.length,
        revenue: 0 // TODO: Calculate from subscriptions/sales
      })
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
      
      if (state.user && !state.isLoading) {
        loadUserData(state.user.id)
      }
    })
    return unsubscribe
  }, [])

  const handleLogout = () => {
    blink.auth.logout()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in</h2>
          <p className="text-muted-foreground mb-6">You need to be signed in to access your dashboard.</p>
          <Button onClick={() => blink.auth.login()}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  const statsData = [
    {
      title: "Total Books",
      value: stats.totalBooks.toString(),
      change: "+0%",
      icon: BookOpen,
      color: "text-blue-500"
    },
    {
      title: "Email Subscribers",
      value: stats.emailSubscribers.toString(),
      change: "+0%",
      icon: Users,
      color: "text-green-500"
    },
    {
      title: "Downloads",
      value: stats.downloads.toString(),
      change: "+0%",
      icon: TrendingUp,
      color: "text-purple-500"
    },
    {
      title: "Revenue",
      value: `${stats.revenue}`,
      change: "+0%",
      icon: BarChart3,
      color: "text-orange-500"
    }
  ]

  const quickActions = [
    {
      title: "Upload New Book",
      description: "Add a new book to your library",
      icon: Plus,
      action: () => onNavigate('books'),
      color: "bg-blue-500"
    },
    {
      title: "Create Campaign",
      description: "Send emails to your readers",
      icon: Mail,
      action: () => console.log('Create campaign'),
      color: "bg-green-500"
    },
    {
      title: "View Analytics",
      description: "Check your performance",
      icon: BarChart3,
      action: () => console.log('View analytics'),
      color: "bg-purple-500"
    },
    {
      title: "Manage Settings",
      description: "Update your preferences",
      icon: Settings,
      action: () => console.log('Manage settings'),
      color: "bg-orange-500"
    }
  ]

  const recentActivity = [
    {
      type: "book",
      title: "Welcome! Start by uploading your first book",
      time: "Just now",
      icon: BookOpen
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your books, campaigns, and grow your author business.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Get started with these common tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <div
                      key={index}
                      className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={action.action}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <action.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium mb-1">{action.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest actions and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <activity.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Plan</span>
                    <Badge variant="secondary">Free</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    You're on the free plan with 1 book upload available.
                  </div>
                  <Button className="w-full" variant="outline">
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Getting Started Guide */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Complete these steps to set up your author platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-medium mb-1">Upload Your First Book</h3>
                  <p className="text-sm text-muted-foreground">
                    Add your book files and set up your first distribution
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-medium mb-1">Create Your First Campaign</h3>
                  <p className="text-sm text-muted-foreground">
                    Send your first email to connect with readers
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-medium mb-1">Set Up Your Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete your author profile and preferences
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}