// ==UserScript==
// @name         Youtube AD blocker (Block all ad)
// @name:zh-CN   Youtube屏蔽所有广告   
// @namespace    https://github.com/ChenZihan-sudo/Youtube-AD-blocker/
// @version      0.4
// @description  Block all video ads, insert ads, page ads
// @description:zh-CN  屏蔽所有视频广告、插入广告、页面广告
// @author       ChenZihan
// @match        https://*.youtube.com/*
// @icon         
// @grant        none
// ==/UserScript==
let rmAry = new Array();
let { href } = location;

setInterval(() => {
    let bufHref = location.href; //detect the change of href and execute 
    let detectAd; //detect the activity of insert ad
    if (document.getElementsByClassName("ytp-ad-preview-text").length != 0) {
        detectAd = (document.getElementsByClassName("ytp-ad-preview-text")[0].innerHTML.constructor == String);
    }

    if (bufHref != href || detectAd == true) {
        console.log("[YT AD block] Detect the change of href");
        href = bufHref;
        executeManager('f');
    }
}, 500);

if (location.hostname.search("youtube") != -1) {
    addBData('id', 'player-ads', 'f'); //add data
    addBData('path', '#YtKevlarVisibilityIdentifier', 'f');
    addBData('class', 'ytp-ad-overlay-container', 'a');
    addBData('csClick', [['ytp-ad-feedback-dialog-reason-input', 'randomPara(0, 2)'], ['ytp-ad-feedback-dialog-confirm-button', '0'], 1], 'f');
    addBData('tag', 'ytd-display-ad-renderer', 'a');
    addBData('csClick', [['ytp-ad-skip-button', '0'], 0], 'a');

    executeManager(); //execute at first time

    // if (location.pathname.search("/watch") >= 0) {}
}

function executeManager(exePara) {
    let len = rmAry.length;

    for (let i = 0; i < len; i++) {
        if (rmAry[i][2] == 'a' && exePara == undefined) {

            setInterval(() => {
                console.log("[YT AD block] Execute remove insert AD loop");
                execute();
            }, 800);

        } else if (rmAry[i][2] == 'f' || exePara == 'f') { //use func('f') only execute first time needed 


            console.log("[YT AD block] Execute remove AD");

            window.onload = function () { intervalExecute(); } //if player already load
            if (exePara == 'f') { intervalExecute(); }
            intervalExecute();
            function intervalExecute() {
                let times = 0;
                let timer = setInterval(() => {
                    times++; if (times > 20) { clearInterval(timer); };
                    execute();//excute 20 times in every 500ms
                }, 500);
            }

        }

        function execute() {
            let exeData = rmAry[i][1];
            let cckClassDataPosi, cckType;

            switch (rmAry[i][0]) {
                case 'id': idRm(exeData);
                    break;
                case 'path': pathRm(exeData);
                    break;
                case 'class': classRm(exeData);
                    break;
                case 'csClick':
                    len = rmAry[i][1].length - 1; //find last one num
                    cckClassDataPosi = rmAry[i][1][len];
                    cckType = rmAry[i][1][len].constructor;

                    if (cckType == Number) {
                        cckCs = rmAry[i][1][cckClassDataPosi][0];
                    } else if (cckType == String) {
                        cckCs = rmAry[i][1][2];
                    }

                    csClick(cckCs, rmAry[i][1]);
                    break;
                case 'tag': tagRm(exeData);
                    break;
            }
        }
    }
}

function addBData(d1, d2, d3) {
    let len = apdAry(rmAry);
    rmAry[len][0] = d1;
    rmAry[len][1] = d2;
    rmAry[len][2] = d3;
    rmAry[len][3] = rmAry.length - 1;
}

function csClick(cckCs, exAry) {
    if (document.getElementsByClassName(cckCs).length != 0) {
        let len = exAry.length;
        for (let i = 0; i < len; i++) {
            if (exAry[i].constructor != Array) { break; } //cck data type
            document.getElementsByClassName(exAry[i][0])[eval(exAry[i][1])].click(); //choose feedback option
        }
    }
}

function classRm(_class) {
    let times = 0;
    while (document.getElementsByClassName(_class).length != 0) {
        times++; if (times > 100) { break; }
        document.getElementsByClassName(_class)[0].remove();
    }
}

function idRm(id) {
    if (document.getElementById(id) != null) {
        document.getElementById(id).remove();
    }
}

function pathRm(path) {
    if (document.querySelector(path) != null) {
        document.querySelector(path).remove();
    }
}

function tagRm(tag) {
    let times = 0;
    while (document.getElementsByTagName(tag).length != 0) {
        times++; if (times > 100) { break; }
        document.getElementsByTagName(tag)[0].parentNode.parentNode.remove();
    }
}

function randomPara(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function apdAry(ary) {
    ary.splice(ary.length, 0, []);
    return ary.length - 1;
}

function skipFixedAD() {
    //open the feedback iframe
    document.getElementsByClassName('ytp-ad-clickable')[0].click();
    const observerInit = { childList: true, subtree: true };

    //In the first time, wo should detect the iframe element.
    //After the first time, the iframe element will always exist.
    const iframeObserver = new MutationObserver(() => {
        const iframe = document.getElementById('iframe');
        if (iframe) {
            iframeObserver.disconnect();

            function iframeLoaded() {
                iframe.removeEventListener('load', iframeLoaded, true);

                //get feedback iframe document
                const iframeDocument = iframe.contentWindow.document;
                //click feedback button to open the confirm dialog (the element id or class are random, so we need XPath)
                document.evaluate('/html/body/c-wiz/div/div/div[2]/div[2]/div/div[1]/div[1]/div/div[2]/div[2]/div/button', iframeDocument).iterateNext().click();

                const iframeBody = document.evaluate('/html/body', iframeDocument).iterateNext();
                const okBtnObserver = new MutationObserver(() => {
                    //get ok button after dialog created
                    const okBtn = document.evaluate('/html/body/div[2]/div/div[2]/span/div/div/div[2]/div[2]/button', iframeDocument).iterateNext();
                    if (okBtn) {
                        okBtnObserver.disconnect();
                        okBtn.click();
                        
                        //There may be delay and we need to detect the ok tips.
                        const okTipsObserver = new MutationObserver(() => {
                            //If the feedback is done, it will change from 'none' to 'flex'.
                            const finishedTipsDisplay = getComputedStyle(document.evaluate('/html/body/c-wiz/div/div/div[2]/div[1]', iframeDocument).iterateNext(), null).display;
                            if (finishedTipsDisplay !== 'none') {
                                okTipsObserver.disconnect();
                                //Finished, close the iframe, the video will continue automatically.
                                document.evaluate('/html/body/c-wiz/div/div/div[1]/div[2]/div/button', iframeDocument).iterateNext().click();
                            }
                        });
                        okTipsObserver.observe(iframeBody, observerInit);
                    }
                });
                okBtnObserver.observe(iframeBody, observerInit);
            }
            //listen for the iframe element load event
            iframe.addEventListener('load', iframeLoaded, true);
        }
    });
    iframeObserver.observe(document, observerInit);
}
