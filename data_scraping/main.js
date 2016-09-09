var request = require('request');

var url = 'http://store.nike.com/html-services/gridwallData?country=ES&lang_locale=es_ES&gridwallPath=hombre-zapatillas/7puZoi3&pn=1';

// Set the headers
var headers = {
    'Accept': 'application/json',
    'Connection': 'keep-alive',
}

// Configure the request
var options = {
    url: url,
    method: 'GET',
    headers: headers    
}

// Start the request
request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body);
    }    
});