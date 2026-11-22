# ShiftRelay SPA-aware static server: serves index.html for any non-file route.
# Enables refresh, deep direct URLs (e.g. /app/tasks/TK-1001, /demo, /app/dashboard).
import http.server, os, socketserver

class ShiftRelayHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        p = self.path.split('?')[0]
        # If requested path is not an existing file or directory, fallback to index.html
        if not os.path.isfile('.' + p):
            self.path = '/index.html'
        return super().do_GET()

if __name__ == '__main__':
    PORT = 8000
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('', PORT), ShiftRelayHandler) as s:
        print(f'ShiftRelay running at http://localhost:{PORT}')
        try:
            s.serve_forever()
        except KeyboardInterrupt:
            pass
