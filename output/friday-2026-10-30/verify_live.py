import json
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).parent
EXPECTED = json.loads((ROOT / 'metadata.json').read_text())

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta, self.links, self.images, self.headings, self.ld = {}, [], [], [], []
        self.heading = None
        self.json_buffer = None
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'meta':
            self.meta.setdefault(a.get('name', a.get('property', '')), []).append(a.get('content'))
        if tag == 'link': self.links.append(a)
        if tag == 'img': self.images.append(a)
        if tag in ('h1', 'h2'): self.heading = [tag, '']
        if tag == 'script' and a.get('type') == 'application/ld+json': self.json_buffer = ''
    def handle_data(self, data):
        if self.heading is not None: self.heading[1] += data
        if self.json_buffer is not None: self.json_buffer += data
    def handle_endtag(self, tag):
        if self.heading is not None and tag == self.heading[0]:
            self.headings.append(self.heading)
            self.heading = None
        if tag == 'script' and self.json_buffer is not None:
            self.ld.append(json.loads(self.json_buffer))
            self.json_buffer = None

def fetch(url):
    with urllib.request.urlopen(url, timeout=30) as r:
        return r.status, r.url, dict(r.headers), r.read()

result = {}
for host in ('www.spicey.dev', 'spicey.dev'):
    status, url, headers, data = fetch('https://' + host + '/blog/' + EXPECTED['slug'])
    p = Page()
    p.feed(data.decode())
    result[host] = {
        'status': status, 'finalUrl': url,
        'robotsHeader': headers.get('X-Robots-Tag'),
        'meta': {k: v for k, v in p.meta.items() if k.startswith(('og:', 'twitter:')) or k in ('robots', 'description')},
        'canonical': [l.get('href') for l in p.links if l.get('rel') == 'canonical'],
        'headings': p.headings, 'images': p.images, 'jsonLd': p.ld,
        'hasPublicationDate': '2026-10-30' in data.decode(),
    }
    (ROOT / (host + '-article.html')).write_bytes(data)

status, url, headers, data = fetch('https://www.spicey.dev' + EXPECTED['cover'])
result['cover'] = {'status': status, 'finalUrl': url, 'type': headers.get('Content-Type'), 'bytes': len(data)}
(ROOT / 'live-cover.webp').write_bytes(data)
for route in ('robots.txt', 'sitemap.xml'):
    status, url, headers, data = fetch('https://www.spicey.dev/' + route)
    result[route] = {'status': status, 'finalUrl': url, 'body': data.decode()}
    (ROOT / route).write_bytes(data)

(ROOT / 'live-verification.json').write_text(json.dumps(result, indent=2))
print(json.dumps(result, indent=2))
