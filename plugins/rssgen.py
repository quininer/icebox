# encoding: utf-8

from lxml import etree
from time import time
from email.utils import formatdate
from os.path import isfile

class rssgen(object):
    """
    RSS Generator library...
    >>> from rssgen import rssgen
    >>> feed = rssgen('./rss.xml')
    >>> feed.generator('icebox', 'https://quininer.github.io/', 'pass..')
    >>> feed.additem('hello', 'http://example/', 'Hello world..', '1')
    >>> feed.save()
    >>> feed.delitem('1')
    """

    version = 1.0
    channel = {}

    def __init__(self, path):
        self.path = path
        if isfile(self.path):
            self._source = etree.parse(self.path, parser=etree.XMLParser(strip_cdata=False))
            self.feed = self._source.getroot()
            self._channel = self.feed.find('channel')

            for node in self._channel:
                if node.tag == 'item':
                    continue
                self.channel[node.tag] = node.text

    def generator(self, title, link, description, **channels):
        """
        title, link, description, language, copyright,
        managingEditor, webMaster, pubDate, lastBuildDate,
        category, generator, docs, cloud,
        ttl, image, rating, textInput, skipHours, skipDays
        """
        channels['title'] = title
        channels['link'] = link
        channels['description'] = description
        channels['pubDate'] = channels['pubDate'] if 'pubDate' in channels  else formatdate(time())
        channels['lastBuildDate'] = channels['lastBuildDate'] if 'lastBuildDate' in channels else formatdate(time())
        channels['generator'] = channels['generator'] if 'generator' in channels else "rssgen {}".format(self.version)
        self.channel = channels

        self.feed = etree.Element('rss', {'version':'2.0'})
        self._channel = etree.SubElement(self.feed, 'channel')
        self._source = etree.ElementTree(self.feed)

    def additem(self, title, link, description, guid, **items):
        """
        title, link, description, author, category,
        comments, enclosure, guid, pubDate, source
        """
        items['title'] = title
        items['link'] = link
        items['description'] = description
        items['guid'] = guid
        items['pubDate'] = items['pubDate'] if 'pubDate' in items else formatdate(time())

        item = etree.Element('item')
        for node in items:
            etree.SubElement(item, node).text = etree.CDATA(items[node]) if node in ['description'] else items[node]

        indexitem = self._channel.find('item')
        if indexitem is None:
            self._channel.append(item)
        else:
            self._channel.insert(self._channel.index(indexitem), item)

    def delitem(self, guid):
        for node in self._channel.iter('item'):
            if node.find('guid').text == guid:
                self._channel.remove(node)
                break

    def save(self):
        for node in self.channel:
            if not self.channel[node]:
                continue
            if self._channel.find(node) is None:
                self._channel.insert(0, etree.Element(node))

            self._channel.find(node).text = etree.CDATA(self.channel[node]) if node in ['description'] else self.channel[node]

        self._source.write(self.path, pretty_print=True, xml_declaration=True, encoding='utf-8')
