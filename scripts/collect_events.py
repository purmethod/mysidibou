"""Daily, source-linked Sidi Bou and Greater Tunis event collection."""
from __future__ import annotations
import argparse
import calendar
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from difflib import SequenceMatcher
from hashlib import sha256
from html import unescape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import time
import sys
import unicodedata
from urllib.parse import urljoin, urlsplit, urlunsplit, quote
from urllib.request import Request, build_opener, HTTPRedirectHandler
from urllib.error import HTTPError
from urllib.robotparser import RobotFileParser
from zoneinfo import ZoneInfo

sys.path.insert(0, str(Path(__file__).resolve().parent))
from event_adapters import PARSERS

ROOT = Path(__file__).resolve().parents[1]
TZ = ZoneInfo("Africa/Tunis")
AGENT = "MYSIDIBOUEvents/1.0 (+https://mysidibou.com/kompas)"
MAX_BYTES = 3_000_000
CATEGORIES = ["parties", "raves", "retreats", "yoga-retreats", "workshops", "live-music", "community", "wellness", "sports", "conservation", "cinema", "arts-culture", "festivals"]

def plain(value):
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]*>", " ", str(value or "")))).strip()

def safe_url(value, base=""):
    value = urljoin(base, str(value or ""))
    p = urlsplit(value)
    if p.scheme != "https" or not p.hostname or p.username or p.password:
        return None
    return urlunsplit((p.scheme, p.netloc, quote(p.path, safe="/%:@"), quote(p.query, safe="%=&?/:@,+"), ""))

def parse_date(value):
    if not isinstance(value, str):
        return None
    value = value.strip()
    # Normalize common EventON date serialization without guessing missing years.
    value = re.sub(r"^(\d{4})-(\d{1,2})-(\d{1,2})", lambda m: f"{m[1]}-{int(m[2]):02}-{int(m[3]):02}", value)
    value = re.sub(r"([+-])(\d):(\d{2})$", r"\g<1>0\2:\3", value)
    try:
        d = datetime.fromisoformat(value.replace("Z", "+00:00"))
        return d.replace(tzinfo=TZ) if d.tzinfo is None else d.astimezone(TZ)
    except ValueError:
        return None

def add_months(d, months):
    m = d.month - 1 + months
    y, m = d.year + m // 12, m % 12 + 1
    return d.replace(year=y, month=m, day=min(d.day, calendar.monthrange(y, m)[1]))

class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.schemas, self.links, self.blocks = [], [], []
        self.script_type = None
        self.script = []
        self.block = None
        self.text = []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "script":
            self.script_type = a.get("type", "")
            self.script = []
        if tag == "a" and a.get("href"):
            self.links.append(a["href"])
            self.blocks.append(("link", a["href"]))
        if tag in ("h2", "h3", "h6", "p"):
            self.block, self.text = tag, []

    def handle_data(self, data):
        if self.script_type is not None:
            self.script.append(data)
        elif self.block:
            self.text.append(data)

    def handle_endtag(self, tag):
        if tag == "script":
            if self.script_type == "application/ld+json":
                try:
                    self.schemas.append(json.loads("".join(self.script)))
                except (ValueError, TypeError):
                    pass
            self.script_type = None
        if tag == self.block:
            self.blocks.append((tag, plain(" ".join(self.text))))
            self.block, self.text = None, []

def walk_events(value):
    if isinstance(value, list):
        for item in value:
            yield from walk_events(item)
    elif isinstance(value, dict):
        types = value.get("@type", [])
        if isinstance(types, str):
            types = [types]
        if any(t == "Event" or t.endswith("Event") for t in types):
            yield value
        for item in value.values():
            if isinstance(item, (list, dict)):
                yield from walk_events(item)

