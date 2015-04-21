#!/usr/bin/env python
# encoding: utf-8

from __future__ import unicode_literals, print_function
from sys import version_info
import readline
version = version_info < (3, 0, 0) and True or False
# XXX 下句没什么意义，去掉syntastic的错误提示而已
if version:
    input = raw_input
else:
    unicode = None
from urllib.parse import quote
from markdown import markdownFromFile
from rssgen import rssgen

def generator(feed):
    feed.generator(
        title           = input('Title: '),
        link            = input('Link: '),
        description     = input('Description: '),
        language        = input('Language: '),
        managingEditor  = input('Mail: '),
        image           = input('Icon: '),
        copyright       = input('Copyright: ')
    )

def add_item(feed, name, file=None):
    url = "{link}/?{name}".format(
            link=feed.channel['link'],
            name=quote(name)
        )
    feed.additem(
        name,
        url,
        markdownFromFile(file) if file else name,
        url,
        author=feed.channel['managingEditor']
    )

def del_item(feed, guid):
    feed.delitem("{link}/?{name}".format(
            link=feed.channel['link'],
            name=quote(guid)
        ))

def rename_item(feed, guid, rename, file=None):
    try:
        del_item(feed, guid)
    except Exception:
        pass
    add_item(feed, rename, file)

def main(args):
    if not (args.action or args.path and args.name):
        parser.print_help()
        exit()

    feed = rssgen("{path}/rss.xml".format(path=args.path))
    if args.action == 'generator':
        generator(feed)
    elif args.action == 'delete':
        del_item(feed, args.name)
    elif args.action == 'rename':
        rename_item(feed, args.name, args.rename)
    else:
        rename_item(feed, args.name, args.name, args.file)

    feed.save()

if __name__ == "__main__":
    from argparse import ArgumentParser

    parser = ArgumentParser(description="icebox Generator Rss tool.")
    parser.add_argument("-a", "--action", dest="action", help="Action to be performed. generator, rename, delete...")
    parser.add_argument("-f", "--file", dest="file", help="Blog file path.")
    parser.add_argument("-p", "--path", dest="path", help="RSS file path.")
    parser.add_argument("-n", "--name", dest="name", help="Blog item name.")
    parser.add_argument("-r", "--rename", dest="rename", help="Rename..")

    main(parser.parse_args())
