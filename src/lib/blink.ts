import { createClient } from '@blinkdotnew/sdk'

// Create Blink client for all operations
export const blink = createClient({
  projectId: 'indie-author-platform-0cj13h1t',
  authRequired: true
})

// Database types
export interface UserProfile {
  id: string
  email: string
  displayName?: string
  penNames?: string[]
  bio?: string
  websiteUrl?: string
  socialLinks?: Record<string, any>
  subscriptionPlan: 'free' | 'pro' | 'premium'
  subscriptionStatus: 'active' | 'canceled' | 'past_due'
  stripeCustomerId?: string
  booksUploaded: number
  createdAt: string
  updatedAt: string
}

export interface Book {
  id: string
  userId: string
  title: string
  description?: string
  bookType: 'arc' | 'beta' | 'sale'
  price?: number
  fileUrl?: string
  fileType?: string
  fileSize?: number
  coverImageUrl?: string
  expirationDate?: string
  collectEmails: boolean
  downloadCount: number
  isActive: boolean
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface EmailSubscriber {
  id: string
  userId: string
  email: string
  name?: string
  source?: string
  bookId?: string
  tags?: string[]
  isActive: boolean
  subscribedAt: string
  unsubscribedAt?: string
  createdAt: string
}

export interface EmailCampaign {
  id: string
  userId: string
  name: string
  subject: string
  contentHtml: string
  contentText?: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  scheduledAt?: string
  sentAt?: string
  recipientCount: number
  openedCount: number
  clickedCount: number
  bouncedCount: number
  unsubscribedCount: number
  tags?: string[]
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface Download {
  id: string
  bookId: string
  userId: string
  readerEmail?: string
  readerName?: string
  ipAddress?: string
  userAgent?: string
  downloadedAt: string
}

// Helper functions using Blink SDK
export const createUserProfile = async (user: any) => {
  const profileData = {
    id: user.id,
    email: user.email,
    displayName: user.user_metadata?.display_name || user.email?.split('@')[0],
    subscriptionPlan: 'free',
    subscriptionStatus: 'active',
    booksUploaded: 0
  }

  const profile = await blink.db.userProfiles.create(profileData)
  return profile
}

export const getUserProfile = async (userId: string) => {
  const profiles = await blink.db.userProfiles.list({
    where: { id: userId },
    limit: 1
  })
  
  if (profiles.length === 0) {
    throw new Error('Profile not found')
  }
  
  return profiles[0]
}

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const updatedProfile = await blink.db.userProfiles.update(userId, updates)
  return updatedProfile
}

export const getUserBooks = async (userId: string) => {
  const books = await blink.db.books.list({
    where: { 
      userId: userId,
      isActive: true 
    },
    orderBy: { createdAt: 'desc' }
  })
  
  return books
}

export const createBook = async (bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => {
  const book = await blink.db.books.create(bookData)
  return book
}

export const updateBook = async (bookId: string, updates: Partial<Book>) => {
  const updatedBook = await blink.db.books.update(bookId, updates)
  return updatedBook
}

export const deleteBook = async (bookId: string) => {
  const updatedBook = await blink.db.books.update(bookId, { isActive: false })
  return updatedBook
}

export const uploadFile = async (file: File, path: string) => {
  const { publicUrl } = await blink.storage.upload(file, path, { upsert: true })
  return publicUrl
}

export const getEmailSubscribers = async (userId: string) => {
  const subscribers = await blink.db.emailSubscribers.list({
    where: { 
      userId: userId,
      isActive: true 
    },
    orderBy: { createdAt: 'desc' }
  })
  
  return subscribers
}

export const addEmailSubscriber = async (subscriberData: Omit<EmailSubscriber, 'id' | 'createdAt'>) => {
  const subscriber = await blink.db.emailSubscribers.create(subscriberData)
  return subscriber
}

export const getEmailCampaigns = async (userId: string) => {
  const campaigns = await blink.db.emailCampaigns.list({
    where: { userId: userId },
    orderBy: { createdAt: 'desc' }
  })
  
  return campaigns
}

export const createEmailCampaign = async (campaignData: Omit<EmailCampaign, 'id' | 'createdAt' | 'updatedAt'>) => {
  const campaign = await blink.db.emailCampaigns.create(campaignData)
  return campaign
}

export const recordDownload = async (downloadData: Omit<Download, 'id' | 'downloadedAt'>) => {
  const download = await blink.db.downloads.create({
    ...downloadData,
    downloadedAt: new Date().toISOString()
  })
  return download
}

export const getDownloadStats = async (userId: string) => {
  const downloads = await blink.db.downloads.list({
    where: { userId: userId }
  })
  
  return downloads
}