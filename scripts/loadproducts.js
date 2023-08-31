const axios = require('axios');
var fs = require('fs');
var products = [];

(async () => {
    try {
        const res = await axios.get('https://api.github.com/repos/zenwebhost/zen-india-shoppe-raw-api/git/trees/main', {
            params: { recursive: 'full' },
            headers: {
                'Content-Type': 'application/json',
                'Accept-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
            }
        });

        let productFiles = getProductFiles(res.data);

        for (const productFile of productFiles) {
            let productDetails = await axios.get('https://zenwebhost.github.io/zen-india-shoppe-raw-api/' + productFile.path, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
                }
            });

            if (productDetails && productDetails.data) {
                products.push(productDetails.data);
            }
        }

        products = products.map(x => {
            return {
                name: x.name,
                image: x.image,
                price: x.price,
                discountedPrice: x.discountedPrice,
                productLink: x.productLink,
                link: x.link,
                categories: x.categories,
                properties: x.properties,
                actionText: x.actionText,
                actionLink: x.actionLink
            }
        })

        console.log(products);
        fs.writeFile('../shop/products.json', JSON.stringify(products), 'utf8', () => { });

    } catch (error) {
        console.log(error);
    }
})();

function getProductFiles(files) {
    // Create the appropriate regex to match the desired files.
    let regex = new RegExp("^product/([a-zA-Z0-9/]+).json$", "i");
    // Get matching files from github.
    let productFiles = files.tree.filter(x => regex.test(x.path) && !x.path.endsWith('test.json')); // Filter out test.json
    return productFiles;
}
