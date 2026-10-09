"""Import published journal headlines only; retain the previous file on failure."""
import hashlib
import html
import json
import os
from pathlib import Path
import re
import sys
from urllib.error import URLError
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent
FEED = 'https://gardenerandson.substack.com/feed'

def build(raw):
    tree = ET.fromstring(raw)
    slides = []
    for item in tree.findall('./channel/item'):
        title = html.unescape(re.sub(r'<[^>]*>', '', item.findtext('title', '')).strip())
        url = item.findtext('link', '')
        if not title or len(title) > 110 or not url.startswith('https://gardenerandson.substack.com/p/'):
            continue
        slides.append({'type': 'statement', 'duration': 20, 'title': title,
                       'label': 'From the journal · Gardener & Son', 'dark': True,
                       'source': url})
        if len(slides) == 3:
            break
    if not slides:
        raise ValueError('No usable published journal posts')
    version = hashlib.sha256(json.dumps(slides, sort_keys=True).encode()).hexdigest()[:16]
    return {'version': version, 'slides': slides}

def has_saved_journal():
    try:
        saved = json.loads((ROOT / 'journal.json').read_text())
        slides = saved.get('slides')
        return (
            isinstance(saved.get('version'), str) and bool(saved['version'])
            and isinstance(slides, list) and 1 <= len(slides) <= 3
            and all(
                isinstance(slide, dict)
                and slide.get('type') == 'statement'
                and isinstance(slide.get('title'), str) and bool(slide['title'])
                and isinstance(slide.get('source'), str)
                and slide['source'].startswith('https://gardenerandson.substack.com/p/')
                and isinstance(slide.get('duration'), (int, float))
                and slide['duration'] > 0
                for slide in slides
            )
        )
    except (OSError, ValueError, AttributeError):
        return False


def main():
    try:
        if len(sys.argv) > 1:
            raw = Path(sys.argv[1]).read_bytes()
        else:
            with urlopen(Request(FEED, headers={'User-Agent': 'GardenerAndSon-StudioScreen/1.0'}), timeout=30) as response:
                raw = response.read(2_000_001)
        if len(raw) > 2_000_000:
            raise ValueError('Feed exceeds size limit')
        result = build(raw)
    except (URLError, TimeoutError, ConnectionError, ET.ParseError, ValueError) as error:
        if not has_saved_journal():
            raise
        # A blocked or unavailable feed must not erase the display's last good headlines.
        reason = str(error).replace('\r', ' ').replace('\n', ' ')
        print('Journal refresh skipped; retained saved headlines:', reason, file=sys.stderr)
        if os.environ.get('GITHUB_ACTIONS') == 'true':
            print('::warning::Journal feed unavailable; retained saved headlines.')
        return

    temporary = ROOT / 'journal.json.tmp'
    temporary.write_text(json.dumps(result, indent=2, ensure_ascii=False) + '\n')
    os.replace(temporary, ROOT / 'journal.json')
    print('Imported', len(result['slides']), 'published journal headlines')


if __name__ == '__main__':
    main()
