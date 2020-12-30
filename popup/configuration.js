var configuration = {
    "websites": {
        "www.ebay.com.au": {
            "product_name": {
                "elementID": "itemTitle",
                "regex": ""
            },
            "product_sku": {
                "elementID": "descItemNumber",
                "regex": ""
            },
            "product_buy_price_inc": {
                "elementID": "prcIsum",
                "regex": /(\d+\.?\d?\d?)/
            }
        },
        "www.ebay.com": {
            "product_name": {
                "elementID": "itemTitle",
                "regex": ""
            },
            "product_sku": {
                "elementID": "descItemNumber",
                "regex": ""
            },
            "product_buy_price_inc": {
                "elementID": "prcIsum",
                "regex": /(\d+\.?\d?\d?)/
            }
        }
    },
    "price_calculation": {
        29: {
            "sell_price": 49,
            "type": "static"
        },
        39: {
            "sell_price": 59,
            "type": "static"
        },
        49: {
            "sell_price": 69,
            "type": "static"
        },
        "default": {
            "sell_price": 1.3,
            "type": "calculated"
        }
    },
    "dear_integration": {
        "account": "77992d11-cb32-4a2a-b317-2958812a777d",
        "key": "2406da49-163d-8e26-7c44-249cf8741924"
    },
    "apify": {
        "account_token": "hnePw8JMScwyZy5gfehEwHs9Q",
        "actor_task": "F5GhJsI1wKXgWevmt"
    }
}