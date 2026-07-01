import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jcrquhzjrqjxoslppsnj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjcnF1aHpqcnFqeG9zbHBwc25qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NjM2NTIsImV4cCI6MjA5ODQzOTY1Mn0.lrQwoU3x9OeP3su-hAi0bY8xuRBvgkNXonoPIGvaess'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
