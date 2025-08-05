#!/usr/bin/env python3
import http.server
import socketserver
import os
from urllib.parse import urlparse

class ConvertWizHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        # Admin route
        if path == '/admin':
            if os.path.exists('admin.html'):
                self.path = '/admin.html'
            else:
                self.send_error(404, "Admin page not found")
                return
        # Root path
        elif path == '/':
            self.path = '/index.html'
        # SPA routes
        elif path in ['/jpg-to-png', '/currency', '/land', '/dp-resizer', '/word-counter']:
            self.path = '/index.html'
        
        # Call parent method to handle the actual file serving
        return super().do_GET()

if __name__ == "__main__":
    PORT = 5000
    
    with socketserver.TCPServer(("0.0.0.0", PORT), ConvertWizHandler) as httpd:
        print(f"Serving ConvertWiz at http://0.0.0.0:{PORT}")
        print("Press Ctrl+C to stop the server")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped")
            httpd.shutdown()