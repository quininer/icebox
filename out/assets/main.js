"use strict";

var load = {
    '_link': function(e){
        if(this.attributes['data-href']){
            e.preventDefault();
            load.mark(this.attributes['data-href'].value);
        };
    },

    '_page': function(){
        var page = window.decodeURIComponent(document.location.search.slice(1));
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
                $.dom('<link>').attr({
                    "rel":"stylesheet",
                    "type":"text/css",
                    "href":link
                })
            );
        });
        config.script.forEach(function(link){
            $.dom('head').add(
                $.dom('<script>').attr({
                    "type":"text/javascript",
                    "src":link
                })
            );
        });
        config.links.forEach(function(links){
            $.dom('.it').add($.dom('<p>'));
            links.forEach(function(link){
                $.dom('.it p:last-child').add(
                    $.dom('<a>').attr(link).content(link.name).on('click', load._link)
                ).append(' - ');
            });
        });
        $.http('./blog.json').get().then(function(res){
            if(res.ok){
                return res.json();
            }else{
                throw(`${res.statusText} ${res.status}: ${res.url}`);
            };
        }, function(err){
            console.error(err);
        }).then(function(json){
            json.reverse().forEach(function(page){
                $.dom('#list').add(
                    $.dom('<li>').add(
                        $.dom('<a>').attr({
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
    },

    'init': function(){
        if(!window.sessionStorage.getItem('config')){
            $.http('./config.json').get().then(function(res){
                if(res.ok){
                    return res.text();
                }else{
                    throw(`${res.statusText} ${res.status}: ${res.url}`);
                };
            }, function(err){
                console.error(err);
            }).then(function(text){
                text && window.sessionStorage.setItem('config', text);
            }, function(err){
                console.error(err);
            }).then(load._page).catch(function(err){
                console.error(err);
            });
        }else{
            load._page();
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
        $.dom('head > title', '.title').forEach(function(e){
            e.content(title);
        });
        $.dom('#list', '.it', '.title').forEach(function(e){
            e.show();
        });
        $.dom('.name', '.subhead', '#disqus_thread', '#main').forEach(function(e){
            e.hide();
        });
    },
    'mark': function(page, push){
        //XXX  es6 Default
        $.dom('head > title').content(page);
        if(push===undefined||!!push)window.history.pushState({}, '', `?${page}`);
        $.dom('#disqus_thread', '#main').forEach(function(e){
            if(e)e.del().add($.dom(`<${e.tagName}>`).attr({'id':e.id}));
        });
        $.dom('#main', '#disqus_thread', '.name', '.subhead').forEach(function(e){
            e.show();
        });
        $.dom('#list', '.it', '.title').forEach(function(e){
            e.hide();
        });
        $.dom('.name').content('just a moment.');
        $.dom('.subhead').content('loading...');
        $.http(`./mark/${page}.md`).get().then(function(res){
            if(res.ok){
                return res.text();
            }else{
                throw(`${res.statusText} ${res.status}: ${res.url}`);
            };
        }).then(function(text){
            $.dom('#main').append(marked(text));
            if(!!($.dom('#main > h1')&&$.dom('#main > h2'))){
                $.dom('.name').content($.dom('#main > h1').textContent);
                $.dom('.subhead').content($.dom('#main > h2').textContent);
                $.dom('#main > h1', '#main > h2').forEach(function(e){
                    e.del();
                });
            }else{
                $.dom('.name', '.subhead').forEach(function(e){
                    e.hide();
                });
            };
            load.disqus();
        }, function(err){
            console.error(err);
            $.dom('.name').content('( ・_・)');
            $.dom('.subhead').hide();
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