def classify(title, description=""):
    s = (title + " " + description).lower()
    if re.search(r"retreat|retraite", s):
        return "yoga-retreats" if "yoga" in s else "retreats"
    if re.search(r"cin[eé]ma|movie night|screening|projection|film festival", s):
        return "cinema"
    if re.search(r"exposition|th[eé][aâ]tre|performance|danse|biennale|com[eé]die|spectacle", s):
        return "arts-culture"
    if re.search(r"\brave\b|\bpsytrance\b|\btechno\b", s):
        return "raves"
    if re.search(r"workshop|masterclass|atelier|sketch|dessin", s):
        return "workshops"
    if "live music" in s or "live band" in s or "concert" in s:
        return "live-music"
    if re.search(r"\bparty\b|\bparties\b|\bdj\b|\bnightclub\b|halloween|soir[eé]e|masquerade|nightlife", s):
        return "parties"
    if "festival" in s: return "festivals"
    if re.search(r"clean.?up|conservation|save our seas|ocean insights", s):
        return "conservation"
    if re.search(r"yoga|meditation|breathwork|sound bath|yin|ashtanga|vinyasa|hatha", s):
        return "wellness"
    if re.search(r"freediv|snorkel|muay thai|climbing|running|padel|marathon|course|fitness|raad games|trail", s):
        return "sports"
    return "community"

def folded(value):
    return re.sub(r"[^a-z0-9 ]", " ", unicodedata.normalize("NFKD", value.lower()).encode("ascii", "ignore").decode()).strip()

def in_region(venue, address="", geo=None):
    # Public venue/address evidence only: a mention in marketing copy is insufficient.
    region = folded(venue + " " + address)
    names = r"\btunis\b|sidi bou|ennejma|carthage|marsa|gammarth|ariana|soukra|sukrah|aouina|menzah|manar|\bkram\b|goulette|bardo|ben arous|mourouj|rades|ezzahra|mornag|borj cedria|borj louzir"
    if re.search(names, region): return True
    # These venues' public programmes identify their Greater Tunis addresses.
    venues = r"el teatro|4eme art|quatrieme art|cite de la culture|city of culture|palais des congres|b7l9|el firma|boeuf sur le toit|belvedere fourati|alhambra|zephyr|sociale|cinemadart|habibi downtown|lartisto"
    if re.search(venues, region): return True
    if isinstance(geo, dict):
        try: return 36.62 <= float(geo.get('latitude')) <= 37.03 and 10.05 <= float(geo.get('longitude')) <= 10.42
        except (TypeError, ValueError): pass
    return False


def normalize(raw, source, page_url, now):
    title = plain(raw.get("name"))[:160]
    start = parse_date(raw.get("startDate"))
    end = parse_date(raw.get("endDate"))
    status = str(raw.get("eventStatus", "")).lower()
    if any(x in status for x in ("cancelled", "canceled", "postponed", "movedonline")):
        return None
    if "OnlineEventAttendanceMode" in str(raw.get("eventAttendanceMode", "")):
        return None
    # Require an explicit date, title and location. Do not turn undated classes into events.
    loc = raw.get("location")
    if isinstance(loc, list):
        loc = loc[0] if loc else None
    if isinstance(loc, dict):
        venue = plain(loc.get("name"))
        address = loc.get("address", {})
        location_text = plain(json.dumps(address, ensure_ascii=False))
    else:
        venue, location_text = plain(loc), plain(loc)
    if not venue:
        venue = source.get("location", "")
    if not title or not start or not venue:
        return None
    description = plain(raw.get("description"))
    # Organizer calendars have a verified local scope; regional calendars need locality evidence.
    if source["kind"] == "calendar" and not in_region(venue, location_text, loc.get("geo") if isinstance(loc, dict) else None):
        return None
    if end and end < start:
        end = None
    if end and bool(re.search(r"[T ]\d{2}:\d{2}", str(raw.get("endDate")))) and end < now:
        return None
    last_day = (end or start).date()
    if last_day < now.date() or start.date() > add_months(now, 12).date():
        return None
    url = safe_url(raw.get("url") or page_url, page_url)
    if not url:
        return None
    category = classify(title, description) if "retreat" in title.lower() else raw.get("category") if raw.get("category") in CATEGORIES else classify(title, description)
    labels = {"parties": "Party", "raves": "Electronic music event", "retreats": "Retreat", "yoga-retreats": "Yoga retreat", "workshops": "Workshop", "live-music": "Live music", "community": "Community event", "wellness": "Wellness session", "sports": "Activity", "conservation": "Conservation event", "cinema": "Film screening", "arts-culture": "Cultural event", "festivals": "Festival"}
    # Original factual microcopy rather than copying/promoting a venue's marketing text.
    days = (end.date() - start.date()).days + 1 if end else 1
    duration = f"{days}-day " if days > 1 and category in ("retreats", "yoga-retreats") else ""
    summary = f"{duration}{labels[category].lower().capitalize()} at {venue}."
    return {
        "id": sha256((title.lower() + start.isoformat() + venue.lower()).encode()).hexdigest()[:16],
        "title": title, "category": category, "start": start.isoformat(),
        "end": end.isoformat() if end else None,
        "dateOnly": not bool(re.search(r"[T ]\d{2}:\d{2}", str(raw.get("startDate")))),
        "location": venue, "summary": summary[:180], "url": url,
        "sourceId": source["id"], "sourceName": source["name"], "sourceKind": source["kind"],
        "schedule": raw.get("schedule"), "note": plain(raw.get("note"))[:180] or None,
        "checkedAt": now.isoformat(), "personallyTested": False
    }

