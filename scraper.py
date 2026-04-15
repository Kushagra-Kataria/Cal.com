import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import os
import time

base_url = 'https://cal.com'
visited = set()
to_visit = [base_url]

os.makedirs('scraped_pages', exist_ok=True)

while to_visit and len(visited) < 100:  # limit to 100 pages to avoid excessive scraping
    url = to_visit.pop(0)
    if url in visited:
        continue
    visited.add(url)
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'lxml')
        # save html
        filename = url.replace('https://', '').replace('http://', '').replace('/', '_').replace('.', '_').replace(':', '_') + '.html'
        with open(os.path.join('scraped_pages', filename), 'w', encoding='utf-8') as f:
            f.write(str(soup))
        # find links
        for link in soup.find_all('a', href=True):
            href = link['href']
            full_url = urljoin(url, href)
            if urlparse(full_url).netloc == 'cal.com' and full_url not in visited and full_url not in to_visit:
                to_visit.append(full_url)
    except Exception as e:
        print(f"Error scraping {url}: {e}")
    time.sleep(1)  # be polite to the server

print(f"Scraped {len(visited)} pages")