#!/usr/bin/env python3
"""Neuro-OS file listing service (port 18790)"""
import http.server
import json
import os
import urllib.parse

class LsHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        params = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        path = params.get('path', ['/'])[0]
        try:
            items = []
            for e in sorted(os.listdir(path)):
                fp = os.path.join(path, e)
                st = os.lstat(fp)
                items.append({
                    'name': e,
                    'type': 'dir' if os.path.isdir(fp) else 'file',
                    'size': st.st_size,
                    'mtime': int(st.st_mtime)
                })
            body = json.dumps(items).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except Exception as e:
            body = json.dumps({'error': str(e)}).encode()
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
    def log_message(self, *a): pass

http.server.HTTPServer(('127.0.0.1', 18790), LsHandler).serve_forever()
