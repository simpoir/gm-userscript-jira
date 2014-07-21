// ==UserScript==
// @name        pivot-jira-toggl
// @namespace   simpoir.com
// @include     https://services.pivot88.com/jira/*
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @version     1
// @grant       GM_xmlhttpRequest
// ==/UserScript==
$(document) .ready(function () {
    var issue = $('#key-val') .attr('data-issue-key');
    console.log('Toggl: Detected issue '+issue);
    var tools = $('<ul class=\'toolbar-group\'></ul>');
    $('.command-bar .toolbar-split-left') .append(tools);
    GM_xmlhttpRequest({
        method: 'GET',
        url: 'https://www.toggl.com/api/v8/time_entries/current',
        onload: function (response) {
            console.log('Toggl probe');
            console.log(response);
            var data = JSON.parse(response.responseText).data;
            if (!data) {
                var start = $('<li class=\'toolbar-item\'><a class=\'toolbar-trigger\'><span class=\'trigger-label\'>Start Timer</span></a></li>');
                start.click(function () {
                    GM_xmlhttpRequest({
                        method: 'POST',
                        data: '{"time_entry":{"description":"' + issue + '", "pid":3072614}}',
                        url: 'https://www.toggl.com/api/v8/time_entries/start',
                        onload: function (success) {
                            location.reload();
                        }
                    });
                });
                tools.append(start);
            } else {
                var t = (new Date() .getTime() / 1000) + data.duration;
                var h = Math.floor(t / 3600);
                t -= h * 3600;
                var m = Math.floor(t / 60);
                var s = Math.floor(t - m * 60);
                tools.append('Timer running for ' + h + 'h, ' + m + 'm, ' + s + 's');
                if (issue == data.description) {
                    tools.append(' for <b>this issue</b>');
                } else {
                    tools.append(' for: ' + data.description);
                }
                var stop = $('<li class=\'toolbar-item\'><a class=\'toolbar-trigger\'><span class=\'trigger-label\'>Stop Timer</span></a></li>');
                stop.click(function () {
                    GM_xmlhttpRequest({
                        method: 'PUT',
                        url: 'https://www.toggl.com/api/v8/time_entries/' + data.id + '/stop',
                        onload: function () {
                            location.reload();
                        }
                    });
                });
                tools.append(stop);
            }
        }
    });
});
