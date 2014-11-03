#!/usr/bin/env python
# encoding: utf-8

from __future__ import unicode_literals
from sys import version_info, path as spath
(str, v) = (version_info < (3,0,0) and (unicode, True) or (str, False))

from os import listdir, system, remove, rename
from subprocess import Popen as popen
from optparse import OptionParser
from json import loads, dumps
from time import ctime

setting = loads(open((spath[0] or '.')+'/setting.json').read())

def osexec(name, path, ends):
    for ext in setting['extend']:
        system(setting['shell'].format(name=name, path=path,
            extend=ext.decode('utf8')).encode('utf8'))
    exit('[!] {end}完成!'.format(end=ends))

def additem(name, path, hide):
    item = loads(open('{path}/blog.json'.format(path=path)).read())
    if not (name in item or hide):
        item.append(name)
        open('{path}/blog.json'.format(path=path), 'w').write(dumps(item))

    osexec(name, path, '')

def markout(name, markpath, path, hide):
    mark = open('{mark}/{name}.md'.format(mark=markpath, name=name)).read().decode('utf8')
    open(
        '{mark}/{name}.md'.format(
            mark=markpath,
            name=name
        ), 'w'
    ).write(mark.encode('utf8'))

    additem(name, path, hide)

def editor(name, markpath, path, hide):
    command = (setting['editor'], '{mark}/{name}.md'.format(mark=markpath, name=name))
    try: popen(command).wait()#FIXME    使用Gvim的话，会不等待，往下执行。
    except Exception: system(' '.join(command))
    markout(name, markpath, path, hide)

def rmvx(name, markpath, path, new, hide):
    item = loads(open('{path}/blog.json'.format(path=path)).read())
    if not new:
        if not hide: del item[item.index(name)]
        remove('{mark}/{name}.md'.format(mark=markpath, name=name))
    else:
        if not hide:
            item[item.index(name)] = new
        rename(
            '{mark}/{name}.md'.format(mark=markpath, name=name),
            '{mark}/{name}.md'.format(mark=markpath, name=new)
        )

    if not hide: open('{path}/blog.json'.format(path=path), 'w').write(dumps(item).encode('utf8'))
    osexec(name, path, ('重名' if new else '删除'))

def main(name, rmv=False):
    path = setting['path']
    markpath = setting['md'].format(path=path)
    hide = (name[0]=='@')
    if not '{name}.md'.format(name=name) in listdir(markpath):
        if rmv is False:
            vi = "# {name}\n## *{time}*\n\n".format(name=name, time=ctime())
            open('{mark}/{name}.md'.format(mark=markpath, name=name), 'w').write(vi.encode('utf8'))
    elif rmv != False: rmvx(name, markpath, path, (rmv and rmv.decode('utf8')), hide)
    if rmv != False: exit('[x] 未找到该文章.')

    editor(name, markpath, path, hide)

if __name__ == '__main__':
    parser = OptionParser(usage='Usage: %prog [options] Name')
    parser.add_option('-o', '--outfile', help='指定输出地址.')
    parser.add_option('-e', '--editor', help='指定编辑器.')
    parser.add_option('-s', '--shell', help='指定完成后执行的命令.')
    parser.add_option('-r', '--rename', help='重命名某文章')
    parser.add_option('-c', '--conf', help='指定配置文件')
    parser.add_option('-d', '--delete', action='store_true', help='删除某文章.')
    (options, args) = parser.parse_args()

    if not args:
        parser.print_help()
        exit("\n[x] 请指定文章 Name.")
    if options.conf:
        try: setting = loads(open(options.conf).read())
        except (IOError, ValueError): exit('[x] 配置文件加载错误!')
    if options.outfile: setting['path'] = options.outfile
    if options.editor: setting['editor'] = options.editor
    if options.shell: setting['shell'] = options.shell
    if not (options.delete or options.rename): main(args[0].decode('utf8'))
    else: main(args[0].decode('utf8'), options.rename)
