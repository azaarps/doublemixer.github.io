/* Original code portions released into the public domain. (all except for marked sections) */
/* VERY alpha, likely to change a lot. */

const baseurl_clearnet = "https://bitmix.biz";
const baseurl_tor = "http://bitmixbizymuphkc.onion";
const baseurl = window.location.hostname.endsWith(".onion") ? baseurl_tor : baseurl_clearnet;

console.log(baseurl);


const default_affiliate = "1555109354-3YjJ-MfCa-aLkH";

// Fee is a float.
const default_fee = Math.random() * 3 + 1;

// Delay is integer minutes.
const default_delay = Math.floor(Math.random() * 60) + 10;

function is_undefined(argument) {
    return (typeof(argument)==='undefined');
}

function bitmix_mix(callback,
                    error_callback,
                    options,
                    endpoint = baseurl) {

    console.log(endpoint);

    if (is_undefined(options['delay'])) options['delay'] = default_delay;

    if (options["currency"] != "bitcoin" ) {
        console.log("bitcoin is the only supported currency");
        return;
    }

    json_options = {"address": [output_address],
                    "delay": options["delay"],
                    "tax": default_fee,
                    "coin": options["currency"],
                    "ref": default_affiliate}

    var request = new XMLHttpRequest();
    var url = endpoint + "/api/order/create?with-cors-headers";
    request.open("POST", url, true);
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
                callback(request.response);
            } else if (status_first_digit == 4) {
                error_callback(request.responseText);
            } else {
                console.log("Retrying...");
                return setTimeout(function () { bitmix_mix(callback, error_callback, options, endpoint); }, 5000);
            }
        }
    }
    request.onreadystatechange = handler;
    request.send(JSON.stringify(json_options));
}
