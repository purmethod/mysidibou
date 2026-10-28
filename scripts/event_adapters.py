"""Parsers for published Tunis programmes, never dates inferred from posting dates."""
from datetime import datetime, timedelta, timezone
from html.parser import HTMLParser
from html import unescape
import re
import json
from urllib.parse import urljoin

MONTHS = {name: i + 1 for i, name in enumerate(('janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'))}

def text(s):
    return re.sub(r'\s+', ' ', unescape(re.sub(r'<[^>]*>', ' ', s or ''))).strip()

class Node:
    def __init__(self, tag='', attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []
    def all(self, tag=None, cls=None, **attrs):
        found=[]
        for child in self.children:
            if isinstance(child, Node):
                if (not tag or child.tag == tag) and (not cls or cls in (child.attrs.get('class') or '').split()) and all(child.attrs.get(k)==v for k,v in attrs.items()): found.append(child)
                found.extend(child.all(tag,cls,**attrs))
        return found
    def first(self, *args, **kwargs):
        return next(iter(self.all(*args, **kwargs)), Node())
    def value(self):
        return text(' '.join(c.value() if isinstance(c,Node) else c for c in self.children if not isinstance(c,Node) or c.tag not in ('script','style')))

class DOM(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True);self.root=Node();self.stack=[self.root];self.feed(html)
    def handle_starttag(self, tag, attrs):
        n=Node(tag,attrs);self.stack[-1].children.append(n)
        if tag not in ('area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'):self.stack.append(n)
    def handle_startendtag(self, tag, attrs):self.stack[-1].children.append(Node(tag,attrs))
    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1,0,-1):
            if self.stack[i].tag==tag:self.stack=self.stack[:i];break
    def handle_data(self,data):self.stack[-1].children.append(data)

def french_date(value):
    value=text(value).lower()
    m=re.search(r'(\d{1,2})\s+([a-zéû]+)\s+(20\d{2})(?:\s+[àa]\s+(\d{1,2})[:h](\d{2}))?', value)
    if not m or m[2] not in MONTHS:return None
    try:
        d=datetime(int(m[3]), MONTHS[m[2]],int(m[1]),int(m[4] or 0),int(m[5] or 0))
        return d.isoformat() if m[4] else d.date().isoformat()
    except ValueError:return None

def teskerti(html, source, url, now):
    root=DOM(html).root;out=[]
    for card in root.all(cls='tour_container'):
        link=next((a.attrs.get('href') for a in card.all('a') if '/evenement/' in a.attrs.get('href','')),None)
        if not link:continue
        title=card.first('h3').value()
        loc=card.first(cls='short_info')
        venue=text(' '.join(c.value() if isinstance(c,Node) else c for c in loc.children if not isinstance(c,Node) or 'price' not in c.attrs.get('class','')))
        dates=card.first('small').value();start=french_date(dates);end=None
        m=re.search(r'Du (\d{2})/(\d{2})/(\d{4}) au (\d{2})/(\d{2})/(\d{4})',dates)
        if m:start=f'{m[3]}-{m[2]}-{m[1]}';end=f'{m[6]}-{m[5]}-{m[4]}'
        category='cinema' if '/cinema' in url or re.search(r'cin[eé]|alhambra',venue,re.I) else None
        out.append(dict(name=title,startDate=start,endDate=end,location=venue,url=link,category=category))
    return out

def elteatro(html, source, url, now):
    out=[]
    for card in DOM(html).root.all(cls='all-time-hit__single'):
        title=card.first(cls='all-time-hit__title');link=title.first('a')
        out.append(dict(name=title.value(),startDate=french_date(card.first(cls='all-time-hit__text').value()),location=source['location'],url=link.attrs.get('href'),category='arts-culture'))
    return out

def artexplora(html, source, url, now):
    out=[]
    for card in DOM(html).root.all(cls='grid-cards'):
        title=card.first('h2').value();info=[n.value() for n in card.all(cls='fest_swiper_info')]
        start=card.first(**{'fs-cmsfilter-field':'date'}).value();end=card.first(**{'fs-cmsfilter-field':'date-max'}).value()
        times=[s for s in info if re.fullmatch(r'\d{2}:\d{2}',s)]
        if not title or not start:continue
        if len(times)==2 and start==end:start+='T'+times[0];end+='T'+times[1]
        out.append(dict(name=title,startDate=start,endDate=end,location=info[0] if info else source.get('location'),url=urljoin(url,card.first('a').attrs.get('href','')),category='arts-culture'))
    return out

