var ADDPERSON = (function () {

    var letters = /^[a-zA-Z]+$/;

    var letternum = /^[a-zA-Z0-9]+$/;

    var numeric = /^[0-9]+$/;

    var minimumPasswordLen = 8;


    var submit = function() {
        var error = $('#signup_error_message');
        error.hide();
        error.text('');
        var firstname = $('#input_signup_firstname').val();
        var lastname = $('#input_signup_lastname').val();
        var age = $('#input_signup_age').val();
        var username = $('#input_signup_username').val();
        var password = $('#input_signup_password').val();
        var redopassword = $('#input_signup_reenterpassword').val();

        if (validation(firstname, lastname, age, username, password, redopassword)) {
            // Post to the Account table
            var obj = {
                firstName: firstname,
                lastName: lastname,
                age: age,
                username: username,
                password: password,
                redoPassword: redopassword
            };
            AJAX.post('/create/create',
                obj,
                function (data) {
                    data = JSON.parse(data);
                    if (data.error) {
                        error.text(data.error);
                        error.show();
                    } else {
                        if (data.success) {
                            window.location.href = '/login';
                        } else {
                            error.text('False to create user.');
                            error.show();
                        }
                    }
                }, function (xhr, text, error) {
                    console.log(xhr);
                    console.log(text);
                    console.log(error);
                    error.show();
                    error.text('Server Error: Try Again Later.');
                });

        } else {
            error.show();
            error.text('Invalid Fields! Your password must at least have one capital, one lowercase, one number, one special character and must have a length of 8');
        }

    };
    var validation = function(firstname, lastname, age, username, password, redopassword) {
        if ((firstname == null) || (lastname == null || username == null) || (password == null || redopassword == null) || age == null) {
            // validation unsuccessful
            return false;
        }
        if (password.length < minimumPasswordLen || password != redopassword) {
            // password length not long enough or passwords don't match
            return false
        }
        if ((firstname == '') || (lastname == '' || username == '') || (age == '' )) {
            // validation unsuccessful
            return false;
        }
        // List of special character (at least one should be included in the password)
        var specArr = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '=', '+', '{', '[', '}', ']', ';', ':',
            '~', '<', '`', '.', '/', '?', ',', '>', '\'', '\"', '\\', '|'];
        var includesSpec = false;
        for(var i = 0; i < specArr.length;i++){
            if(password.includes(specArr[i])){
                includesSpec = true;
                password.replaceAll(specArr[i], '');
            }
        }
    };

    return {
        submit : submit
    };
}());
