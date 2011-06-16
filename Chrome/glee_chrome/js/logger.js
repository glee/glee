GLEE_DEBUG = true;

var log = function(msg, obj) {
    if (GLEE_DEBUG) {
        if (obj !== undefined)
            console.log('gleeBox: ' + msg + ': %o', obj);
        else
            console.log('gleeBox: ' + msg);
    }
};
