import importlib.util
import unittest
from pathlib import Path
spec = importlib.util.spec_from_file_location('collector', Path(__file__).resolve().parents[1] / 'scripts/collect_events.py')
c = importlib.util.module_from_spec(spec)
spec.loader.exec_module(c)

class EventsTests(unittest.TestCase):
    def setUp(self):
        self.now = c.parse_date('2026-10-28T09:00:00+01:00')
        self.source = {'id':'test','name':'Calendar','kind':'calendar'}
        self.raw = {'name':'Yoga session','startDate':'2026-10-28T18:00:00Z','location':{'name':'Sociale Sidi Bou Saïd'},'url':'https://example.org/event'}
    def event(self, **kw):
        return c.normalize(dict(self.raw, **kw), self.source, 'https://example.org', self.now)
    def test_local_time(self):
        self.assertEqual(self.event()['start'], '2026-10-28T19:00:00+01:00')
    def test_other_cities_and_description_mentions_do_not_qualify(self):
        for place in ['Koh Tao', 'Sousse', 'Hammamet', 'Djerba']:
            self.assertIsNone(self.event(location={'name':place},description='Visitors from Sidi Bou Said welcome'))
    def test_palace_and_spelling_variants(self):
        for place in ['Sidi Bou Said','Sidi Bou Saïd','Palais Ennejma Ezzahra','Tunis','Carthage Theatre','La Marsa','Gammarth']:
            self.assertIsNotNone(self.event(location={'name':place}))
    def test_twelve_month_boundary(self):
        self.assertIsNotNone(self.event(startDate='2027-10-28'))
        self.assertIsNone(self.event(startDate='2027-10-29'))
        self.assertIsNone(self.event(startDate='2025-12-04'))
    def test_cancellations_and_unsafe_urls(self):
        self.assertIsNone(self.event(eventStatus='EventCancelled'))
        self.assertIsNone(self.event(url='javascript:alert(1)'))
    def test_cmam_does_not_relabel_old_editions_or_invent_times(self):
        page='<div class="blog-item"><h2><a href="https://www.cmam.tn/activite/fr/257/Adagio.html">Adagio</a></h2><i class="icon-calendar"></i> 04 d&eacute;cembre 2025'
        source=dict(self.source,kind='organizer',location='Palais Ennejma Ezzahra, Sidi Bou Saïd')
        rows=c.cmam_events(page,source)
        self.assertEqual(rows[0]['startDate'],'2025-12-04')
        self.assertIsNone(c.normalize(rows[0],source,source.get('url','https://www.cmam.tn'),self.now))
        rows=c.cmam_events(page.replace('2025','2026'),source)
        event=c.normalize(rows[0],source,'https://www.cmam.tn',self.now)
        self.assertTrue(event['dateOnly'])
        self.assertEqual(event['category'],'live-music')
    def test_duplicate_source_link_and_distinct_class_times(self):
        event=self.event()
        self.assertEqual(len(c.deduplicate([event,dict(event)])),1)
        later=self.event(startDate='2026-10-28T20:00:00Z')
        self.assertEqual(len(c.deduplicate([event,later])),2)

class RegionalAdaptersTests(unittest.TestCase):
    def test_explicit_retreat_dates_and_missing_year(self):
        from event_adapters import bookyoga, french_date
        page='<h1>Yoga Retreat</h1><span class="js-sc1-inquiry-modal-arrival">Wednesday October 28, 2026</span><span class="js-sc1-inquiry-modal-departure">Sunday November 1, 2026</span>'
        rows=bookyoga(page,{'location':'Sidi Bou Said'},'https://example.org',None)
        self.assertEqual(rows[0]['endDate'],'2026-11-01')
        self.assertIsNone(french_date('28 octobre'))
    def test_sql_style_timestamp_has_time(self):
        e=c.normalize({'name':'Show','startDate':'2026-11-01 18:30:00','location':'Tunis'}, {'id':'x','name':'X','kind':'calendar'},'https://example.org',c.parse_date('2026-10-28'))
        self.assertFalse(e['dateOnly'])
    def test_public_api_region_and_dates(self):
        from event_adapters import aio
        import json
        rows=aio(json.dumps({'success':True,'responseObject':[{'id':1,'slug':'yoga','name':'Yoga','startTime':'2026-11-01T18:00:00Z','venue':{'name':'Studio','city':'La Marsa'}}]}),{},'',None)
        e=c.normalize(rows[0],{'id':'aio','name':'AIO','kind':'calendar'},'https://aio.events',c.parse_date('2026-10-28'))
        self.assertEqual(e['start'],'2026-11-01T19:00:00+01:00')
    def test_exact_schedule(self):
        from zoneinfo import ZoneInfo
        when=c.datetime(2026,10,28,22,59,tzinfo=ZoneInfo('UTC')).astimezone(c.TZ)
        self.assertEqual(when.strftime('%H:%M'),'23:59')
        workflow=(c.ROOT/'.github/workflows/refresh-events.yml').read_text()
        self.assertIn("59 22 * * *",workflow)

if __name__ == '__main__': unittest.main()
