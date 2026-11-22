import urllib.request
import subprocess
import time
import sys
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)

endpoints = [
    '/',
    '/demo',
    '/app/dashboard',
    '/app/shifts',
    '/app/tasks',
    '/css/main.css',
    '/js/app.js',
    '/js/brand.js',
    '/js/store.js'
]

# Check if server is already running on port 8000
proc = None
already_running = False
try:
    with urllib.request.urlopen('http://127.0.0.1:8000/', timeout=1) as resp:
        if resp.status == 200:
            already_running = True
            print("Detected active ShiftRelay server on port 8000.")
except Exception:
    pass

if not already_running:
    print(f"Launching server.py from {PROJECT_ROOT}...")
    proc = subprocess.Popen([sys.executable, 'server.py'], cwd=PROJECT_ROOT)
    time.sleep(1.5)

results = []
try:
    for ep in endpoints:
        url = f'http://127.0.0.1:8000{ep}'
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=3) as resp:
                status = resp.status
                length = len(resp.read())
                results.append((ep, status, length))
                print(f"  ✓ PASS: GET {ep:20} -> {status} (length: {length} bytes)")
        except Exception as e:
            results.append((ep, 'ERROR', str(e)))
            print(f"  ✗ FAIL: GET {ep:20} -> ERROR: {e}")
finally:
    if proc is not None:
        proc.terminate()
        proc.wait()

all_ok = all(status == 200 for ep, status, _ in results)
print("\nPython server probe complete. All 200 OK?", all_ok)
sys.exit(0 if all_ok else 1)
