var load = {
    'init': function(){
        var page = window.decodeURIComponent(document.location.search.substring(1));
        this.pages = function(){
            var config = JSON.parse(window.sessionStorage.getItem('config'));
            var csslinks = $.doms('link');
            if(csslinks.length){
                csslinks.forEach(function(e){
                    e.del();
                });
            };
            config.style.forEach(function(link){
                $.dom('head').add(
                    $.dom('<link>', {
                        "rel":"stylesheet",
                        "type":"text/css",
                        "href":link
                    })
                );
            });
            $.dom('#name').content(window.decodeURIComponent(config.name));
            config.links.forEach(function(links){
                $.dom('#it').add($.dom('<p>'));
                links.forEach(function(link){
                    $.dom('#it p:last-child').add(
                        $.dom('<a>', link).content(link.name).on('click', function(e){
                            if(this.attributes['data-href']){
                                e.preventDefault();
                                load.mark(this.attributes['data-href'].value);
                            };
                        })
                    ).app(' - ', 'beforeend');
                });
            });
            $.http('./blog.json').get().then(function(res){
                res.json.reverse().forEach(function(page){
                    $.dom('#list').add(
                        $.dom('<li>').add(
                            $.dom('<a>', {
                                'data-href':page,
                                'href':`?${page}`
                            }).content(page).on('click', function(e){
                                e.preventDefault();
                                load.mark(this.attributes['data-href'].value);
                            })
                        )
                    );
                });
            }, console.error).catch(console.error);
            if(page){
                load.mark(page);
            }else{
                load.home();
            };
        };
        if(!window.sessionStorage.getItem('config')){
            $.http('./config.json').get().then(function(res){
                window.sessionStorage.setItem('config', res.text)
            }, console.error)
            .then(this.pages, console.error)
            .catch(console.error);
        }else{
            this.pages();
        };

        window.onpopstate = function(event){
            var page = window.decodeURIComponent(document.location.search.substring(1));
            if(page){
                load.mark(page);
            }else{
                load.home();
            };
        };
    },
    'home': function(){
        var title = JSON.parse(window.sessionStorage.getItem('config')).name;
        $.dom('head > title').content(title);
        for(var e of ['body > header', '#list', '#it']){
            $.dom(e).show();
        };
        for(var e of ['#disqus_thread', "#main"]){
            var d = $.dom(e);
            //XXX ues es6 let
            if(d){
                d.del().add($.dom('<div>', {'id':e.substring(1)}).hide());
            };
        };
    },
    'mark': function(page){
        $.dom('head > title').content(page);
        window.history.pushState({}, '', `?${page}`);
        for(var e of ['#main', '#disqus_thread']){
            $.dom(e).show();
        };
        for(var e of ['body > header', '#list', '#it']){
            $.dom(e).hide();
        };
        $.http(`./mark/${page}.md`).get().then(function(res){
            $.dom('#main').inner(marked(res.text));
            $.dom('#main > h1').on('mouseover', function(){
                this.style.color = '#2484c1';
            }).on('mouseout', function(){
                this.style.color = null;
            }).on('click', function(){
                window.history.pushState({}, '', '/');
                load.home();
            });
            load.disqus();
        }, function(err){
            console.error(err);
            $.dom('#main').inner(marked("# ( ・_・)"));
        }).catch(console.error);
    },
    'disqus': function(){
        var disqus_shortname = JSON.parse(window.sessionStorage.getItem('config')).disqus;
        (function() {{
            var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
            dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
        }})();
    }
};

new load.init();
