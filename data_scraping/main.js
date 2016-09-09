var request = require('request');
var fs = require('fs');

var url = 'http://store.nike.com/html-services/gridwallData?country=ES&lang_locale=es_ES&gridwallPath=hombre-zapatillas/7puZoi3&pn=';
// API pages start counting on 1. There are 14 pages of products (60 per page + 13 last one = 793 products)
var productsPerPage = 60;

// Set the headers
var headers = {
    'Accept': 'application/json',
    'Connection': 'keep-alive',
}

var totalProducts = [];

// Start the request
function requestPage(page){
    console.log('requesting page '+page+'...');
    request({
        url: url+page,
        method: 'GET',
        headers: headers    
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('page '+page+' resolved');                        
            var jsonBody = JSON.parse(body); 
            var products = jsonBody && jsonBody.sections && jsonBody.sections[0] && jsonBody.sections[0].products;

            if (products && products.length === productsPerPage) { // response is full, probably there are more products
                totalProducts = totalProducts.concat( products.map(processProduct) );
                requestPage(page+1); // quit during develop
                // saveProducts(totalProducts); // add during develop
            }
            else {  // response isn't full, should finish petitions
                saveProducts(totalProducts);
            }
        }    
    });
}

function processProduct(product){   
    return {
        // id: product['pdpUrl'].split('-').slice(-1)[0],
        title: product['title'],
        subtitle: product['subtitle'],
        url: product['pdpUrl'],
        localPrice: parseFloat( product['localPrice'] ),
        employeePrice: parseFloat( product['employeePrice'] ),
        inStock: product['inStock'],
        colors: getProductColors( product['colorways'] ),
        rating: parseFloat( product['rating'] ),
        ratingCount: parseInt( product['ratingCount'] )
    }
}

function getProductColors(colorways) {
    // colors could be repeated in the colorways array, also colorDescription could be null
    var colorsMap = {};
    if (colorways !== null){
        colorways.forEach(function(colorway){
            var color = colorway['colorDescription'];
            if (color !== null) colorsMap[color] = true;
        });
    }
    return Object.keys(colorsMap);
}

function saveProducts(products){
    console.log('saving data...');
    fs.writeFile("./products.json", JSON.stringify(products), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}

requestPage(1);