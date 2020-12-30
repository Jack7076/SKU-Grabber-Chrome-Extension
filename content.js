console.log("[MITS - Dear] Plugin Injected into Page.");

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse){
    console.log(`[MITS - Dear] Plugin sent command: `, request);
    switch(request.task){
        case "getWebsite":
            sendResponse({url: window.location.host, uri: window.location.href});
            break;
        case "getElementContent":
            var response = {inner: document.getElementById(request.element).innerHTML, value: document.getElementById(request.element).value};
            console.log(`[MITS - Dear] Responding with: `, response)
            sendResponse(response);
            break;
        default:
            break;
    }
});