def bookyoga(html, source, url, now):
    root=DOM(html).root;start=root.first(cls='js-sc1-inquiry-modal-arrival').value();end=root.first(cls='js-sc1-inquiry-modal-departure').value()
    # Only explicit published package dates, not arbitrary user-selected dates or pricing validity.
    try:
        start=datetime.strptime(start,'%A %B %d, %Y').date().isoformat();end=datetime.strptime(end,'%A %B %d, %Y').date().isoformat()
    except ValueError:return []
    return [dict(name=root.first('h1').value(),startDate=start,endDate=end,location=source['location'],url=url,category='yoga-retreats')]

def yogatribes(html, source, url, now):
    s=DOM(html).root.value();m=re.search(r'(?:[Dd]u\s+)?(\d{1,2})\s+au\s+(\d{1,2})\s+(\w+)\s+(20\d{2})',s)
    if not m or m[3].lower() not in MONTHS:return []
    return [dict(name='YogaTribes — Tunisie Mer et Désert',startDate=f'{m[4]}-{MONTHS[m[3].lower()]:02}-{int(m[1]):02}',endDate=f'{m[4]}-{MONTHS[m[3].lower()]:02}-{int(m[2]):02}',location=source['location'],url=url,category='yoga-retreats',note='Multi-stop travel retreat including Tunis and southern Tunisia. Confirm the itinerary with the organizer.')]

def lagora(html, source, url, now):
    root=DOM(html).root
    selected=root.first(cls='current')
    # The site's selected calendar date is explicit Unix time, not a date guessed from today.
    try: day=datetime.fromtimestamp(int(selected.attrs['data-date_min']),timezone.utc).date().isoformat()
    except (KeyError,TypeError,ValueError):return []
    events=[]
    for card in root.all(cls='mb-movie-filre-with-date'):
        title=card.first(cls='movie-title').value();link=card.first('a').attrs.get('href')
        for n in card.all(cls='showtime-time'):
            m=re.search(r'\d{2}:\d{2}',n.value())
            if m:events.append(dict(name=title,startDate=day+'T'+m[0],location=source['location'],url=link,category='cinema'))
    return events

def ical(html, source, url, now):
    if 'BEGIN:VCALENDAR' not in html:raise ValueError('Calendar feed missing')
    events=[]
    for block in re.findall(r'BEGIN:VEVENT(.*?)END:VEVENT',re.sub(r'\r?\n[ \t]','',html),re.S):
        fields={}
        for line in block.strip().splitlines():
            if ':' not in line:continue
            key,value=line.split(':',1);fields[key.split(';')[0]]=(key,value.strip())
        def get(key):return fields.get(key,('',''))[1]
        def date(key):
            spec,value=fields.get(key,('',''))
            for fmt in ('%Y%m%dT%H%M%SZ','%Y%m%dT%H%M%S','%Y%m%d'):
                try:
                    d=datetime.strptime(value,fmt)
                    if fmt=='%Y%m%d':return d.date().isoformat()
                    from zoneinfo import ZoneInfo
                    tz=re.search(r'TZID=([^;:]+)',spec)
                    return d.replace(tzinfo=timezone.utc if value.endswith('Z') else ZoneInfo(tz[1]) if tz else now.tzinfo).isoformat()
                except ValueError:pass
            return None
        if 'RRULE' in fields:raise ValueError('Recurring ICS entries require explicit expansion; review source')
        start,end=date('DTSTART'),date('DTEND')
        if start and end and len(start)==10:end=(datetime.fromisoformat(end)-timedelta(days=1)).date().isoformat()
        events.append(dict(name=get('SUMMARY').replace('\\,',','),startDate=start,endDate=end,location=get('LOCATION').replace('\\,',',') or source.get('location'),url=get('URL') or source['url'],description=get('DESCRIPTION'),eventStatus=get('STATUS')))
    return events

def aio(html, source, url, now):
    payload=json.loads(html)
    if not payload.get('success'):raise ValueError('AIO public calendar unavailable')
    rows=payload.get('responseObject',[])
    if not isinstance(rows,list):raise ValueError('AIO public calendar format changed')
    return [dict(name=row.get('name'),startDate=row.get('startTime'),endDate=row.get('endTime'),location={'name':row.get('venue',{}).get('name'), 'address':{'streetAddress':row.get('venue',{}).get('address'),'addressLocality':row.get('venue',{}).get('city')}},url='https://aio.events/e/'+str(row.get('slug') or row['id']),description=row.get('description','')) for row in rows]

PARSERS={'teskerti':teskerti,'elteatro':elteatro,'artexplora':artexplora,'bookyoga':bookyoga,'yogatribes':yogatribes,'lagora':lagora,'ical':ical,'aio':aio}
