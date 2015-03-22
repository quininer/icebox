$ = {
    init: function(d, w){
        w.HTMLElement.prototype.on = function(name, foo){
            (this.addEventListener)?(
                this.addEventListener(name, foo, false)):(
                    this.attachEvent(`on${name}`, foo));
            return this;
        };
        w.HTMLElement.prototype.add = function(e){
            this.appendChild(e);
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
        w.HTMLElement.prototype.inner = function(html){
            this.innerHTML = html;
            return this;
        };
        w.HTMLElement.prototype.show = function(html){
            if(this.style.display == 'none')this.style.display = 'block';
            return this;
        };
        w.HTMLElement.prototype.content = function(text){
            this.innerText = text;
            return this;
        };
    },

    http: function(url){
        var ajax = function(method, args){
            /*
             *  ajax
             *      url, query, body, headers, realbody, async
             * */
            return new Promise(function(resolve, reject){
                var xhr = new XMLHttpRequest();
                var query = '',
                    body = '';
                //XXX
                if((args.query != undefined)){
                    for(var q in args.query){
                        query += `${encodeURIComponent(q)}=${encodeURIComponent(escape(args.query[q]))}&`;
                    };
                };
                if((args.body != undefined)&&!args.realbody){
                    for(var q in args.body){
                        body += `${encodeURIComponent(q)}=${encodeURIComponent(escape(args.body[q]))}&`;
                    };
                }else{
                    body = args.body;
                };

                if(!~args.url.indexOf('?')&&query){
                    args.url = `${args.url}?${query.slice(0, -1)}`;
                };
                xhr.open(method, args.url, (args.async === false)?false:true);
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
                        }
                    };
                };
                xhr.send(body);
            });
        }

        return {
            ajax: ajax,
            get: function(args){
                if(!args)args = {};
                //XXX use es6 Default parameters
                if(!args.url)args.url = url;
                return ajax('GET', args);
            },
            post: function(args){
                if(!args)args = {};
                //XXX use es6 Default parameters
                if(!args.url)args.url = url;
                if(!args.headers||!args.headers['Content-type']){
                    args.headers['Content-type'] = "application/x-www-form-urlencoded";
                };
                return ajax('POST', args);
            }
        }
    },
    dom: function(setr, attr){
        if(!!~setr.indexOf('<')){
            var e = document.createElement(setr.slice(1, -1));
            return e.attr(attr);
        }else{
            return document.querySelector(setr);
        };
    },
    doms: function(selector){
        return document.querySelectorAll(selector);
    }
};

$.init(document, window);
