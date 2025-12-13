#!/usr/bin/env python3
"""
Simple HTTP server for local development
Run this to view the website locally
"""

import http.server
import socketserver
import webbrowser
from pathlib import Path

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def log_message(self, format, *args):
        # Only log actual requests, not every detail
        if args[1] != '200':
            super().log_message(format, *args)

def main():
    import sys

    Handler = MyHTTPRequestHandler

    # Check if admin page should be opened
    open_admin = '--admin' in sys.argv or '-a' in sys.argv

    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}"
        if open_admin:
            url = f"http://localhost:{PORT}/admin.html"
            print(f"✓ Server running - Opening Review Interface")
        else:
            print(f"✓ Server running at {url}")

        print(f"✓ Total posts: {len(__import__('json').load(open('posts.json')))} posts")
        print(f"\nPress Ctrl+C to stop the server")

        # Open browser
        webbrowser.open(url)

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n✓ Server stopped")

if __name__ == '__main__':
    main()
