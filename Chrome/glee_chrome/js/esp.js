/* Intelligent ESP related code */

Glee.ESP = {
    find: function(){
        var headers = jQuery('h1,h2,h3,h4,div');
        var len = headers.length;
        var classNames = [];
        var classes = [];
        for(var i=0; i<len; i++)
        {
            var aClass = headers[i].className.split(" ")[0].trim();
            if(aClass == "")
            {
                var parent = jQuery(headers[i]).parent();
                var child = jQuery(headers[i]).next();
                if(parent.length != 0)
                    aClass = parent[0].className.trim();
                else if(child.length != 0)
                    aClass = child[0].className.trim();
            }
            if(aClass != "")
            {
                var index = jQuery.inArray(aClass, classNames);

                if(index == -1)
                {
                    classNames[classNames.length] = aClass;
                    classes[classes.length] = {count:1, name:aClass};
                }
                else
                    classes[index].count++;
            }
        }
        classes = classes.sort(function(a,b){
            return b.count - a.count;
        });
        if(classes[0].name != "")
            return "."+classes[0].name;
        else
            return null;
    }
}