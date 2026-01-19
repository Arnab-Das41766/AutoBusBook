import smtplib
import socket
import os
import ssl
from dotenv import load_dotenv

# Load env
load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

print(f"--- Email Debugger ---")
print(f"Server: {SMTP_SERVER}")
print(f"Port: {SMTP_PORT}")
print(f"User: {SMTP_EMAIL}")
print(f"Password: {'*' * 5 if SMTP_PASSWORD else 'NOT SET'}")

def test_connectivity():
    print("\n1. Testing TCP Connection...")
    try:
        sock = socket.create_connection((SMTP_SERVER, SMTP_PORT), timeout=10)
        print("   SUCCESS: TCP Connection established.")
        sock.close()
    except Exception as e:
        print(f"   FAILURE: Could not connect to {SMTP_SERVER}:{SMTP_PORT}. Error: {e}")
        print("   -> This usually means your ISP or Network is blocking this port.")
        return False
    return True

def test_login():
    print("\n2. Testing SMTP Login...")
    try:
        context = ssl.create_default_context()
        
        if SMTP_PORT == 465:
            print("   Using SMTP_SSL (Port 465)...")
            with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, context=context) as server:
                server.login(SMTP_EMAIL, SMTP_PASSWORD)
                print("   SUCCESS: Login accepted.")
        else:
            print(f"   Using SMTP + STARTTLS (Port {SMTP_PORT})...")
            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                server.ehlo()
                server.starttls(context=context)
                server.ehlo()
                server.login(SMTP_EMAIL, SMTP_PASSWORD)
                print("   SUCCESS: Login accepted.")
                
    except smtplib.SMTPAuthenticationError as e:
        print(f"   FAILURE: Authentication failed. Error: {e}")
        print("   -> Check your Email/Password. If Gmail, use App Password.")
    except Exception as e:
        print(f"   FAILURE: SMTP Error: {e}")

if __name__ == "__main__":
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print("ERROR: SMTP_EMAIL or SMTP_PASSWORD is not set in .env file.")
    else:
        if test_connectivity():
            test_login()
