"use strict";

var $ = {
    init: function(d, w){
        w.HTMLElement.prototype.on = function(name, foo){
            if(this.addEventListener){
                this.addEventListener(name, foo, false);
            }else{
                this.attachEvent(`on${name}`, foo);
            };
            return this;
        };
        w.HTMLElement.prototype.add = function(){
            for(var e of Array.prototype.slice.call(arguments))this.appendChild(e);
            return this;
        };
        w.HTMLElement.prototype.append = function(html, p){
            //XXX use es6 Default parameters
            this.insertAdjacentHTML(p||'beforeend', html);
            return this;
        };
        w.HTMLElement.prototype.del = function(e){
            var e = e||this;
            var p = e.parentNode;
            p.removeChild(e);
            return p;
        };
        w.HTMLElement.prototype.attr = function(attr){
            for(var a in attr)this.setAttribute(a, attr[a]);
            return this;
        };
        w.HTMLElement.prototype.hide = function(){
            if(!this.hidden)this.hidden = true;
            return this;
        };
        w.HTMLElement.prototype.show = function(){
            if(this.hidden)this.hidden = false;
            return this;
        };
        w.HTMLElement.prototype.content = function(text){
            if(!!text)this.textContent = text;
            return this;
        };
    },

    http: function(url){
        return {
            urlen: function(mp, h){
                var uri = '';
                var u = $.dom('<a>').attr({"href":url||document.location.origin});
                var vp = $.http(u.href).urlde();
                for(var k in mp){
                    vp[k] = mp[k];
                };
                for(var q in vp){
                    if(!q)continue;
                    uri += (!!vp[q])?`${window.encodeURIComponent(q)}=${window.encodeURIComponent(vp[q])}&`:`${window.encodeURIComponent(q)}&`;
                };
                u.search = `?${uri.slice(0, -1)}`;
                if(!!h)u.hash = h;
                return (!!url)?u.href:u.search.slice(1);
            },
            urlde: function(s){
                var mp = {};
                for(var kv of (s||$.dom('<a>').attr({"href":url||document.location.href}).search.slice(1)).split('&')){
                    // [] = []
                    var k = kv.split('=')[0],
                        v = kv.split('=')[1];
                    mp[k] = v||"";
                };
                return mp;
            },
            fetch: function(args){
                if(!args)args = {};
                if((args.body != undefined)&&!args.realbody)args.body = $.http().urlen(args.body);
                if(!!args.query)url = $.http(url).urlen(args.query);
                return fetch(url, args);
            },
            get: function(args){
                if(!args)args = {};
                args['method'] = 'GET';
                return this.fetch(args);
            },
            post: function(args){
                if(!args)args = {};
                if(!args.headers)args['headers'] = {};
                if(!(args.headers['Content-Type']||args.headers['content-type']||args.realbody))args.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                args['method'] = 'POST';
                return this.fetch(args);
            }
        };
    },
    dom: function(){
        var doms = [];
        for(var a of Array.prototype.slice.call(arguments)){
            doms.push((~a.indexOf('<')&&a.slice(-1)=='>')?document.createElement(a.slice(1, -1)):document.querySelector(a));
        };
        return (arguments.length>1)?doms:doms.pop();
    },
    query: function(selector){
        //XXX use es6 Arrow function
        return document.querySelectorAll(selector);
    }
};

$.init(document, window);
