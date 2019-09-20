/* Original code portions released into the public domain. (all except for marked sections) */
/* VERY alpha, likely to change a lot. */

const foxmixer_baseurl_clearnet = "https://www.foxmixer.com";
const foxmixer_baseurl_tor = "http://foxmixer6mrsuxrl.onion";
const foxmixer_baseurl = window.location.hostname.endsWith(".onion") ? foxmixer_baseurl_tor : foxmixer_baseurl_clearnet;

console.log(foxmixer_baseurl);

// Fee and delay must be integers, not floats.
const foxmixer_default_delay = Math.floor(Math.random() * 2) + 2;

function is_undefined(argument) {
    return (typeof(argument)==='undefined');
}

// Example:
// In: payinAddress=1G5hHSGAU87p1QTtZPPoeVSHrM2cJwHwAf&payinAmountMin=0.002&payinAmountMax=200&mixId=eQQSi8QTuZYuFLj2J
function foxmixer_jsonify(responseText) {
    // This is very hacky and may not be stable.
    var address = responseText.split("=")[1].split("&")[0];
    var minimum_amount = responseText.split("=")[2].split("&")[0];
    var maximum_amount = responseText.split("=")[3].split("&")[0];
    var mix_id = responseText.split("=")[4].split("&")[0];
    var output = {"address": address,
                  "minimum_amount": minimum_amount,
                  "maximum_amount": maximum_amount,
                  "mix_id": mix_id}
    return output;
}

function foxmixer_mix(callback,
                      error_callback,
                      options,
                      endpoint = foxmixer_baseurl) {

    if (is_undefined(options['delay'])) options['delay'] = foxmixer_default_delay;

    if (options["currency"] != "bitcoin" ) {
        console.log("bitcoin is the only supported currency");
        return;
    }

    var request = new XMLHttpRequest();
    var url = endpoint + "/api/createMix";
    url = url + "?payoutAddress1=" + options["output_address"];
    url = url + "&payoutPercentage1=100";
    url = url + "&payoutDelay1=" + options["delay"];
    request.open("GET", url, true);
    request.responseType = "text";
    var handler = function() {
        if (request.readyState == 4 ) {
            var status_first_digit = Math.floor(request.status / 100);
            if (status_first_digit == 2) {
                callback(foxmixer_jsonify(request.responseText));
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

function foxmixer_letter_of_guarantee(callback,
                                      error_callback,
                                      mix_id,
                                      endpoint = foxmixer_baseurl) {
    var request = new XMLHttpRequest();
    var url = endpoint + "/mix/" + mix_id + "/LetterOfGuarantee.txt";
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
                return setTimeout(function () { foxmixer_letter_of_guarantee(callback, error_callback, options, endpoint); }, 5000);
            }
        }
    }
    request.onreadystatechange = handler;
    request.send();
}
