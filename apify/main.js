const Apify = require('apify');

Apify.main(async () => {
    const input = await Apify.getInput();
    const {productID} = input;

    console.log(`Product ID form INPUT is: ${productID}`);

    const browser = await Apify.launchPuppeteer();
    const login_page = await browser.newPage();
    await login_page.goto("https://inventory.dearsystems.com/Account/Login");

    await login_page.type("#UserName", process.env.dear_username);
    await login_page.type("#Password", process.env.dear_password);
    await login_page.click("#btnSubmit");
    await login_page.waitForNavigation();

    const authentication_cookies  = await login_page.cookies();

    console.log("Authenticated to Dear.");
    await login_page.goto(`https://inventory.dearsystems.com/Home/Organisation?ID=${process.env.dear_organisation}`);
    console.log("Selected Organisation on Dear.");
    await login_page.goto(`https://inventory.dearsystems.com/Product#${productID}`);
    console.log("Loading Product Page.");
    await login_page.waitForSelector("#tabChannels", { timeout: 10000 });
    console.log("Finished Loading Product Page.");
    await login_page.click("#tabChannels");
    console.log("Loading Channels Tab.");
    await login_page.waitForSelector("#divChannelsTable", { timeout: 20000 });
    console.log("Loaded Channels Tab.");
    await login_page.evaluate(() => {
        $(".channelStoreName_channels").each(
            (index) => {
                 if(process.env.dear_channel == $(".channelStoreName_channels").eq(index).text()){
                    var list_remove_btn_for_channel = $(".channelStoreName_channels").eq(index).parent().parent().parent().find(".mimic_a");
                    if(list_remove_btn_for_channel.text() == "List"){
                        list_remove_btn_for_channel.click();
                    } else {
                        console.log("Already Listed");
                    }
                 }
            }
        );
    });
    console.log("Listing Product.");

    await browser.close();
    const output = {
        "YAY": "YAY"
    };
    console.log('Actor output:');
    console.dir(output);
    await Apify.setValue('OUTPUT', output);
});