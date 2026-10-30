"""Offline smoke tests for official feed parsing and risk-neutral display data."""
import importlib.util
import email.utils
import datetime as dt
from pathlib import Path
p=Path(__file__).parent/'atualizar_alertas.py'
spec=importlib.util.spec_from_file_location('health_alert_update',p)
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
today=email.utils.format_datetime(dt.datetime.now(dt.timezone.utc))
xml=f'''<rss><channel><item><title>Dengue: vigilancia epidemiologica y prevencion</title><link>https://dgvs.mspbs.gov.py/dengue-ejemplo/</link><pubDate>{today}</pubDate></item><item><title>Football results</title><link>https://dgvs.mspbs.gov.py/juego/</link><pubDate>{today}</pubDate></item><item><title>Health alert unknown source</title><link>https://example.org/fake/</link><pubDate>{today}</pubDate></item></channel></rss>'''.encode()
a=m.read_feed(xml,m.FEEDS[0]);assert len(a)==1,a;assert 'dengue' in a[0]['title'].lower();assert a[0]['city']=='cde';print('Parser RSS: OK, whitelist HTTPS e filtro tematico OK')