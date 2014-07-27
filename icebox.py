#!/usr/bin/env python
# encoding: utf-8

from __future__ import unicode_literals
from sys import version_info, path as spath
(str, v) = (version_info < (3,0,0) and (unicode, True) or (str, False))

from os import listdir, system, remove, rename
from subprocess import Popen as popen
from re import compile as rcompile
from optparse import OptionParser
from markdown import markdown
from json import loads, dumps
from time import ctime

setting = loads(open((spath[0] or '.')+'/setting.json').read())
_style = "<link rel='stylesheet' href='{style}' type='text/css'>\n"

def osexec(name, path, ends):
    for ext in setting['extend']:
        system(setting['shell'].format(name=name, path=path,
            extend=ext.decode('utf8')).encode('utf8'))
    exit('[!] {end}完成!'.format(end=ends))

def additem(name, link, path, hide):
    item = loads(open(path+'/item.json').read())
    if not (name in [item[i][0] for i in item] and hide):
        item[str(int(max(item))+1)] = [name, '.' + link]
        open(path+'/item.json', 'w').write(dumps(item))

    osexec(name, path, '')

def markout(name, md_path, path, hide):
    (styles, strikethrough) = ('', rcompile(r'~~(.+?)~~'))
    mhtml = strikethrough.sub((lambda x:'<del>'+x.group(1)+'</del>'),
            markdown(open(md_path+'/'+name+'.md').read().decode('utf8')))
    for css in setting['style']: styles += _style.format(style=css)

    html = open(setting['tpl'].format(path=path)).read().decode('utf8')
    html = html.format(title=name, style=styles, mark=mhtml)
    link = setting['html'].format(path='') + '/' + name + '.html'
    open(path+link, 'w').write(html.encode('utf8'))

    additem(name, link, path, hide)

def editor(name, md_path, path, hide):
    command = (setting['editor'], md_path+'/'+name+'.md')
    try: popen(command).wait()#FIXME    使用Gvim的话，会不等待，往下执行。
    except Exception: system(' '.join(command))
    markout(name, md_path, path, hide)

def rmvx(name, md_path, path, new, hide):
    items = loads(open(path+'/item.json').read())
    if not hide: item = [i for i in items if items[i][0] == name][0]
    if not new:
        if not hide: del items[item]
        remove(md_path+'/'+name+'.md')
        remove(setting['html'].format(path=path)+'/'+name+'.html')
    else:
        if not hide: (items[item][0], items[item][1]) = (new, './h/'+new+'.html')
        rename(md_path+'/'+name+'.md', md_path+'/'+new+'.md')
        rename(setting['html'].format(path=path)+'/'+name+'.html',
                setting['html'].format(path=path)+'/'+new+'.html')

    if not hide: open(path+'/item.json', 'w').write(dumps(items).encode('utf8'))
    osexec(name, path, ('重名' if new else '删除'))

def main(name, rmv=False):
    path = setting['path']
    md_path = setting['md'].format(path=path)
    if not (name+'.md') in listdir(md_path):
        if rmv is False:
            vi = "# {name}\n## *{time}*\n\n".format(name=name, time=ctime())
            open(md_path+'/'+name+'.md', 'w').write(vi.encode('utf8'))
    elif rmv != False: rmvx(name, md_path, path, (rmv and rmv.decode('utf8')), (name[0]=='@'))
    if rmv != False: exit('[x] 未找到该文章.')

    editor(name, md_path, path, (name[0]=='@'))

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
