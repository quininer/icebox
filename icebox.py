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
from hashlib import md5
from time import ctime

setting = loads(open((spath[0] or '.')+'/setting.json').read())
def strcode(string):
    if version: return isinstance(string, unicode) and string.encode('utf8') or string.decode('utf8')
    else: return string

class icebox(object):
    def __init__(self, name, setting):
        self.name = name
        self.path = setting['path']
        self.mark = setting['md'].format(path=self.path)
        self.markfile = '{mark}/{name}.md'.format(mark=self.mark, name=self.name)
        self.blogfile = '{path}/blog.json'.format(path=self.path)
        (self.hide, self.editor, self.extend, self.shell) = (
            (self.name[0] == '@'), setting['editor'], setting['extend'], setting['shell'])

    def osexec(self, ends):
        for ext in self.extend:
            system(strcode(self.shell.format(
                name=self.name, path=self.path, ext=strcode(ext), mark=self.mark
            )))
        else: exit('[!] {end}完成!'.format(end=ends))

    def additem(self):
        item = loads(open(self.blogfile, 'r').read())
        if self.name in item: item.pop(item.index(self.name))
        item.append(self.name)
        open(self.blogfile, 'w').write(dumps(item))

    def edit(self):
        checkhash = (lambda x: md5(open(x, 'rb').read()).hexdigest())
        MD5 = checkhash(self.markfile)

        command = (self.editor, self.markfile)
        try: popen(command).wait()#FIXME    使用Gvim的话，会不等待，往下执行。
        except Exception: system(' '.join(command))

        return True if MD5 == checkhash(self.markfile) else False

    def rmvx(self, newname):
        item = loads(open(self.blogfile, 'r').read())
        if not newname:
            if not self.hide: del item[item.index(self.name)]
            remove(self.markfile)
        else:
            if not self.hide: item[item.index(self.name)] = newname
            rename(self.markfile, '{mark}/{name}.md'.format(mark=self.mark, name=newname))

        if not self.hide: open(self.blogfile, 'w').write(strcode(dumps(item)))
        self.osexec(('重名' if newname else '删除'))

def main(name, rmv=False):
    ed = icebox(name, setting)
    if not '{name}.md'.format(name=ed.name) in listdir(ed.mark):
        if rmv is False:
            vi = "# {name}\n## *{time}*\n\n".format(name=name, time=ctime())
            open(ed.markfile, 'w').write(strcode(vi))
    elif rmv != False: ed.rmvx(rmv and strcode(rmv))
    if rmv != False: exit('[x] 未找到该文章.')

    if not (ed.edit() or ed.hide): ed.additem()
    ed.osexec('')

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
