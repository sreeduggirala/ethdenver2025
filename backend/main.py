import os
import supabase

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
Client = supabase.create_client(supabase_url, supabase_key)
