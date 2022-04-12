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
rmAry = new Array();
href = location.href;

setInterval(() => {
    let bufHref = location.href; //detect the change of href and execute 
    let detectAd; //detect the activity of insert ad
    if (document.getElementsByClassName("ytp-ad-preview-text").length != 0) {
        detectAd = (document.getElementsByClassName("ytp-ad-preview-text")[0].innerHTML.constructor == String);
    }

    if (bufHref != href || detectAd == true) {
        console.log("[YT AD block] Detect the change of href", bufHref);
        href = bufHref;
        //executeManager('f');
    }
}, 500);

if (location.hostname.search("youtube") != -1) {


    addBData('id', 'player-ads', 'f'); //add data
    addBData('path', '#YtKevlarVisibilityIdentifier', 'f');
    addBData('class', 'ytp-ad-overlay-container', 'a');
    addBData('csClick', [['ytp-ad-feedback-dialog-reason-input', 'randomPara(0, 2)'], ['ytp-ad-feedback-dialog-confirm-button', '0'], 1], 'f');
    addBData('tag', 'ytd-display-ad-renderer', 'a');
    addBData('csClick', [['ytp-ad-skip-button', '0'], 0], 'a');
    addBData("exe", "console.log('ok');", 'a');


    // {
    //     fi = window.frames.length - 1;
    //     identifier = "window.frames[" + fi + "]";

    //     addUniData([
    //         ['csClick', ['ytp-ad-button-icon', '0'], ['try-catch', 'catch-true', "window.frames[window.frames.length - 1].document"]],
    //         ['exe', ["document.getElementsByTagName('yt-about-this-ad-renderer')[0]", ".parentElement.style = 'display:none'"]],
    //         ['exe', ["document.getElementsByTagName('tp-yt-iron-overlay-backdrop')[0]", ".style = 'display:none'"]],
    //         ['exe', [identifier, ".document.childNodes[1].childNodes[1].childNodes[2].childNodes[0].childNodes[0].childNodes[1].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[1].childNodes[0].childNodes[0].click()"]],
    //         ['exe', [identifier, ".document.childNodes[1].childNodes[1].childNodes[9].childNodes[0].childNodes[1].childNodes[1].childNodes[0].childNodes[0].childNodes[1].childNodes[1].childNodes[0].click()"]],
    //         ['exe', ["document.getElementsByTagName('tp-yt-iron-overlay-backdrop')[0]", ".parentElement.style = 'display'"]],
    //         ['exe', ["skipFixedAD();console.log('FixExecuted.');"]]
    //     ], 'f');
    // }



    executeManager(); //execute at first time
}


/**
 * @param exePara (undefined) or ('f' => execute the data for 20 times, every time interval 500ms )
 * */
function executeManager(exePara) {
    let len = rmAry.length;

    for (let i = 0; i < len; i++) {
        if (rmAry[i][2] == 'a' && exePara == undefined) {

            setInterval(() => {
                console.log("[YT AD block] Execute remove insert AD loop");
                execute(); //always execute the data
            }, 800);

        } else if (rmAry[i][2] == 'f' || exePara == 'f') { //execute only in first time

            console.log("[YT AD block] Execute remove AD");

            window.onload = function () { intervalExecute(); } //if player already load
            if (exePara == 'f') { intervalExecute(); }

            function intervalExecute() {
                let times = 0;
                let timer = setInterval(() => {
                    times++; if (times > 20) { clearInterval(timer); };
                    execute(); //excute 20 times in every 500ms
                }, 500);
            }
        }

        function execute() {
            let isUniExeTag = rmAry[i][0] == "universal"; //Check is universal tag or not
            if (!isUniExeTag) {
                let exeTag = rmAry[i][0]; //Execute Type
                let exeData = rmAry[i][1]; //Data container of execute type
                executeBase(exeTag, exeData);
            } else {
                //[Beta] Execute Type: universal
                let exeLength = rmAry[i][1].length;
                for (let layeri = 0; layeri < exeLength; layeri++) {
                    let layerExeData = rmAry[i][1][layeri];
                    let exeTag = layerExeData[0];
                    let exeData = layerExeData[1];
                    executeBase(layerExeData, exeTag, exeData);
                }
            };
        }


        function executeBase(exeTag, exeData, handleData) {
            let cckClassDataPosi, cckType;
            switch (exeTag) {
                case 'id': idRm(exeData);
                    break;
                case 'path': pathRm(exeData);
                    break;
                case 'class': classRm(exeData);
                    break;
                case 'csClick':
                    {
                        len = handleData.length - 1; //find last one num
                        cckClassDataPosi = handleData[len];
                        cckType = handleData[len].constructor;
                        if (cckType == Number) {
                            cckCs = handleData[cckClassDataPosi][0];
                        } else if (cckType == String || cckType == Array) {
                            cckCs = handleData[2];
                        }
                        csClick(cckCs, rmAry[i][1]);
                    }
                    break;
                case 'tag': tagRm(exeData);
                    break;
                case 'exe': { dataExe(exeData); console.log("!!!!!!!!!!!dataExe"); }
                    break;
            }

        }
    }
}

