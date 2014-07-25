gum = function(){
    var u = {
        'version':'1140613[精简]',
    };

    u.id = function(id){
        return document.getElementById(id);
    };

    u.bind = function(e, name, foo){
        (e.addEventListener)?(
            e.addEventListener(name, foo, false)):(
            e.attachEvent('on'+name, foo))
    }

    u.ajax = function(url, datas, headers, callback){
        var xhr;
        var type = datas?('POST'):('GET');
        (window.XMLHttpRequest)?(
            xhr = new window.XMLHttpRequest()):(
            xhr = new ActiveXObject('Microsoft.XMLHTTP'));
        xhr.open(type, url, false);
        (type=='POST')&&(
            xhr.setRequestHeader('content-type',
                                 'application/x-www-form-urlencoded'));
        if(headers){
            for(var header in headers){
                xhr.setRequestHeader(header, headers[header]);
            };
        };
        callback&&(xhr.onreadystatechange = function(){
            (this.readyState == 4 && (
                (this.status >= 200 && this.status <= 300)
                    || this.status == 304)
            )&&callback.apply(this, arguments);
        });
        xhr.send(datas);
        return xhr;
    };

    return u;
}();
