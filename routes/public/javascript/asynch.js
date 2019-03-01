var AJAX = (function () {

    /* How to use this:
        - In the browser javascript page:
         - put a string in for the url variable
         - put the parameters to pass to the server in obj variable
         - put callback function in for success parameter, data is param for function
         - put error function in for error parameter, pass xhr, text, and error params in for function

    * */
    var get = function(url, obj, success, error) {
        $.ajax({
            method: 'GET',
            url: url,
            contentType: 'application/json',
            data: obj,
            success: success,
            error: error
        });
    };

    var post = function(url, obj, success, error) {
        $.ajax({
            method: 'POST',
            url: url,
            contentType: 'application/json',
            data: JSON.stringify(obj),
            success: success,
            error: error
        });
    };

    return {
        get: get,
        post: post
    }

}());