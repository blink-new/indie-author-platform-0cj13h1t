import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://azgsrcaqhfqxchpcelmv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6Z3NyY2FxaGZxeGNocGNlbG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTcwMjMsImV4cCI6MjA2ODI5MzAyM30.tNxnULSB2x9pQozAjxWIxL3bXgvl0OmsXriSa6iZ9Uk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface UserProfile {
  id: string
  email: string
  display_name?: string
  pen_names?: string[]
  bio?: string
  website_url?: string
  social_links?: Record<string, any>
  subscription_plan: 'free' | 'pro' | 'premium'
  subscription_status: 'active' | 'canceled' | 'past_due'
  stripe_customer_id?: string
  books_uploaded: number
  created_at: string
  updated_at: string
}

export interface Book {
  id: string
  user_id: string
  title: string
  description?: string
  book_type: 'arc' | 'beta' | 'sale'
  price?: number
  file_url?: string
  file_type?: string
  file_size?: number
  cover_image_url?: string
  expiration_date?: string
  collect_emails: boolean
  download_count: number
  is_active: boolean
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface EmailSubscriber {
  id: string
  user_id: string
  email: string
  name?: string
  source?: string
  book_id?: string
  tags?: string[]
  is_active: boolean
  subscribed_at: string
  unsubscribed_at?: string
  created_at: string
}

export interface EmailCampaign {
  id: string
  user_id: string
  name: string
  subject: string
  content_html: string
  content_text?: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  scheduled_at?: string
  sent_at?: string
  recipient_count: number
  opened_count: number
  clicked_count: number
  bounced_count: number
  unsubscribed_count: number
  tags?: string[]
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Download {
  id: string
  book_id: string
  user_id: string
  reader_email?: string
  reader_name?: string
  ip_address?: string
  user_agent?: string
  downloaded_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id?: string
  stripe_customer_id?: string
  plan_name: string
  plan_price?: number
  billing_interval?: 'month' | 'year'
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete'
  current_period_start?: string
  current_period_end?: string
  canceled_at?: string
  created_at: string
  updated_at: string
}

// Helper functions for common operations
export const createUserProfile = async (user: any) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      id: user.id,
      email: user.email,
      display_name: user.user_metadata?.display_name || user.email?.split('@')[0],
      subscription_plan: 'free',
      subscription_status: 'active',
      books_uploaded: 0
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getUserBooks = async (userId: string) => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const createBook = async (bookData: Omit<Book, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('books')
    .insert(bookData)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateBook = async (bookId: string, updates: Partial<Book>) => {
  const { data, error } = await supabase
    .from('books')
    .update(updates)
    .eq('id', bookId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteBook = async (bookId: string) => {
  const { data, error } = await supabase
    .from('books')
    .update({ is_active: false })
    .eq('id', bookId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const uploadFile = async (file: File, path: string) => {
  const { data, error } = await supabase.storage
    .from('books')
    .upload(path, file, { upsert: true })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('books')
    .getPublicUrl(data.path)

  return publicUrl
}

export const getEmailSubscribers = async (userId: string) => {
  const { data, error } = await supabase
    .from('email_subscribers')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const addEmailSubscriber = async (subscriberData: Omit<EmailSubscriber, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('email_subscribers')
    .insert(subscriberData)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getEmailCampaigns = async (userId: string) => {
  const { data, error } = await supabase
    .from('email_campaigns')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const createEmailCampaign = async (campaignData: Omit<EmailCampaign, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('email_campaigns')
    .insert(campaignData)
    .select()
    .single()

  if (error) throw error
  return data
}

export const recordDownload = async (downloadData: Omit<Download, 'id' | 'downloaded_at'>) => {
  const { data, error } = await supabase
    .from('downloads')
    .insert(downloadData)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getDownloadStats = async (userId: string) => {
  const { data, error } = await supabase
    .from('downloads')
    .select('book_id, downloaded_at')
    .eq('user_id', userId)

  if (error) throw error
  return data || []
}