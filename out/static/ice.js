$ = {
    init: function(d, w){
        w.HTMLElement.prototype.on = function(name, foo){
            (this.addEventListener)?(
                this.addEventListener(name, foo, false)):(
                    this.attachEvent(`on${name}`, foo));
            return this;
        };
        w.HTMLElement.prototype.add = function(){
            for(var e of Array.prototype.slice.call(arguments))this.appendChild(e);
            return this;
        };
        w.HTMLElement.prototype.app = function(html, p){
            //XXX use es6 Default parameters
            if(!p)p = 'afterend';
            this.insertAdjacentHTML(p, html);
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
        w.HTMLElement.prototype.inner = function(html){
            this.innerHTML = html;
            return this;
        };
        w.HTMLElement.prototype.content = function(text){
            this.textContent = text;
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
                    uri += `${window.encodeURIComponent(q)}=${window.encodeURIComponent(escape(vp[q]))}&`;
                };
                u.search = `?${uri.slice(0, -1)}`;
                if(!!h)u.hash = h;
                return (!!url)?u.href:u.search.slice(1);
            },
            urlde: function(s){
                var mp = {};
                for(var kv of (s||$.dom('<a>').attr({"href":url||document.location.href}).search.slice(1)).split('&')){
                    // let and [] = []
                    var k = kv.split('=')[0],
                        v = kv.split('=')[1];
                    mp[k] = v||"";
                };
                return mp;
            },
            ajax: function(method, args){
                /*
                 *  ajax
                 *      url, query, body, headers, realbody, async
                 * */
                return new Promise(function(resolve, reject){
                    //XXX use fatch API
                    var xhr = new XMLHttpRequest();

                    if(args.query != undefined)args.query = $.http().urlen(args.query);
                    if((args.body != undefined)&&!args.realbody)args.body = $.http().urlen(args.body);
                    if(!~args.url.indexOf('?')&&!!args.query){
                        args.url = `${args.url}?${args.query}`;
                    };
                    xhr.open(method, args.url, (args.async===undefined||!!args.async));
                    if((args.headers != undefined)){
                        for(var header in args.headers){
                            xhr.setRequestHeader(header, args.headers[header]);
                        }
                    };
                    xhr.onreadystatechange = function(){
                        if(this.readyState == 4){
                            if(this.status===200||this.status===0){// 0 when files are loaded locally (e.g., cordova/phonegap app.)
                                this.text = this.responseText;
                                this.json = function(){
                                    //XXX Arrow function
                                    return JSON.parse(this.text);
                                };
                                resolve(this);
                            }else{
                                this.text = this.responseText;
                                this.json = function(){
                                    //XXX Arrow function
                                    return JSON.parse(this.text);
                                };
                                reject({
                                    'error':this.statusText,
                                    'xhr':this
                                });
                            };
                        };
                    };
                    xhr.send(args.body);
                });
            },
            get: function(args){
                if(!args)args = {};
                //XXX use es6 Default parameters
                if(!args.url)args.url = url;
                return this.ajax('GET', args);
            },
            post: function(args){
                if(!args)args = {};
                if(!args.url)args.url = url;
                if(!args.headers)args.headers = {};
                if(!args.headers['Content-type'])args.headers['Content-type'] = "application/x-www-form-urlencoded";
                return this.ajax('POST', args);
            }
        };
    },
    dom: function(setr, attr){
        //XXX use es6 Arrow function
        return (~setr.indexOf('<')&&setr.slice(-1)=='>')?document.createElement(setr.slice(1, -1)).attr(attr):document.querySelector(setr);
    },
    query: function(selector){
        return document.querySelectorAll(selector);
    }
};

$.init(document, window);
