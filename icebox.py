#!/usr/bin/env python
# encoding: utf-8

from __future__ import unicode_literals, print_function
from sys import version_info, path as spath
version = version_info < (3,0,0) and True or False
# XXX 下句没什么意义，去掉syntastic的错误提示而已
if not version: unicode = None

from os import listdir, system, remove, rename
from subprocess import Popen as popen
from optparse import OptionParser
from json import loads, dumps
from time import ctime

setting = loads(open((spath[0] or '.')+'/setting.json').read())

def strcode(string):
    if version: return isinstance(string, unicode) and string.encode('utf8') or string.decode('utf8')
    else: return string

def osexec(name, path, mark, ends):
    for ext in setting['extend']:
        system(strcode(setting['shell'].format(
            name=name, path=path, ext=strcode(ext), mark=mark
        )))
    exit('[!] {end}完成!'.format(end=ends))

def additem(name, path, mark, hide):
    item = loads(open('{path}/blog.json'.format(path=path)).read())
    if not hide:
        if name in item: item.pop(item.index(name))
        item.append(name)
        open('{path}/blog.json'.format(path=path), 'w').write(dumps(item))

    osexec(name, path, mark, '')

def editor(name, mark, path, hide):
    command = (setting['editor'], '{mark}/{name}.md'.format(mark=mark, name=name))
    try: popen(command).wait()#FIXME    使用Gvim的话，会不等待，往下执行。
    except Exception: system(' '.join(command))
    additem(name, path, mark, hide)

def rmvx(name, mark, path, new, hide):
    item = loads(open('{path}/blog.json'.format(path=path)).read())
    if not new:
        if not hide: del item[item.index(name)]
        remove('{mark}/{name}.md'.format(mark=mark, name=name))
    else:
        if not hide:
            item[item.index(name)] = new
        rename(
            '{mark}/{name}.md'.format(mark=mark, name=name),
            '{mark}/{name}.md'.format(mark=mark, name=new)
        )

    if not hide: open('{path}/blog.json'.format(path=path), 'w').write(strcode(dumps(item)))
    osexec(name, path, mark, ('重名' if new else '删除'))

def main(name, rmv=False):
    path = setting['path']
    mark = setting['md'].format(path=path)
    hide = (name[0]=='@')
    if not '{name}.md'.format(name=name) in listdir(mark):
        if rmv is False:
            vi = "# {name}\n## *{time}*\n\n".format(name=name, time=ctime())
            open('{mark}/{name}.md'.format(mark=mark, name=name), 'w').write(strcode(vi))
    elif rmv != False: rmvx(name, mark, path, (rmv and strcode(rmv)), hide)
    if rmv != False: exit('[x] 未找到该文章.')

    editor(name, mark, path, hide)

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
    if not (options.delete or options.rename): main(strcode(args[0]))
    else: main(strcode(args[0]), options.rename)
