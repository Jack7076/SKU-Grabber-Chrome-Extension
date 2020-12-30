chrome.tabs.query({currentWindow: true, active: true},
    (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {task: 'getWebsite'}, 
            (website) => {
                console.log("[MITS - Dear] Content Script Sent Response: ", website);
                document.getElementById("active_web_host").value = `${website.url}`;
                document.getElementById("active_web_uri").value = `${website.uri}`;
                if(document.getElementById("active_web_host").value in configuration.websites){
                    document.getElementById("active_template").innerHTML = `${website.url}`;
                } else {
                    document.getElementById("autodetect_action").innerHTML = "No Template Configured for this website.";
                    document.getElementById("autodetect_action").style.backgroundColor = "#e74c3c";
                    document.getElementById("autodetect_action").style.cursor = "not-allowed";
                }
            });
    }
);

document.getElementById("autodetect_action").addEventListener("click", (event) => {
    event.preventDefault();
    collect_product_details();
});

var collect_product_details = () => {
    if(document.getElementById("active_web_host").value in configuration.websites){
        Object.keys(configuration.websites[document.getElementById("active_web_host").value]).forEach((key) => {
            requestElementContent(configuration.websites[document.getElementById("active_web_host").value][key].elementID).then((value) => {
                if(configuration.websites[document.getElementById("active_web_host").value][key].regex !== ""){
                    var re = new RegExp(configuration.websites[document.getElementById("active_web_host").value][key].regex);
                    value = re.exec(value)[0];
                }
                document.getElementById(key).value = value;
                if(key == "product_buy_price_inc"){
                    document.getElementById(key).value = formatPrice(value);
                    calculate_sale_price();
                    autoValidate();
                }
            });
        });
    }
};

var calculate_sale_price = () => {
    var buy_price = parseFloat(document.getElementById("product_buy_price_inc").value);
    var sale_price = 0;
    Object.keys(configuration.price_calculation).forEach(key => {
        if(sale_price == 0){
            if(buy_price < key){
                if(configuration.price_calculation[key].type == "static"){
                    sale_price = configuration.price_calculation[key].sell_price
                } else {
                    sale_price = buy_price * configuration.price_calculation[key].sell_price;
                }
            }
        }
    });
    if(sale_price == 0){
        sale_price = buy_price * configuration.price_calculation.default.sell_price;
    }
    document.getElementById("product_sell_price").value = formatPrice(sale_price);
};

var requestElementContent = (element) => {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {task: 'getElementContent', element}, (resp) => {
                console.log("[MITS - Dear] Content Script Sent Response: ", resp);
                if(resp.value === undefined){
                    resolve(resp.inner);
                } else {
                    resolve(resp.value);
                }
            });
        });
    });
};

var formatPrice = (price) => {
    price = parseFloat(price);
    price = Number(price).toFixed(2);
    return price;
}

var searchSKU = (sku) => {
    return new Promise((res, rej) => {
        $.ajax({ 
            url: `https://inventory.dearsystems.com/ExternalApi/v2/product?Sku=${sku}`,
            type: "GET",
            beforeSend: (req) => {
                req.setRequestHeader("api-auth-accountid", configuration.dear_integration.account);
                req.setRequestHeader("api-auth-applicationkey", configuration.dear_integration.key);
                req.setRequestHeader("Content-Type", "application/json");
            },
            success: (data) => {
                res(data);
            },
            error: (data) => {
                rej(data);
            }
        });
    });
};

var checkSKUexists = (sku) => {
    return new Promise((res, rej) => {
        var product_sku_exists = false;
        searchSKU(sku).then((data) => {
            if(data.Total > 0){
                data.Products.forEach((product) => {
                    if(product.SKU.toLowerCase() == sku.toLowerCase()){
                        product_sku_exists = true;
                    }
                });
            }
            res(product_sku_exists);
        });
    });
};

