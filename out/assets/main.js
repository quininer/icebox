var load = {
    '_link':function(e){
        if(this.attributes['data-href']){
            e.preventDefault();
            load.mark(this.attributes['data-href'].value);
        };
    },

    'init': function(){
        var page = window.decodeURIComponent(document.location.search.slice(1));
        this.pages = function(){
            var config = JSON.parse(window.sessionStorage.getItem('config'));
            Array.prototype.forEach.call($.query('link'), function(e){
                e.del();
            });
            $.dom('.name').on('mouseover', function(){
                this.style.color = '#2484c1';
            }).on('mouseout', function(){
                this.style.color = null;
            }).on('click', function(){
                window.history.pushState({}, '', '/');
                load.home();
            });
            config.style.forEach(function(link){
                $.dom('head').add(
                    $.dom('<link>', {
                        "rel":"stylesheet",
                        "type":"text/css",
                        "href":link
                    })
                );
            });
            config.script.forEach(function(link){
                $.dom('head').add(
                    $.dom('<script>', {
                        "type":"text/javascript",
                        "src":link
                    })
                );
            });
            config.links.forEach(function(links){
                $.dom('.it').add($.dom('<p>'));
                links.forEach(function(link){
                    $.dom('.it p:last-child').add(
                        $.dom('<a>', link).content(link.name).on('click', load._link)
                    ).app(' - ', 'beforeend');
                });
            });
            $.http('./blog.json').get().then(function(res){
                if(res.ok){
                    return res.json();
                }else{
                    console.error(`${res.statusText} ${res.status}: ${res.url}`);
                };
            }, function(err){
                console.error(err);
            }).then(function(json){
                json.reverse().forEach(function(page){
                    $.dom('#list').add(
                        $.dom('<li>').add(
                            $.dom('<a>', {
                                'data-href':page,
                                'href':`?${page}`
                            }).content(page).on('click', load._link)
                        )
                    );
                });
            }).catch(function(err){
                console.error(err);
            });
            if(page){
                load.mark(page, false);
            }else{
                load.home();
            };
        };

        if(!window.sessionStorage.getItem('config')){
            $.http('./config.json').get().then(function(res){
                if(res.ok){
                    return res.text();
                }else{
                    console.error(`${res.statusText} ${res.status}: ${res.url}`);
                };
            }, function(err){
            }).then(function(text){
                window.sessionStorage.setItem('config', text);
            }).then(this.pages).catch(function(err){
                console.error(err);
            });
        }else{
            this.pages();
        };

        window.onpopstate = function(event){
            var page = window.decodeURIComponent(document.location.search.slice(1));
            if(page){
                load.mark(page, false);
            }else{
                load.home();
            };
        };
    },
    'home': function(){
        var title = JSON.parse(window.sessionStorage.getItem('config')).name;
        $.dom('head > title').content(title);
        $.dom('.title').content(title);
        for(var e of ['#list', '.it', '.title']){
            //XXX es6 let
            $.dom(e).show();
        };
        for(var e of ['.name', '.subhead']){
            $.dom(e).hide();
        };
        for(var e of ['#disqus_thread', "#main"]){
            var d = $.dom(e);
            if(d)d.del().add($.dom((e=='#main')?'<article>':'<div>', {'id':e.slice(1)}).hide());
        };
    },
    'mark': function(page, push){
        //XXX  es6 Default
        $.dom('head > title').content(page);
        if(push===undefined||!!push)window.history.pushState({}, '', `?${page}`);
        for(var e of ['#main', '#disqus_thread', '.name', '.subhead']){
            $.dom(e).show();
        };
        for(var e of ['#list', '.it', '.title']){
            $.dom(e).hide();
        };
        $.http(`./mark/${page}.md`).get().then(function(res){
                if(res.ok){
                    return res.text();
                }else{
                    console.error(`${res.statusText} ${res.status}: ${res.url}`);
                };
        }).then(function(text){
            $.dom('#main').inner(marked(text));
            if(!!($.dom('#main > h1')&&$.dom('#main > h2'))){
                $.dom('.name').content($.dom('#main > h1').textContent);
                $.dom('.subhead').content($.dom('#main > h2').textContent);
                $.dom('#main > h1').del();
                $.dom('#main > h2').del();
            }else{
                $.dom('.name').hide();
                $.dom('.subhead').hide();
            };
            load.disqus();
        }, function(err){
            console.error(err);
            $.dom('#main').inner(marked("# ( ・_・)"));
        }).catch(function(err){
            console.error(err);
        });
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
