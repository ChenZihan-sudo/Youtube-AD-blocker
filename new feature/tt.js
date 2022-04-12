// ==UserScript==
// @name         屏蔽所有Youtube广告 Youtube AD blocker (Block all ad). Including blocking Youtube Music.   
// @name:zh-CN   屏蔽所有Youtube广告 包括Youtube Music
// @namespace    https://github.com/ChenZihan-sudo/Youtube-AD-blocker/
// @version      0.4.1
// @description  Block all video ads, insert ads, page ads. Including Youtube Music. 屏蔽所有视频广告、插入广告、页面广告。包括Youtube Music
// @description:zh-CN  屏蔽所有视频广告、插入广告、页面广告
// @author       ChenZihan
// @match        *.youtube.com/*
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