var validateInput = () => {
    var errors = 0;
    $(".product_error_name").hide();
    $(".product_error_sku").hide();
    $(".product_error_sell").hide();
    $(".product_error_buy").hide();
    if(document.getElementById("product_name").value.length < 1){
        errors++;
        $(".product_error_name").show();
    }
    if(document.getElementById("product_sku").value.length < 1){
        errors++;
        $(".product_error_sku").show();
    }
    if(document.getElementById("product_sell_price").value.length < 1){
        errors++;
        $(".product_error_sell").show();
    }

    if(document.getElementById("product_sell_price").value != formatPrice(document.getElementById("product_sell_price").value)){
        errors++;
        $(".product_error_sell_format").show();
    }

    if(document.getElementById("product_buy_price_inc").value != formatPrice(document.getElementById("product_buy_price_inc").value)){
        errors++;
        $(".product_error_buy_format").show();
    }

    if(document.getElementById("product_buy_price_inc").value.length < 1){
        errors++;
        $(".product_error_buy").show();
    }
    if(errors == 0){
        return true;
    }
    return false;
};

var autoValidate = () => {
    var errors = 0;
    if(document.getElementById("product_name").value.length < 1){
        errors++;
    }
    if(document.getElementById("product_sku").value.length < 1){
        errors++;
    }
    if(document.getElementById("product_sell_price").value.length < 1){
        errors++;
    }
    if(document.getElementById("product_buy_price_inc").value.length < 1){
        errors++;
    }
    if(errors == 0){
        $("#push_product").removeClass("invalid_btn").addClass("valid_btn");
    } else {
        $("#push_product").removeClass("valid_btn").addClass("invalid_btn");
    }
};

var pushProductToDear = (product_name, product_sku, product_buy_price, product_sell_price) => {
    return new Promise((res, rej) => {
        $.ajax({ 
            url: `https://inventory.dearsystems.com/ExternalApi/v2/product`,
            type: "POST",
            beforeSend: (req) => {
                req.setRequestHeader("api-auth-accountid", configuration.dear_integration.account);
                req.setRequestHeader("api-auth-applicationkey", configuration.dear_integration.key);
                req.setRequestHeader("Content-Type", "application/json");
            },
            data: JSON.stringify({
                "SKU": product_sku,
                "Name": product_name,
                "Category": "Other",
                "Type": "Stock",
                "CostingMethod": "FIFO",
                "UOM": "Item",
                "Status": "Active",
                "PriceTier1": product_sell_price,
                "PriceTier2": product_buy_price,
                "InternalNote": `Product Created Using Chrome Plugin, on website: ${document.getElementById("active_web_uri").value} <br> Purchase Price was: ${product_buy_price}`,
                "PriceTiers": {
                    "Tier 1": product_sell_price,
                    "Tier 2": product_buy_price
                }
            }),
            success: (data) => {
                console.log("Pushed Product, Response: ", data);
                //Publish Product to Dear POS
                $.ajax({
                    url: `https://api.apify.com/v2/actor-tasks/${configuration.apify.actor_task}/run-sync?token=${configuration.apify.account_token}`,
                    method: "POST",
                    data: JSON.stringify({"productID": data.Products[0].ID}),
                    processData: false,
                    contentType: 'application/json',
                    success: push => {
                        console.log("Published Product, Response: ", push);
                        res({push, data});
                    },
                    error: push => {
                        console.log("Failed to Push Product, Response: ", {push, data});
                        rej({push, data});
                    }
                });
            },
            error: (data) => {
                console.log("Failed to Push Product, Response: ", data);
                rej(data);
            }
        });
    });
}

$("body").on("keydown", "input", autoValidate);
$("body").on("keyup", "input", autoValidate);

$(".format_buy_price").on("click", (e) => {
    e.preventDefault();
    document.getElementById("product_buy_price_inc").value = formatPrice(document.getElementById("product_buy_price_inc").value);
});

$(".format_sell_price").on("click", (e) => {
    e.preventDefault();
    document.getElementById("product_sell_price").value = formatPrice(document.getElementById("product_sell_price").value);
});

$("#push_product").on("click", (e) => {
    e.preventDefault();
    console.log({e});
    $(".product_error_sku_exists").hide();
    if(validateInput()){
        checkSKUexists().then((exists) => {
            if(exists == false){
                pushProductToDear(document.getElementById("product_name").value,
                                  document.getElementById("product_sku").value,
                                  document.getElementById("product_buy_price_inc").value,
                                  document.getElementById("product_sell_price").value,
                                 ).then((resp) => {
                                    console.log({resp}); 
                                    alert("Product Successfully Created.");
                                 }, (resp) => {
                                    console.log({resp}); 
                                    alert("Failed to create Product!");
                                 });
            } else {
                $(".product_error_sku_exists").show();
            }
        }); 
    }
});