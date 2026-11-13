"""
Lightweight zero-dependency frontend runner.
Serves the 'frontend' directory and opens it in your default web browser.

Usage:
    python run_frontend.py [port]
"""

import http.server
import os
import socketserver
import sys
import webbrowser

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend')


class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=FRONTEND_DIR, **kwargs)

    def end_headers(self):
        # Enable CORS for local testing
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, PUT, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization')
        super().end_headers()


def main():
    os.chdir(FRONTEND_DIR)
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        url = f"http://localhost:{PORT}"
        print("=" * 65)
        print(" 🏥 ApexCare Clinic Appointment Management System — Frontend")
        print("=" * 65)
        print(f" Serving frontend from: {FRONTEND_DIR}")
        print(f" URL: {url}")
        print(f" Target Backend: http://127.0.0.1:8000/api")
        print(" Press Ctrl+C to stop the server.")
        print("=" * 65)
        
        try:
            webbrowser.open(url)
        except Exception:
            pass

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down frontend server.")


if __name__ == '__main__':
    main()
