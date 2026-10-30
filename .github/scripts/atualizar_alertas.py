#!/usr/bin/env python3
"""Collect selected official *public* health RSS feeds for the OrientaSaúde demos.

No government internal API access, no diagnosis/risk scoring and no personal data.
The schedule is managed by GitHub Actions. A failed source is reported as failed;
previous articles are retained and dated, never passed off as newly verified.
"""
import datetime as dt
import email.utils
import json
import os
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'saude-publica' / 'alertas.json'
NOW = dt.datetime.now(dt.timezone.utc)
MAX_AGE = dt.timedelta(days=100)
FEEDS = [
  {'id':'dgvs','city':'cde','source':'DGVS — Paraguai', 'scope':'Paraguai · Alto Paraná (abrangência nacional)',
   'url':'https://dgvs.mspbs.gov.py/feed/','domain':'dgvs.mspbs.gov.py'},
  {'id':'misiones','city':'iguazu','source':'Salud Pública de Misiones', 'scope':'Misiones · Puerto Iguazú (abrangência provincial)',
   'url':'https://salud.misiones.gob.ar/feed/','domain':'salud.misiones.gob.ar'},
  {'id':'parana','city':'foz','source':'Secretaria de Saúde do Paraná', 'scope':'Paraná · Foz do Iguaçu (abrangência estadual)',
   'url':'https://www.saude.pr.gov.br/rss.xml','domain':'www.saude.pr.gov.br'}
]

# This is a thematic filter, not an epidemiological severity classifier.
THEMES = re.compile(
 r'\b(dengue|chikungunya|zika|oropouche|epidemi|surto|brote|pandemi|vigil[aâ]ncia|'
 r'vigilancia|influenza|gripe|respirat[óo]ri|respirator|sarampo|sarampi[oó]n|'
 r'vacina|vacun|imuni|febre.amarela|fiebre.amarilla|covid|coronav|'
 r'leptospiros|meningite|meningitis|leishmani|hantaviro|arboviro|'
 r'alerta|comunicado.sanit[aá]ri|salud.p[uú]blica|sa[uú]de.p[uú]blica|'
 r'leptospiros|salmonel|c[oó]lera|rabia|inunda[cç]|enchent|desastres|'
 r'ola.de.calor|onda.de.calor|fiebre|febre|virus|v[ií]rus|'
 r'diarre|aedes|mosquito|notifica[cç]|bolet[ií]n|boletim)', re.IGNORECASE)


def published_dt(raw):
    if not raw:
        return None
    try:
        return email.utils.parsedate_to_datetime(raw).astimezone(dt.timezone.utc)
    except Exception:
        try:
            return dt.datetime.fromisoformat(raw.replace('Z','+00:00')).astimezone(dt.timezone.utc)
        except Exception:
            return None


def text(node, *names):
    for key in names:
        child = node.find(key)
        if child is not None and child.text:
            return re.sub(r'\s+', ' ', child.text).strip()
    return ''


def read_feed(xml_bytes, source):
    root=ET.fromstring(xml_bytes)
    ns={'atom':'http://www.w3.org/2005/Atom','dc':'http://purl.org/dc/elements/1.1/'}
    records=root.findall('.//item')
    atom=False
    if not records:
        records=root.findall('.//atom:entry',ns)
        atom=True
    result=[]
    for item in records[:60]:
        title=text(item,'title','{http://www.w3.org/2005/Atom}title')
        if not title or not THEMES.search(title):
            continue
        if atom:
            link=next((n.attrib.get('href','') for n in item.findall('atom:link',ns) if n.attrib.get('rel','alternate') in ('alternate','')), '')
            if not link:
                link=next((n.attrib.get('href','') for n in item.findall('atom:link',ns)),'')
        else:
            link=text(item,'link')
        try:
            parsed=urllib.parse.urlparse(link)
            if parsed.scheme != 'https' or parsed.hostname not in {source['domain'],source['domain'].removeprefix('www.')}:
                continue
        except (ValueError,TypeError):
            continue
        date=published_dt(text(item,'pubDate','{http://www.w3.org/2005/Atom}published','{http://www.w3.org/2005/Atom}updated','{http://purl.org/dc/elements/1.1/}date'))
        if not date or date > NOW + dt.timedelta(hours=12) or NOW-date > MAX_AGE:
            continue
        result.append({'city':source['city'],'source':source['source'],'scope':source['scope'],'title':title[:200],
                       'url':link,'published':date.isoformat(timespec='seconds')})
    result.sort(key=lambda x:x['published'],reverse=True)
    return result[:14]


def fetch(source):
    headers={'User-Agent':'OrientaSaude-public-health-links/1.0 (public educational project)',
             'Accept':'application/rss+xml, application/atom+xml, application/xml, text/xml'}
    request=urllib.request.Request(source['url'],headers=headers)
    # Only preconfigured public HTTPS hosts. Do not follow a redirect to an unrelated domain.
    with urllib.request.urlopen(request,timeout=18) as response:
        redirected=urllib.parse.urlparse(response.url)
        if redirected.scheme!='https' or redirected.hostname!=source['domain']:
            raise ValueError('Feed redirected off the allowlisted official host')
        body=response.read(1_200_000)
    return read_feed(body,source)


def update():
    previous={}
    if OUT.exists():
        try:
            previous=json.loads(OUT.read_text(encoding='utf-8'))
        except (json.JSONDecodeError,OSError):
            pass
    retained=previous.get('items',[]) if isinstance(previous.get('items'),list) else []
    statuses=[]
    complete=[]
    successes=0
    for source in FEEDS:
        try:
            items=fetch(source)
            successes+=1
            statuses.append({'source':source['id'],'status':'checked','count':len(items)})
            # A successful feed with zero relevant items is *not* proof there are no risks.
            complete.extend(items)
        except Exception as exc:
            statuses.append({'source':source['id'],'status':'unavailable','message':str(exc)[:140]})
            old=[x for x in retained if isinstance(x,dict) and x.get('source')==source['source']
                 and published_dt(x.get('published')) and dt.timedelta(0)<=NOW-published_dt(x.get('published'))<=MAX_AGE]
            complete.extend(old[:8])
    complete.sort(key=lambda x:x['published'],reverse=True)
    keys=set()
    unique=[]
    for x in complete:
        key=x.get('url')
        if key in keys:continue
        keys.add(key)
        unique.append(x)
    result={
      'schema_version':1,
      'checked_at':NOW.isoformat(timespec='seconds') if successes else previous.get('checked_at'),
      'update_state': 'ok' if successes==len(FEEDS) else ('partial' if successes else 'failed'),
      'description': 'Publicações extraídas de fontes públicas oficiais. Não é alerta de emergência, não é vigilância em tempo real, não indica risco local automaticamente.',
      'sources':statuses,
      'items':unique[:36]
    }
    OUT.parent.mkdir(parents=True,exist_ok=True)
    content=json.dumps(result,ensure_ascii=False,indent=2)+'\n'
    OUT.write_text(content,encoding='utf-8')
    print(json.dumps({'status':result['update_state'],'checked_at':result['checked_at'],'feeds':statuses,'items':len(unique)},ensure_ascii=False))
    # Fail if no remote source was available, so Actions exposes failure and users get stale data notice.
    if not successes:
        sys.exit(1)


if __name__=='__main__':
    update()