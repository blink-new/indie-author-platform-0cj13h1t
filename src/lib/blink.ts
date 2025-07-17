import { createClient } from '@blinkdotnew/sdk'
import { supabase } from './supabase'

// Create Blink client for authentication
export const blink = createClient({
  projectId: 'indie-author-platform-0cj13h1t',
  authRequired: true
})

// Export supabase client for database operations
export { supabase }

// Re-export all Supabase helper functions
export * from './supabase'