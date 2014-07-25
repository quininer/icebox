#!/usr/bin/env python
# encoding: utf-8

from __future__ import unicode_literals
from sys import version_info
if version_info < (3, 0, 0):
    input = raw_input
    str = unicode

from time import ctime
from lxml import etree as et
if __name__ == '__main__':
    from optparse import OptionParser

def newrss(path):
    rss = et.Element('rss', {'version':'2.0'})
    channel = et.SubElement(rss, 'channel')
    et.SubElement(channel, 'title').text = '<![CDATA['+input('title >').decode('utf8')+']]>'
    et.SubElement(channel, 'description').text = '<![CDATA['+input('description >').decode('utf8')+']]>'
    et.SubElement(channel, 'link').text = input('link >').decode('utf8')
    et.SubElement(channel, 'language').text = 'zh-cn'
    et.SubElement(channel, 'generator').text = input('generator >').decode('utf8')

    et.ElementTree(rss).write(
        path,
        pretty_print=True,
        xml_declaration=True,
        encoding='UTF-8')
    exit('[!] 已生成.')

def main(path, name=False):
    path = (path if path[-1] != '/' else path[:-1]) + '/rss.xml'
    if not name:
        newrss(path)

    rss = et.parse(path)
    if name in [title.text for title in rss.xpath('/rss/channel/item/title')]:
        exit('[x] 同名文章已存在')

    channel = rss.xpath('/rss/channel')[0]
    item = et.SubElement(channel, 'item')
    idlist = [guid.text for guid in channel.xpath('item/guid')]

    et.SubElement(item, 'title').text = name
    et.SubElement(item, 'link').text = channel.xpath('link')[0].text+'h/'+name+'.html'
    et.SubElement(item, 'description').text = '<!CDATA['+name+']]>'
    et.SubElement(item, 'pubDate').text = ctime()
    et.SubElement(item, 'author').text = channel.xpath('generator')[0].text
    et.SubElement(item, 'guid').text = (str(int(max(idlist))+1) if idlist else '1')

    rss.write(
            path,
            pretty_print=True,
            xml_declaration=True,
            encoding='utf8')
    exit('[!] 文章已添加.')
#   格式化效果不尽人意..

if __name__ == '__main__':
    parser = OptionParser(
            usage='Usage: %prog [option] Path <Name>',
            description='一个用于生成RSS.xml的扩展'
            )
    parser.add_option('-w', '--new', action='store_true', help='生成一个新的rss.xml')
    (options, args) = parser.parse_args()

    if len(args) == 2: main(args[0], args[1].decode('utf8'))
    elif options.new and len(args) == 1: main(args[0])
    else: parser.print_help()
