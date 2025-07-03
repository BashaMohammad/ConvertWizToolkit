#!/usr/bin/env python3
import http.server
import socketserver
import os
from urllib.parse import urlparse

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    """
    Custom handler for Single Page Applications (SPA).
    Serves index.html for all routes that don't correspond to actual files.
    """
    
    def do_GET(self):
        # Parse the URL path
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Handle special routes first
        if path == '/admin':
            # Serve admin.html for admin route
            with open('admin.html', 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.send_header('Content-length', str(len(content)))
            self.end_headers()
            self.wfile.write(content)
            return
        
        # Remove leading slash and handle empty path
        if path == '/':
            path = 'index.html'
        else:
            path = path.lstrip('/')
        
        # Check if the requested file exists
        if os.path.exists(path) and os.path.isfile(path):
            # File exists, serve it normally
            return super().do_GET()
        else:
            # File doesn't exist, check if it's a SPA route
            spa_routes = ['/jpg-to-png', '/currency', '/land', '/dp-resizer', '/word-counter']
            
            if parsed_path.path in spa_routes or parsed_path.path.startswith('/'):
                # Serve index.html for SPA routes
                self.path = '/index.html'
                return super().do_GET()
            else:
                # Return 404 for other non-existent files
                return super().do_GET()

if __name__ == "__main__":
    PORT = 5000
    
    with socketserver.TCPServer(("0.0.0.0", PORT), SPAHandler) as httpd:
        print(f"Serving ConvertWiz at http://0.0.0.0:{PORT}")
        print("Press Ctrl+C to stop the server")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped")
            httpd.shutdown()