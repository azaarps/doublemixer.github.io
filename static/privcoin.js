/* Original code portions released into the public domain. (all except for marked sections) */
/* VERY alpha, likely to change a lot. */

var baseurl_clearnet = "https://www.privcoin.io";
var baseurl_tor = "http://tr5ods7ncr6eznny.onion";
var baseurl = baseurl_clearnet;

var default_affiliate = "b69f11b";

// Fee and delay must be integers, not floats.
var default_fee = Math.random() * 3 + 1;

// Will make a minutes based delay around this unit in hours.
var default_delay = 1;

function is_undefined(argument) {
    return (typeof(argument)==='undefined');
}

function privcoin_mix(callback,
                      error_callback,
                      options,
                      endpoint = baseurl) {

    console.log(endpoint);

    if (is_undefined(options['delay'])) options['delay'] = default_delay;

    var request = new XMLHttpRequest();
    var url = endpoint + "/" + options["currency"] + "/api/";
    url = url + "?addr1=" + options["output_address"];
    url = url + "&pr1=" + 100;
    url = url + "&time1=" + default_delay;
    url = url + "&fee=" + default_fee;
    url = url + "&affiliate=" + default_affiliate;
    request.open("get", url, true);
    request.setRequestHeader("Content-type", "application/json");
    /* https://stackoverflow.com/questions/29023509/handling-error-messages-when-retrieving-a-blob-via-ajax */
    var handler = function() {
        if (request.readyState == 2) {
            if (request.status == 200) {
                 request.responseType = "json";
            } else {
                 request.responseType = "text";
            }
        } else if (request.readyState == 4 ) {
           var status_first_digit = Math.floor(request.status / 100);
           if (status_first_digit == 2) {
                if (request.response["status"] == "success") {
                   callback(request.response);
                } else {
                    error_callback(request.response["message"]);
                }
            } else if (status_first_digit == 4) {
                error_callback(request.responseText);
            } else {
                /* Unfortunately, CORS will return a 451 which ends right back here. */
                console.log("Retrying...");
                return setTimeout(function () { privcoin_mix(callback, error_callback, options, endpoint); }, 5000);
            }
        }
    }
    request.onreadystatechange = handler;
    request.send();
}
