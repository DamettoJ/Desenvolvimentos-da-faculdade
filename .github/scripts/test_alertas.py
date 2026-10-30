"""Offline smoke tests for official feed parsing and risk-neutral display data."""
import importlib.util
from pathlib import Path
p=Path(__file__).parent/'atualizar_alertas.py'
spec=importlib.util.spec_from_file_location('health_alert_update',p)
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
xml=b'''<rss><channel><item><title>Dengue: vigilancia epidemiologica y prevencion</title><link>https://dgvs.mspbs.gov.py/dengue-ejemplo/</link><pubDate>Fri, 30 Oct 2026 11:00:00 +0000</pubDate></item><item><title>Football results</title><link>https://dgvs.mspbs.gov.py/juego/</link><pubDate>Fri, 30 Oct 2026 11:00:00 +0000</pubDate></item><item><title>Health alert unknown source</title><link>https://example.org/fake/</link><pubDate>Fri, 30 Oct 2026 11:00:00 +0000</pubDate></item></channel></rss>'''
a=m.read_feed(xml,m.FEEDS[0]);assert len(a)==1,a;assert 'dengue' in a[0]['title'].lower();assert a[0]['city']=='cde';print('Parser RSS: OK, whitelist HTTPS e filtro tematico OK')