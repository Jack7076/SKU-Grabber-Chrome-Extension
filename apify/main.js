const Apify = require('apify');
const cheerio = require('cheerio');
const request = require("request-promise").defaults({ jar: true });

Apify.main(async () => {    
    const input = await Apify.getInput();
    const {productID} = input;
    console.log(`Got Product ID: ${productID}`);
    const login_url = 'https://inventory.dearsystems.com/Account/Login';

    const authentication = await request.post(login_url, {
        form: {
            UserName: process.env.account_username,
            Password: process.env.account_password
        },
        simple: false
    });

    console.log("Authenticated to Dear");

    const product_list_url = 'https://inventory.dearsystems.com/DearPos/ListOrUpdateProduct';

    const list_product = await request.post(product_list_url, {
        form: {
            ConfigID: process.env.pos_id,
            ProductID: productID,
            SyncStockLevel: true,
            Lotalty: ""
        },
        simple: false
    });

    console.log("Listed Product");

    const output = {
        authentication,
        list_product
    };
    console.log('Actor output:');
    console.dir(output);
    await Apify.setValue('OUTPUT', output);
});