function addUniData(d2, d3) {
    addBData('universal', d2, d3);
}

function addExeData(d2, d3) {
    addBData('exe', d2, d3);
}

/**
 * @param d1 - Execute Type: 'id' => Use document.getElementById() to remove
 * @param d1 - Execute Type: 'path' => Use document.querySelector() to remove
 * @param d1 - Execute Type: 'class' => Use document.getElementsByClassName() to remove 
 * @param d1 - Execute Type: 'csClick' => css click event
 * @param d1 - Execute Type: 'tag' => Use document.getElementsByTagName() to remove
 * @param d1 - Execute Type: 'exe' => Use eval to execute the code
 * @param d2 - Data container of d1 execute type
 * @param d3 - 'a' => Always execute the data, interval 800ms
 * @param d3 - 'f' => First execute the data for 20 times, every time interval 500ms
 */
function addBData(d1, d2, d3) {
    let len = apdAry(rmAry);
    rmAry[len][0] = d1;
    rmAry[len][1] = d2;
    rmAry[len][2] = d3;
    rmAry[len][3] = rmAry.length - 1;
}

function csClick(cckCs, exAry) {
    let isEnter = false;
    if (cckCs.constructor == Array) {
        switch (cckCs[0]) {
            case 'check':
                if ((cckCs[1] == cckCs[2]) == cckCs[3]) {
                    isEnter = true;
                    console.log("PPPPPPPPPPPPPPPP");
                }
                break;
            case 'try-catch':
                {
                    if (cckCs[1] == 'catch-true')
                        try {
                            eval(cckCs[2]);
                        } catch {
                            isEnter = true;
                        }
                }
                break;
        }
    } else if (document.getElementsByClassName(cckCs).length != 0) {
        isEnter = true;
        console.log("AAAAAAAAAAAAAAAAAAA");
    }

    if (isEnter) {
        let len = exAry.length;
        for (let i = 0; i < len; i++) {

            if (exAry[i].constructor != Array) { break; } //cck data type
            if (document.getElementsByClassName(exAry[i][0])[eval(exAry[i][1])].length != 0) {
                console.log(exAry[i][0], exAry[i][1]);
                document.getElementsByClassName(exAry[i][0])[eval(exAry[i][1])].click(); //choose feedback option
            }
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

function dataExe(exeData) {
    if (eval(exeData[0]) != (undefined || null)) {
        let finalData = exeData[0] + exeData[1];
        eval(finalData);
    }
}

function randomPara(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function apdAry(ary) {
    ary.splice(ary.length, 0, []);
    return ary.length - 1;
}


/*————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
 Thanks for the contribution at https://github.com/ChenZihan-sudo/Youtube-AD-blocker/pull/2
 Author: Naccl
 Link: https://github.com/Naccl
 Function: skipFixedAD()
————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————*/
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
                        //But ComputedStyle has not change event, MutationObserver can't do it.
                        let okTipsTimer = setInterval(() => {
                            //If the feedback is done, it will change from 'none' to 'flex'.
                            const finishedTipsDisplay = getComputedStyle(document.evaluate('/html/body/c-wiz/div/div/div[2]/div[1]', iframeDocument).iterateNext(), null).display;
                            if (finishedTipsDisplay !== 'none') {
                                clearInterval(okTipsTimer);
                                //Finished, close the iframe, the video will continue automatically.
                                document.evaluate('/html/body/c-wiz/div/div/div[1]/div[2]/div/button', iframeDocument).iterateNext().click();
                            }
                        }, 50);
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
//————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————