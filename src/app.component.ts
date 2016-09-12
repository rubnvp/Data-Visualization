declare var dc: any;
declare var crossfilter: any;
declare var d3: any;

export function AppComponent() {

    interface Product {
        // default
        title: string,
        subtitle: string,
        url: string,
        localPrice: number,
        employeePrice: number,
        inStock: boolean|string,
        colors: string[],
        rating: number,
        ratingCount: number,
        // created
        priceRange: number,
        ratingRange: number
    }
    
    function init() {        
        d3.json("data_scraping/products.json", function(error, products: Product[]) {
            if (error) return console.warn(error);
            products.forEach(product => {
                product.priceRange = Math.floor( product.localPrice / 10 ) * 10; // floor to ten                
                product.ratingRange = product.rating !== null ? Math.round( product.rating * 10 ) / 10 : -1; // round to 0.1, if null value is -1
                product.inStock = product.inStock ? 'True' : 'False';
            });
            const ndx = crossfilter(products);            
            drawCharts(ndx, products);
        });
    }

    function drawCharts(ndx, products){
        // Data count
        const dataCount = dc.dataCount('#data-count');
        
        dataCount
            .dimension(ndx)
            .group(ndx.groupAll());

        // Shoes price
        const priceDim = ndx.dimension(product => product.priceRange);
        const productsPrice = priceDim.group().reduceCount();

        const shoesPriceChart = dc.barChart('#chart-shoes-price');
        const shoesPriceWidth = document.querySelector('#chart-shoes-price').parentNode['clientWidth'];
        const maxPrice = d3.max(products, product => product.localPrice); 

        shoesPriceChart
            .width(shoesPriceWidth)		
            .height(200)
            .dimension(priceDim)
            .group(productsPrice)                
            .x( d3.scale.linear().domain([0,maxPrice]) )
                .xUnits(function(){return 50;})
                .elasticY(true)
                .centerBar(true)
                .yAxisLabel('Shoes')
                .xAxisLabel('Price range')
                .margins({top: 10, right: 20, bottom: 45, left: 45}); 
        
        // Shoes rating
        const ratingDim = ndx.dimension(product => product.ratingRange);
        const productsRating = ratingDim.group().reduceCount();

        const shoesRatingChart = dc.barChart('#chart-shoes-rating');
        const shoesRatingWidth = document.querySelector('#chart-shoes-rating').parentNode['clientWidth'];

        shoesRatingChart
            .width(shoesRatingWidth)		
            .height(200)
            .dimension(ratingDim)
            .group( productsRating )                
            .x( d3.scale.linear().domain([-0.1, 5.1]) )
                .xUnits(function(){return 60;})
                .elasticY(true)
                .centerBar(true)
                .yAxisLabel('Shoes')
                .xAxisLabel('Rating')
                .margins({top: 10, right: 20, bottom: 45, left: 45});

        // Stock pie chart
        const stockDim = ndx.dimension(product => product.inStock);
        const productsStock = stockDim.group().reduceCount();
        
        const stockChart = dc.pieChart('#chart-shoes-stock');

        stockChart
            .width(150)
            .height(150)
            .dimension(stockDim)
            .group(productsStock)
                .innerRadius(20);


        // Data table
        const allDim = ndx.dimension((product: Product) => product.localPrice);
        const dataTableGroup = function(d){return '';};

        const dataTable = dc.dataTable('#data-table');

        dataTable
            .dimension(allDim)
            .group(dataTableGroup)
            .size(20)
            .columns([
                (product: Product) => `<a href="${product.url}" target="_blank">${product.title}</a>`,
                (product: Product) => product.subtitle,
                (product: Product) => product.rating !== null ? `${product.rating.toFixed(2)} (${product.ratingCount})` : undefined,
                (product: Product) => product.localPrice + '€'
            ])
                .sortBy((product: Product) => product.localPrice)
                .order(d3.descending)
                .on('renderlet', function(table) {
                    // each time table is rendered remove nasty extra row dc.js insists on adding
                    table.select('tr.dc-table-group').remove();
                });
        
        //Reset filters
        d3.selectAll('a#reset-filters').on('click', function () {            
            dc.filterAll();
            dc.renderAll();
        });
        
        // Render all
        dc.renderAll();
    }
    
    return {
        init
    };
}