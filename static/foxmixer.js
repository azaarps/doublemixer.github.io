/* Original code portions released into the public domain. (all except for marked sections) */
/* VERY alpha, likely to change a lot. */

var baseurl_clearnet = "https://www.foxmixer.com";
var baseurl_tor = "http://foxmixer6mrsuxrl.onion";
var baseurl = baseurl_clearnet;

var default_affiliate = "1CMndA1TgScgKDDnCHYx1ZQDZQJ439ZWpK";

// Fee and delay must be integers, not floats.
var default_affiliate_fee = Math.floor(Math.random() * 3) + 1;

var default_delay = Math.floor(Math.random() * 2) + 2;
var default_affiliate_delay = Math.floor(Math.random() * 11) + 2;

function is_undefined(argument) {
    return (typeof(argument)==='undefined');
}

function foxmixer_mix(callback,
                      error_callback,
                      options,
                      endpoint = baseurl) {

    console.log(endpoint);

    if (is_undefined(options['delay'])) options['delay'] = default_delay;

    if (options["currency"] != "bitcoin" ) {
        console.log("bitcoin is the only supported currency");
        return;
    }

    var request = new XMLHttpRequest();
    var url = endpoint + "/api/createMix";
    url = url + "?payoutAddress1=" + options["output_address"];
    url = url + "&payoutPercentage1=" + (100 - default_affiliate_fee);
    url = url + "&payoutDelay1=" + options["delay"];
    url = url + "&payoutAddress2=" + default_affiliate;
    url = url + "&payoutPercentage2=" + default_affiliate_fee;
    url = url + "&payoutDelay2=" + default_affiliate_delay;
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
                return setTimeout(function () { foxmixer_mix(callback, error_callback, options, endpoint); }, 5000);
            }
        }
    }
    request.onreadystatechange = handler;
    request.send();
}
