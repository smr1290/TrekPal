from dotenv import load_dotenv,dotenv_values
import os

load_dotenv()

SUPABASE_DIRECT_URI = os.getenv('CONNECTION') 