def cmam_events(html, source):
    # CMAM publishes explicit day/month/year inside each programme card.
    months = {"janvier": 1, "février": 2, "mars": 3, "avril": 4, "mai": 5, "juin": 6,
              "juillet": 7, "août": 8, "septembre": 9, "octobre": 10, "novembre": 11, "décembre": 12}
    events = []
    for card in re.split(r'<div class="blog-item">', html)[1:]:
        title = re.search(r'<h2>\s*<a href="([^"]+)"[^>]*>(.*?)</a>\s*</h2>', card, re.S)
        date = re.search(r'icon-calendar[^>]*>\s*</i>\s*(\d{1,2})\s+(\w+)\s+(\d{4})', unescape(card), re.I)
        if not title or not date or date[2].lower() not in months:
            continue
        try:
            start = datetime(int(date[3]), months[date[2].lower()], int(date[1]), tzinfo=TZ)
        except ValueError:
            continue
        events.append({"name": plain(title[2]), "startDate": start.date().isoformat(),
                       "location": source["location"], "url": title[1], "category": "live-music"})
    return events

class RestrictedRedirect(HTTPRedirectHandler):
    def __init__(self, hosts):
        self.hosts = hosts
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if urlsplit(newurl).hostname not in self.hosts or not newurl.startswith("https://"):
            raise ValueError("Redirect outside configured source")
        return super().redirect_request(req, fp, code, msg, headers, newurl)

class Reader:
    def __init__(self, source):
        self.source = source
        self.opener = build_opener(RestrictedRedirect(source["hosts"]))
        self.robots = {}
        self.last = 0.0
    def request(self, url):
        if urlsplit(url).hostname not in self.source["hosts"]:
            raise ValueError("Host outside configured source")
        with self.opener.open(Request(url, headers={"User-Agent": AGENT, "Accept": "text/html,application/json,text/calendar"}), timeout=15) as r:
            data = r.read(MAX_BYTES + 1)
            if len(data) > MAX_BYTES:
                raise ValueError("Source exceeds size limit")
            return data.decode("utf-8", errors="replace")
    def get(self, url):
        origin = "https://" + urlsplit(url).netloc
        if origin not in self.robots:
            rp = RobotFileParser()
            try:
                rp.parse(self.request(origin + "/robots.txt").splitlines())
            except HTTPError as e:
                if e.code != 404:
                    raise ValueError("Cannot verify robots policy") from e
                rp.parse([])
            self.robots[origin] = rp
        rp = self.robots[origin]
        if not rp.can_fetch(AGENT, url):
            raise ValueError("Disallowed by robots.txt")
        delay = max(0.3, rp.crawl_delay(AGENT) or 0)
        if delay > 10:
            raise ValueError("Source requires a longer crawl delay")
        time.sleep(max(0, delay - (time.monotonic() - self.last)))
        try:
            return self.request(url)
        finally:
            self.last = time.monotonic()

