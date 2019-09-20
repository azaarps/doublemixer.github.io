/* Original code portions released into the public domain. (all except for marked sections) */
/* VERY alpha, likely to change a lot. */

const bitmix_baseurl_clearnet = "https://bitmix.biz";
const bitmix_baseurl_tor = "http://bitmixbizymuphkc.onion";
const bitmix_baseurl = window.location.hostname.endsWith(".onion") ? bitmix_baseurl_tor : bitmix_baseurl_clearnet;

console.log(bitmix_baseurl);


const bitmix_default_affiliate = "1568954219-MR4r-lK60-zme4";

// Fee is a float.
const bitmix_default_fee = Math.random() * 2 + 3;

// Delay is integer minutes.
const bitmix_default_delay = Math.floor(Math.random() * 60) + 10;

function is_undefined(argument) {
    return (typeof(argument)==='undefined');
}

function bitmix_mix(callback,
                    error_callback,
                    options,
                    endpoint = bitmix_baseurl) {

    console.log(endpoint);

    if (is_undefined(options['delay'])) options['delay'] = bitmix_default_delay;

    if (options["currency"] != "bitcoin" ) {
        console.log("bitcoin is the only supported currency");
        return;
    }

    json_options = {"address": [output_address],
                    "delay": options["delay"],
                    "tax": bitmix_default_fee,
                    "coin": options["currency"],
                    "ref": bitmix_default_affiliate}

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
                // Sample: {"input_address":"39x1sFrpRDecrLsAymzx1HM9jtuZWrx7Ni","id":"fOLCB4y-1ljZhHB-mL7U0L3-HMh01Yd","code":"SgZcIzmBNC3p"}
                output = {"address": request.response.input_address,
                          "mix_id": request.response.id}
                callback(output);
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

function bitmix_letter_of_guarantee(callback,
                                    error_callback,
                                    mix_id,
                                    endpoint = bitmix_baseurl) {
    var request = new XMLHttpRequest();
    var url = endpoint + "/api/order/letter/" + mix_id + "?with-cors-headers";
    request.open("GET", url, true);
    request.responseType = "text";
    var handler = function() {
        if (request.readyState == 4 ) {
            var status_first_digit = Math.floor(request.status / 100);
            if (status_first_digit == 2) {
                callback(request.responseText);
            } else if (status_first_digit == 4) {
                error_callback(request.responseText);
            } else {
                console.log("Retrying...");
                return setTimeout(function () { bitmix_letter_of_guarantee(callback, error_callback, options, endpoint); }, 5000);
            }
        }
    }
    request.onreadystatechange = handler;
    request.send();
}
