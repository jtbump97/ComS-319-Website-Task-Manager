var DASHBOARD = (function() {

    var searchStr = '';
    var dataTableInit = true;
    var module = '#module_view';
    var viewHtml;
    var listHtml;
    var dataTable;

    var init = function () {
        AJAX.get('/libraries/html/weekly_view.html',
            {},
            function (data) {
                viewHtml = data;
                $(module).html(viewHtml);
                loadTable(moment().toISOString());
                $('#input_weekly_date').val(moment().format('MM/DD/YYYY'));
            }, function (xhr, text, error) {
                viewHtml = '<div id="login_error_message" class="alert alert-danger" style="color: red;">Cannot load view.</div>';
            });
        AJAX.get('/libraries/html/list_view.html',
            {},
            function (data) {
                listHtml = data;
            }, function (xhr, text, error) {
                viewHtml = '<div id="login_error_message" class="alert alert-danger" style="color: red;">Cannot load search.</div>';
            });
        $('#modal_view_task').on('show.bs.modal', function (event) {
            var id = $(event.relatedTarget).data('id');
            if (id !== undefined && id !== 0) {
                populateTaskView(id);
                ADD_EDIT_TASK.populateDocumentForm(id, '#view_documents');
                $('#open_edit_modal').val(id);
                $('#delete_task').val(id);
            }
        });
        $('#modal_view_task').on('hide.bs.modal', function (event) {
            $('#view_task_title').val('');
            $('#view_task_desc').val('');
            $('#view_start_date').val('');
            $('#view_end_date').val('');
        });
    };

    var search = function() {
        searchStr = $('#input_search').val();
        if (searchStr === '')
            return;

        var url = '/dashboard/searchTask?searchStr=' + searchStr;
        if (dataTableInit) {
            $(module).html(listHtml);
            dataTable = $('#table').DataTable({
                "ajax": {"url":url, "dataSrc":""},
                "columns": [
                    {
                        'data':'TaskId',
                        'visible': false,
                        'searchable': false
                    },
                    { 'data':'TaskName'},
                    { 'data':'TaskDesc'},
                    {
                        'data': 'TaskStartTime',
                        'render': function (data, type, row) {
                            return moment(data)
                                .format('MM/DD/YYYY hh:mm A');
                        }
                    },
                    {
                        'data': 'TaskEndTime',
                        'render': function (data, type, row) {
                            return moment(data)
                                .format('MM/DD/YYYY hh:mm A');
                        }
                    },
                    {
                        'data': 'TaskPriority',
                        'render': function (data, type, row) {
                            if (data === 1) {
                                return 'Low';
                            } else if (data === 2) {
                                return 'Average';
                            } else if (data === 3) {
                                return 'High';
                            }
                        }
                    },
                    { 'data':'AccountName'},
                    {
                        'data': 'ActiveFlag',
                        'render': function (data, type, row) {
                            return data ? 'No': 'Yes';
                        }
                    }
                ]
            });
            $('#table tbody').on('click', 'tr', function () {
                var id = dataTable.row( this ).data().TaskId;
                clickedRowTable(id);
            });
            dataTableInit = false;
        } else {
            dataTable = $('#table').DataTable().ajax.url(url).load();
        }
        $('#view_header').text('Search View');
    };

    var listView = function() {
        var url = '/dashboard/listTask';
        if (dataTableInit) {
            $(module).html(listHtml);
            dataTable = $('#table').DataTable({
                "ajax": {"url":url, "dataSrc":""},
                "columns": [
                    {
                        'data':'TaskId',
                        'visible': false,
                        'searchable': false
                    },
                    { 'data':'TaskName'},
                    { 'data':'TaskDesc'},
                    {
                        'data': 'TaskStartTime',
                        'render': function (data, type, row) {
                            return moment(data)
                                .format('MM/DD/YYYY hh:mm A');
                        }
                    },
                    {
                        'data': 'TaskEndTime',
                        'render': function (data, type, row) {
                            return moment(data)
                                .format('MM/DD/YYYY hh:mm A');
                        }
                    },
                    {
                        'data': 'TaskPriority',
                        'render': function (data, type, row) {
                            if (data === 1) {
                                return 'Low';
                            } else if (data === 2) {
                                return 'Average';
                            } else if (data === 3) {
                                return 'High';
                            }
                        }
                    },
                    { 'data':'AccountName'},
                    {
                        'data': 'ActiveFlag',
                        'render': function (data, type, row) {
                            return data ? 'No': 'Yes';
                        }
                    }
                ]
            });
            $('#table tbody').on('click', 'tr', function () {
                var id = dataTable.row( this ).data().TaskId;
                clickedRowTable(id);
            });
            dataTableInit = false;
        } else {
            dataTable = $('#table').DataTable().ajax.url(url).load();
        }
        $('#view_header').text('List View');
    };

    var loadTable = function(date) {
        $(module).html(viewHtml);
        AJAX.get('/dashboard/loadTable',
            {dateQuery: date},
            function (data) {
                data = JSON.parse(data);
                var html = [{time: 0, html:''}, {time: 0, html:''}, {time: 0, html:''}, {time: 0, html:''}, {time: 0, html:''}, {time: 0, html:''}, {time: 0, html:''}];
                var task;
                for (var j = 0; j < data.length; j++) {
                    for (var i = 0; i < 7; i++) {
                        var dayStr = moment($('#input_weekly_date').val()).startOf('week').add(i, 'days')
                            .format('YYYY-MM-DD').toString();
                        if (dayStr === moment(data[j].TaskStartTime).format('YYYY-MM-DD').toString()) {
                            task = data[j];
                            var startOfDay = moment(task.TaskStartTime).startOf('day');
                            var startTime = moment(task.TaskStartTime);
                            var endTime = moment(task.TaskEndTime);
                            var startMinutes = startTime.diff(startOfDay, 'minutes');
                            var endMinutes = endTime.diff(startOfDay, 'minutes');
                            var alpha = 1;
                            var title = 'TODO';
                            var priority = {rgb: '', label: ''};
                            if (!task.ActiveFlag) {
                                alpha = 0.5;
                                title = 'Completed';
                            }
                            if (task.TaskPriority === 1) {
                                priority = {rgb: '0, 183, 255, ', label: 'Low'};
                            } // 0, 183, 255
                            else if (task.TaskPriority === 2) {
                                priority = {rgb: '34, 139, 34, ', label: 'Average'};
                            } // 0,255,0
                            else if (task.TaskPriority === 3) {
                                priority = {rgb: '255, 0, 0, ', label: 'High'};
                            } // 255,0,0
                            html[i].html += '<div style="border: 0px; height: ' + ((startMinutes - html[i].time)/1440*100) + '%;"></div>' +
                                            '<div style="cursor: pointer; background-color: rgba(' + priority.rgb + alpha + '); border-radius: 2px; text-align: center; height: ' +
                                            ((endMinutes - startMinutes)/1440*100) + '%; color: white;" data-id="' + task.TaskId + '" data-toggle="modal" data-target="#modal_view_task">' +
                                            '<div data-toggle="tooltip" data-placement="top" data-html="true" title="' + title + '<br>Priority: ' + priority.label + '" style="height: 100%;">' +
                                            task.TaskName + '</div></div>';
                            html[i].time = endMinutes;
                        }
                    }
                }
                for (var k = 0; k < html.length; k++) {

                    $('#day_' + k).html(html[k].html + '<div style="border: 0; height: ' + ((1440 - html[k].time)/1440*100) + '%;"></div>');
                }
                $('#weekly_date_input').datetimepicker({
                    format: 'L'
                });
                $('#previous_view').val('calendar');
                $(function () {
                    $('[data-toggle="tooltip"]').tooltip();
                });
            }, function (xhr, text, error) {
                dataTableInit = true;
                $(module).html(viewHtml);
            });
    };

    var changeWeekView = function(isForward) {
        var dateStr = $('#input_weekly_date').val();
        var date;
        if (isForward) {
            date = moment(dateStr).add(7, 'days');
        } else if (isForward === undefined){
            date = moment(dateStr);
        } else {
            date = moment(dateStr).subtract(7, 'days');
        }
        loadTable(date.toISOString());
        $('#input_weekly_date').val(moment(date).format('MM/DD/YYYY'));
    };


    var backToWeekly = function() {
        dataTableInit = true;
        $(module).html(viewHtml);
        loadTable(moment().toISOString());
        $('#input_weekly_date').val(moment().format('MM/DD/YYYY'));
    };

    var clickedRowTable = function(id) {
        $('#modal_view_task').modal('show');
        populateTaskView(id);
        ADD_EDIT_TASK.populateDocumentForm(id, '#view_documents');
        $('#open_edit_modal').val(id);
        $('#delete_task').val(id);
        $('#add_modal_header').text('Edit Task');
        var previousView = $('#view_header').text();
        if (previousView === 'List View') {
            $('#previous_view').val('list');
        } else if (previousView === 'Search View') {
            $('#previous_view').val('search');
        }
    };

    var populateTaskView = function(id) {
        $('#view_error_message').hide();
        $('#view_error_message').text('');
        var obj = {id: id};
        AJAX.get('/dashboard/getSingleTask', obj, function(data) {
            var data = JSON.parse(data);
            $('#view_task_id').data('id', data.TaskId);
            $('#view_task_title').text(data.TaskName);
            $('#view_task_desc').text(data.TaskDesc);
            $('#view_start_date').text(moment(data.TaskStartTime).format('MM/DD/YYYY hh:mm A'));
            $('#view_end_date').text(moment(data.TaskEndTime).format('MM/DD/YYYY hh:mm A'));
            if (data.TaskPriority === 3) {
                $('#view_priority').text('High');
            } else if (data.TaskPriority === 2) {
                $('#view_priority').text('Average');
            } else if (data.TaskPriority === 1) {
                $('#view_priority').text('Low');
            }
            $('#is_completed').attr('checked', !data.ActiveFlag);
        }, function(xhr, text, error) {
            $('#form_error_message').text('Could not get Task.');
            $('#form_error_message').show();
        });
    };

    var downloadDocument = function (documentId) {
        var request = new XMLHttpRequest();
        var url = '/downloadDocument?documentId=' + documentId;
        request.open("GET", url, true);
        request.responseType = "blob";
        request.onload = function (e) {
            if (this.status === 200) {
                // create `objectURL` of `this.response` : `.pdf` as `Blob`
                var file = window.URL.createObjectURL(this.response);
                var a = document.createElement("a");
                a.href = file;
                a.download = documentId + '.pdf';
                document.body.appendChild(a);
                a.click();
                // remove `a` following `Save As` dialog,
                // `window` regains `focus`
                window.onfocus = function () {
                    document.body.removeChild(a)
                }
            };
        };
        request.send();
    };

    var markCompleted = function() {
        $('#view_error_message').hide();
        $('#view_error_message').text('');
        var isComplete = !$('#is_completed').is(":checked");
        var taskId = $('#view_task_id').data('id');
        var dateSave = moment($('#input_weekly_date').val());
        AJAX.post('/dashboard/complete',
            {taskId: taskId, isComplete: isComplete},
            function (data) {
                data = JSON.parse(data);
                if (data.success) {
                    loadTable(dateSave.toISOString());
                    $('#input_weekly_date').val(dateSave.format('MM/DD/YYYY'));
                } else {
                    $('#view_error_message').text('Could not mark correctly.');
                    $('#view_error_message').show();
                }
            }, function (xhr, text, error) {
                $('#view_error_message').text('Could not connect properly.');
                $('#view_error_message').show();
            });
    };

    var logout = function() {
        AJAX.get('/dashboard/logout',
            {},
            function (data) {
                data = JSON.parse(data);
                if (data.done) {
                    window.location.href = '/login';
                }
            }, function (xhr, text, error) {
                console.log("LogOut Failed");
                //TODO Add message here.
            });
    };


    return {
        init: init,
        logout : logout,
        listView: listView,
        search : search,
        backToWeekly : backToWeekly,
        loadTable : loadTable,
        downloadDocument: downloadDocument,
        changeWeekView : changeWeekView,
        markCompleted: markCompleted
    };
}());

