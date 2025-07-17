import { createClient } from '@blinkdotnew/sdk'

// Create Blink client with proper configuration
export const blink = createClient({
  projectId: 'indie-author-platform-0cj13h1t',
  authRequired: true
})

// Keep Supabase client for database operations that need direct access
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://azgsrcaqhfqxchpcelmv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6Z3NyY2FxaGZxeGNocGNlbG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTcwMjMsImV4cCI6MjA2ODI5MzAyM30.tNxnULSB2x9pQozAjxWIxL3bXgvl0OmsXriSa6iZ9Uk'

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)