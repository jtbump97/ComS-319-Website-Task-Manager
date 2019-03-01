var LOGIN = (function () {

    var regex = /^[a-zA-Z0-9]+$/;

    var createAccount = function() {
        window.location.href = '/create';
    };

    var submit = function() {

        $('#login_error_message').hide();
        $('#login_error_message').text('');
        var username = $('#input_login_username').val();
        var password = $('#input_login_password').val();
        loading(true);

        if (validation(username, password)) {
            AJAX.post('/login/validation',
                {username: username, password: password},
                function(data) {
                    data = JSON.parse(data);
                    if (data.verified) {
                        window.location.href = '/dashboard';
                    } else {
                        $('#login_error_message').show();
                        $('#login_error_message').text('Credentials Invalid!');
                        loading(false);
                    }
                }, function(xhr, text, error) {
                    console.log(xhr);
                    console.log(text);
                    console.log(error);
                    $('#login_error_message').show();
                    $('#login_error_message').text('Server Error: Try Again Later.');
                    loading(false);
                });
        } else {
            $('#login_error_message').show();
            $('#login_error_message').text('Credentials Contain invalid characters!');
            loading(false);
        }

    };

    var validation = function(username, password) {
        if (username == null || password == null) {
            // Throw validation issue.
            return false;
        }
        return regex.test(username);
    };

    var loading = function(isLoading) {
        $('#input_login_password').val('');
        $('#input_login_username').val('');
        if (isLoading) {
            $('#section_login').hide();
            $('#section_form_processing').show();
        } else if (!isLoading) {
            $('#section_login').show();
            $('#section_form_processing').hide();
        }
    };

    return {
        submit : submit,
        createAccount : createAccount
    }
}());

history.pushState(null, null, location.href);
window.onpopstate = function () {
    history.go(1);
};