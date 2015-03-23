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
            if(this.style.display != 'none')this.style.display = 'none';
            return this;
        };
        w.HTMLElement.prototype.show = function(html){
            if(this.style.display == 'none')this.style.display = 'block';
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
            ajax: function(method, args){
                /*
                 *  ajax
                 *      url, query, body, headers, realbody, async
                 * */
                return new Promise(function(resolve, reject){
                    //XXX use fatch API
                    var xhr = new XMLHttpRequest();
                    var query = '',
                        body = '';
                    //XXX
                    if((args.query != undefined)){
                        for(var q in args.query){
                            query += `${encodeURIComponent(q)}=${encodeURIComponent(escape(args.query[q]))}&`;
                        };
                        query = query.slice(0, -1);
                    };
                    if((args.body != undefined)&&!args.realbody){
                        for(var q in args.body){
                            body += `${encodeURIComponent(q)}=${encodeURIComponent(escape(args.body[q]))}&`;
                        };
                        body = body.slice(0, -1);
                    }else{
                        body = args.body;
                    };

                    if(!~args.url.indexOf('?')&&!!query){
                        args.url = `${args.url}?${query}`;
                    };
                    xhr.open(method, args.url, (args.async===undefined||!!args.async)||false);
                    if((args.headers != undefined)){
                        for(var header in args.headers){
                            xhr.setRequestHeader(header, args.headers[header]);
                        }
                    };
                    xhr.onreadystatechange = function(){
                        if(this.readyState == 4){
                            if(this.status == 200){
                                this.text = this.responseText;
                                try{
                                    this.json = JSON.parse(this.text);
                                }catch(e){};
                                resolve(this);
                            }else{
                                this.text = this.responseText;
                                try{
                                    this.json = JSON.parse(this.text);
                                }catch(e){};
                                reject({
                                    'error':this.statusText,
                                    'xhr':this
                                });
                            };
                        };
                    };
                    xhr.send(body);
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
                if(!args.headers||!args.headers['Content-type']){
                    args.headers['Content-type'] = "application/x-www-form-urlencoded";
                };
                return this.ajax('POST', args);
            }
        };
    },
    dom: function(setr, attr){
        //XXX use es6 Arrow function
        return (~setr.indexOf('<')&&setr.slice(-1)=='>')?document.createElement(setr.slice(1, -1)).attr(attr):document.querySelector(setr);
    },
    doms: function(selector){
        return document.querySelectorAll(selector);
    }
};

$.init(document, window);