def collect_source(source, now):
    reader = Reader(source)
    root_url = source.get("dataUrl", source["url"])
    queue = [root_url] + source.get("seeds", [])
    seen, results, errors, cancelled = set(), [], [], []
    root_success = False
    parsed_total = 0
    deadline = time.monotonic() + source.get("budgetSeconds", 240)
    while queue and time.monotonic() < deadline and len(seen) < source.get("maxPages", 6):
        url = queue.pop(0)
        if url in seen:
            continue
        seen.add(url)
        try:
            html = reader.get(url)
            page = Page(html)
            if url == root_url:
                root_success = True
            if source["parser"] == "cmam": raw = cmam_events(html, source)
            elif source["parser"] in PARSERS: raw = PARSERS[source["parser"]](html, source, url, now)
            else: raw = list(walk_events(page.schemas))
            parsed_total += len(raw)
            for item in raw:
                if re.search(r"cancelled|canceled|postponed", str(item.get("eventStatus", "")), re.I):
                    cancelled.append(safe_url(item.get("url") or url, url))
                event = normalize(item, source, url, now)
                if event:
                    results.append(event)
            for href in page.links:
                link = safe_url(href, url)
                if link and urlsplit(link).hostname in source["hosts"] and re.search(source["linkPattern"], urlsplit(link).path) and link not in seen and link not in queue:
                    queue.append(link)
        except Exception as e:
            errors.append({"url": url, "error": str(e)[:180]})
    if queue:
        errors.append({"url": root_url, "error": "Collection page/time budget reached"})
    if root_success and not parsed_total and not source.get("allowEmpty"):
        errors.append({"url": source["url"], "error": "No structured events found; source may need a parser update"})
    return results, {"id": source["id"], "name": source["name"], "url": source["url"],
        "kind": source["kind"], "status": ("monitor_only" if source.get("monitorOnly") and not parsed_total else "no_dates" if not parsed_total else "ok") if root_success and not errors else "partial" if root_success else "error",
        "coverage": source.get("coverage", "Published event dates"), "pagesChecked": len(seen), "eventsFound": len(results), "errors": errors,
        "checkedAt": now.isoformat(), "rootSuccess": root_success, "cancelledUrls": cancelled}

def deduplicate(events):
    def title_key(e):
        title = folded(e["title"])
        title = re.sub(r"^(concert|performance|exposition)\s+", "", title)
        return re.sub(r"\s+", " ", title).strip()
    def venue_key(e):
        v = folded(e["location"])
        for alias in ("b7l9", "sociale", "el firma", "4eme art", "tunis", "el teatro"):
            if v.startswith(alias): return alias
        return v
    kept = []
    for event in sorted(events, key=lambda e: (e["dateOnly"], e["sourceKind"] != "organizer", e["start"])):
        match = next((old for old in kept if old["start"] == event["start"] and
                      (old["url"] == event["url"] or (title_key(old) == title_key(event) and venue_key(old) == venue_key(event)))), None)
        link = {"name": event["sourceName"], "url": event["url"]}
        if match:
            if link not in match["sources"]: match["sources"].append(link)
        else:
            kept.append(dict(event, sources=[link]))
    return sorted(kept, key=lambda e: e["start"])


def run(now=None, output=None):
    now = now or datetime.now(TZ)
    sources = json.loads((ROOT / "data/sources.json").read_text())
    output = output or ROOT / "public/kompas/events.json"
    previous = json.loads(output.read_text()) if output.exists() else {"events": []}
    batches = list(ThreadPoolExecutor(max_workers=5).map(lambda s: collect_source(s, now), sources))
    events, checks = [], []
    for found, check in batches:
        checks.append(check)
        events.extend(found)
        # Keep recent last-known results on fetch failures, labelled stale. Never silently wipe the feed.
        if check["status"] in ("partial", "error"):
            for old in previous.get("events", []):
                checked = parse_date(old.get("checkedAt"))
                end = parse_date(old.get("end") or old.get("start"))
                if old["url"] not in check["cancelledUrls"] and old["sourceId"] == check["id"] and checked and now - checked < timedelta(days=7) and end and end.date() >= now.date():
                    old = dict(old, stale=True)
                    if not any(e["id"] == old["id"] for e in found):
                        events.append(old)
    if not any(c["status"] in ("ok", "no_dates") for c in checks) and not any(found for found, _ in batches):
        raise RuntimeError("All sources failed; preserving previous event data")
    data = {"updatedAt": now.isoformat(), "timezone": "Africa/Tunis", "horizonMonths": 12,
            "refreshSchedule": {"time": "23:59", "timezone": "Africa/Tunis", "cronUTC": "59 22 * * *"},
            "coverage": "Sidi Bou Saïd and Greater Tunis; published dates only",
            "instagram": {"status": "not_connected"}, "sources": checks, "events": deduplicate(events)}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"events": len(data["events"]), "sources": [{k: c[k] for k in ("id", "status", "eventsFound")} for c in checks]}))
    return data

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--date")
    p.add_argument("--output", type=Path)
    args = p.parse_args()
    run(parse_date(args.date) if args.date else None, args.output)