var ADD_EDIT_TASK = (function() {

    var formId = '#add_edit_form';

    var changeIsAdd = function(isAdd) {
        this.isAdd = isAdd;
    };

    var init = function() {
        $('.datetime').datetimepicker();
        $('#modal_add_edit_task').on('show.bs.modal', function(event) {
            var id = parseInt($('#open_edit_modal').val());
            if ($(event.relatedTarget).data('id') === 0) {
                id = 0;
            }
            if (id !== undefined) {
                if (id !== 0) {
                    ADD_EDIT_TASK.populateTaskForm(id);
                    $('#submit_button').val(id);
                    $('#add_modal_header').text('Edit Task');
                } else {
                    $('#submit_button').val(0);
                    $('#add_modal_header').text('Add Task');
                }
            }
        });
        $('#modal_add_edit_task').on('hide.bs.modal', function() {
            $('#input_task_title').val('');
            $('#input_task_desc').val('');
            $('.datetime').datetimepicker('clear');
        });
        $('#modal_upload_document').on('show.bs.modal', function() {
            var id = $('#submit_button').val();
            populateDocumentForm(id,'#document_names');

        });
        $('#modal_upload_document').on('hide.bs.modal', function() {
            $('#document_upload').val('');
            $('#upload_error_message').hide();
            $('#upload_error_message').text('');
        });
    };

    var submitButton = function() {
        if ($('#submit_button').val() === '0') {
            addTask();
        } else {
            editTask();
        }
    };

    var addTask = function() {
        $('#form_error_message').hide();
        $('#form_error_message').text('');
        if (validateForm() && validateDates()) {
            var obj = {};
            $(formId).each(function () {
                var inputs = $(this).find(':input');
                obj = getInputValues(inputs);
            });
            AJAX.post('/dashboard/addTask', obj, function(data) {
                data = JSON.parse(data);
                showUploadDocument(data);
                backToView(data);
            }, function (xhr, text, error) {
                $('#form_error_message').text('Looks like you have an error!');
                $('#form_error_message').show();
            })
        } else {
            $('#form_error_message').text('Looks like you have an error!');
            $('#form_error_message').show();
        }
    };

    var showEditModal = function() {
        $('#modal_view_task').modal('hide');
        $('#modal_add_edit_task').modal('show');
    };

    var showUploadDocument = function (data) {
        if (data.error) {
            $('#form_error_message').show();
            $('#form_error_message').text(data.error);
        } else {
            $('#modal_add_edit_task').modal('hide');
            $('#modal_upload_document').modal('show');
        }
    };

    var backToView = function(data) {
        if (data.error) {
            $('#form_error_message').show();
            $('#form_error_message').text(data.error);
        } else {
            var viewType = $('#previous_view').val();
            if (viewType === 'calendar') {
                DASHBOARD.loadTable(moment().toISOString());
                $('#input_weekly_date').val(moment().format('MM/DD/YYYY'));
            } else if (viewType === 'list') {
                DASHBOARD.listView();
            } else if (viewType === 'search') {
                DASHBOARD.search();
            } else {
                DASHBOARD.loadTable(moment().toISOString());
                $('#input_weekly_date').val(moment().format('MM/DD/YYYY'));
            }
        }
    };

    var populateTaskForm = function(id) {
        $('#form_error_message').hide();
        $('#form_error_message').text('');
        var obj = {id: id};
        AJAX.get('/dashboard/getSingleTask', obj, function(data) {
            var data = JSON.parse(data);
            $('#input_task_title').val(data.TaskName);
            $('#input_task_desc').val(data.TaskDesc);
            $('#input_start_date_time').val(moment(data.TaskStartTime).format('MM/DD/YYYY hh:mm A'));
            $('#input_end_date_time').val(moment(data.TaskEndTime).format('MM/DD/YYYY hh:mm A'));
            $('#input_task_priority').val(data.TaskPriority);
          }, function(xhr, text, error) {
              $('#form_error_message').text('Could not get Task.');
              $('#form_error_message').show();
          });
    };

    var populateDocumentForm = function(id, location) {
        AJAX.get('/documents/names',
            {id: id},
            function (data) {
                data = JSON.parse(data);
                $('#document_upload_task_id').val(data.taskId);
                var isDelete = location === '#document_names';
                var html = '';
                data.documents.forEach(function (document) {
                    html += '<div class="badge badge-primary" style="cursor: pointer;">'
                        + '<span onclick="DASHBOARD.downloadDocument(' + document.DocumentID +  ')">'
                        + document.DocumentName + ' </span>';
                    if (isDelete) {
                        html += ' <i class="fa fa-close" onclick="ADD_EDIT_TASK.deleteTaskFile(' + document.DocumentID + ');"></i> ';
                    }
                    html += '</div> ';
                });
                $(location).html(html);
            }, function (xhr, text, error) {
                $('#view_error_message').text('Could not get documents.');
                $('#view_error_message').show();
            });
    };

    var editTask = function() {
        $('#form_error_message').hide();
        $('#form_error_message').text('');
        if (validateForm()) {
            var obj = {};
            $(formId).each(function () {
                var inputs = $(this).find(':input');
                obj = getInputValues(inputs);
            });
            AJAX.post('/dashboard/editTask', obj,
                function (data) {
                    data = JSON.parse(data);
                    showUploadDocument(data);
                    backToView(data);
                }, function (xhr, text, error) {
                    $('#form_error_message').text('Error connecting to server.');
                    $('#form_error_message').show();
                }
            )
        }
    };

    var submitTaskFile = function() {
        $.ajax({
            url: '/uploadDocument',
            type: 'POST',
            data: new FormData($('#documentForm')[0]),
            cache: false,
            contentType: false,
            processData: false,
            success: function (data) {
                data = JSON.parse(data);
                if (data.error) {
                    $('#upload_error_message').text(data.error);
                    $('#upload_error_message').show();
                } else {
                    $('#modal_upload_document').modal('hide');
                }
            }
        });
    };

    var deleteTaskFile = function(documentId) {
        AJAX.get('/deleteDocument',
            {documentId: documentId},
            function (data) {
                data = JSON.parse(data);
                if (data.error) {
                    $('#upload_error_message').text('Document not be deleted properly. May still not be visible.');
                    $('#upload_error_message').show();
                } else {
                    populateDocumentForm(data.success, '#document_names');
                }
            }, function (xhr, text, error) {
                $('#upload_error_message').text('Document not be deleted properly. May still not be visible.');
                $('#upload_error_message').show();
            });
    };

    var deleteTask = function() {
        $('#view_error_message').hide();
        $('#view_error_message').text('');
        var taskId = parseInt($('#delete_task').val());
        AJAX.post('/dashboard/deleteTask',
            {taskId: taskId},
            function (data) {
                data = JSON.parse(data);
                if (data.success) {
                    backToView(data);
                } else {
                    $('#view_error_message').text('Cannot delete task properly.');
                    $('#view_error_message').show();
                }
            }, function (xhr, text, error) {
                $('#form_error_message').text('Error connecting to server.');
                $('#form_error_message').show();
            });

    };

    var getInputValues = function(inputs) {
        var obj = {};
        obj['id'] = $('#submit_button').val();
        inputs.each(function () {
            var input = $(this);
            obj[input.attr('title')] = input.val();
        });
        return obj;
    };

    var validateForm = function() {
        var valid = false;
        $(formId).each(function () {
            var inputs = $(this).find(':input');
            valid = validateInputs(inputs);
        });
        return valid;
    };

    var validateInputs = function(inputs) {
        var valid = true;
        inputs.each(function() {
            var input = $(this);
            if (input.attr('title') === 'taskTitle') {
                if (input.val().length > 99 || input.val().length === 0)
                    valid = false;
            } else if (input.attr('title') === 'taskDesc') {
                if (input.val().length > 999 || input.val().length === 0)
                    valid = false;
            } else if (input.attr('title') === 'startDateTime') {
                if (input.val() === '')
                    valid = false;
            } else if (input.attr('title') === 'endDateTime') {
                if (input.val() === '')
                    valid = false;
            }
        });
        return valid;
    };

    var validateDates = function() {
        var startDateTime = moment($('#input_start_date_time').val());
        var endDateTime = moment($('#input_end_date_time').val());
        if (!startDateTime)
            return false;

        if (!endDateTime)
            return false;

        if (endDateTime.isBefore(startDateTime))
            return false;

        if (endDateTime.isBefore(moment().startOf('day')) && startDateTime.isBefore(moment().startOf('day')))
            return false;

        return true;
    };

    return {
        init: init,
        submitButton: submitButton,
        showEditModal: showEditModal,
        populateTaskForm: populateTaskForm,
        populateDocumentForm: populateDocumentForm,
        submitTaskFile: submitTaskFile,
        deleteTaskFile: deleteTaskFile,
        deleteTask: deleteTask,
        changeIsAdd: changeIsAdd
    };

}());

history.pushState(null, null, location.href);
window.onpopstate = function () {
    history.go(1);
};

$(document).ready(function () {
    DASHBOARD.init();
    ADD_EDIT_TASK.init();

});

