// ==UserScript==
// @name         屏蔽所有Youtube广告 Youtube AD blocker (Block all ad). Including blocking Youtube Music.   
// @name:zh-CN   屏蔽所有Youtube广告 包括Youtube Music
// @namespace    https://github.com/ChenZihan-sudo/Youtube-AD-blocker/
// @version      0.5 [Beta]
// @description  Block all video ads, insert ads, page ads. Including Youtube Music. 屏蔽所有视频广告、插入广告、页面广告。包括Youtube Music
// @description:zh-CN  屏蔽所有视频广告、插入广告、页面广告
// @author       ChenZihan
// @match        *.youtube.com/*
// @icon
// @grant        none
// ==/UserScript==

(function() {
    let rmAry = new Array();
    let { href } = location;

    setInterval(() => {
        let bufHref = location.href; //detect the change of href and execute 

        let detectBasicAd; //detect the activity of insert ad in video
        if (document.getElementsByClassName("ytp-ad-preview-text").length) {
            detectBasicAd = (document.getElementsByClassName("ytp-ad-preview-text")[0].innerHTML.constructor == String);
        }

        //* skipShitVideoAD() can only reset by change of href
        //! check if the frame exist
        if (bufHref != href && document.getElementById("iframe")) {
            isCallSkipShitVideoAD = false;
        }

        //* check change of href
        if (bufHref != href) {
            console.log("[YT AD block] Detect the change of href.", href);
            href = bufHref;
            executeManager('f');
        }

        //* check the insert AD
        if (detectBasicAd) {
            console.log("[YT AD block] Found the insert AD.");
            executeManager('f');
        }
    }, 500);

    if (location.hostname.search("youtube") != -1) {
        addBData('id', 'player-ads', 'f'); //add data
        addBData('id', 'masthead-ad', 'f');
        addBData('path', '#YtKevlarVisibilityIdentifier', 'f');
        addBData('class', 'ytp-ad-overlay-container', 'a');
        addBData('csClick', [
            ['ytp-ad-feedback-dialog-reason-input', 'randomPara(0, 2)'],
            ['ytp-ad-feedback-dialog-confirm-button', '0'], 1
        ], 'f');
        addBData('csClick', [
            ['ytp-ad-skip-button', '0'], 0
        ], 'a');
        addBData('tag', 'ytd-display-ad-renderer', 'a');
        addBData("exe", "skipShitVideoAD();", 'f');
        addBData("exe", "addBlockText();", 'f');
        addBData("remTactic1", ["badge-style-type-ad", 7, "ytd-section-list-renderer"], 'f');
        addBData("remTactic1", ["badge-style-type-ad", 5, "ytd-item-section-renderer"], 'f');
        addBData("remTactic1", ["badge-style-type-ad", 5, "ytd-watch-next-secondary-results-renderer"], 'f');

        executeManager(); //execute at first time
    }


    /**
     * @param {String} exePara (undefined) or ('f' => execute the data for 20 times, every time interval 500ms )
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

                window.onload = function() { intervalExecute(); } //if player already load
                if (exePara == 'f') { intervalExecute(); }
                intervalExecute();

                function intervalExecute() {
                    let times = 0;
                    let timer = setInterval(() => {
                        times++;
                        if (times > 20) { clearInterval(timer); };
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
                    // let exeLength = rmAry[i][1].length;
                    // for (let layeri = 0; layeri < exeLength; layeri++) {
                    //     let layerExeData = rmAry[i][1][layeri];
                    //     let exeTag = layerExeData[0];
                    //     let exeData = layerExeData[1];
                    //     executeBase(layerExeData, exeTag, exeData);
                    // }
                };
            }


            function executeBase(exeTag, exeData) {
                let cckClassDataPosi, cckType, cckCs;
                switch (exeTag) {
                    case 'id':
                        idRm(exeData);
                        break;
                    case 'path':
                        pathRm(exeData);
                        break;
                    case 'class':
                        classRm(exeData);
                        break;
                    case 'csClick':
                        {
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
                        }
                    case 'tag':
                        tagRm(exeData);
                        break;
                    case 'exe':
                        { dataExe(exeData); }
                        break;
                    case 'remTactic1':
                        {
                            let className = exeData[0];
                            let parentNum = exeData[1];
                            let expParentClassName = exeData[2];
                            remTactic1(className, parentNum, expParentClassName);
                        }
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
     * @param d1 - Execute Type: 'remTactic1' => See remTactic1();
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

    /**
     * By finding a className to find higher level of its parent element by class name and remove it
     * @param {String} className The child node class name (signature class name recommend)
     * @param {Number} parentNum How many node layers it parent elements have to get className(child node)
     * @param {String} expParentClassName The parent node class name(signature class name recommend)
     */
    function remTactic1(className, parentNum, expParentClassName) {
        var sl_length = document.getElementsByClassName(className).length;
        if (sl_length != 0) {
            if (parentNum == 0) {
                var len = document.getElementsByClassName(className).length;
                for (let i = 0; i < len; i++) {
                    document.getElementsByClassName(className)[0].remove();
                }
            } else {
                for (var s_i = 0; s_i < sl_length; s_i++) {
                    var parent = ".parentElement";
                    var finalParent = "";
                    for (var p_i = 0; p_i < parentNum; p_i++) {
                        finalParent = finalParent + parent;
                    }

                    //Find the parent name
                    var parentNode = "document.getElementsByClassName('" + className + "')[0]" + finalParent;
                    var parentNodeClassListLength = eval(parentNode + ".classList.length");
                    var isParentClassName = false;
                    for (let ii = 0; ii < parentNodeClassListLength; ii++) {
                        var parentClassName = eval(parentNode + ".classList[" + ii + "]");
                        if (parentClassName == expParentClassName) {
                            isParentClassName = true;
                            break;
                        }
                    }

                    if (isParentClassName) {
                        eval("document.getElementsByClassName('" + className + "')[0]" + finalParent + ".remove();");
                        remTactic1(className, parentNum, expParentClassName);
                        break;
                    }
                }
            }
        }
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
            times++;
            if (times > 100) { break; }
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
            times++;
            if (times > 100) { break; }
            document.getElementsByTagName(tag)[0].parentNode.parentNode.remove();
        }
    }

    function dataExe(exeData) {
        if (exeData) {
            let isArray = exeData.constructor == Array;
            if (!isArray) {
                eval(exeData);
            } else {
                //[Beta Test] Execute Type: universal
                if (exeData[0]) {
                    let finalData = exeData[0] + exeData[1];
                    eval(finalData);
                }
            }
        }
    }

    function randomPara(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function apdAry(ary) {
        ary.splice(ary.length, 0, []);
        return ary.length - 1;
    }

    function addBlockText() {
        //本屏蔽器自带嘲讽功能[doge]
        if (document.getElementById("ad-text:a")) { document.getElementById("ad-text:a").innerHTML = "Trying Blocking AD..."; }
        if (document.getElementById("ad-text:b")) { document.getElementById("ad-text:b").innerHTML = "[Youtube AD block]"; }
        let blockText = document.getElementsByClassName("ytp-ad-button-text");
        if (blockText) {
            for (let i = 0; i < blockText.length; i++) {
                blockText[i].innerHTML = "Blocking..."
            }
        }
    }

    var isCallSkipShitVideoAD = false;

    function skipShitVideoAD() {
        if (document.getElementsByClassName("ytp-ad-button-icon") && !isCallSkipShitVideoAD && !document.getElementsByClassName('ytp-ad-skip-button').length) {
            console.log("进入执行");

            isCallSkipShitVideoAD = true; //set identifier as true to avoid call this function again

            console.log("===>", new DocumentTimeline().currentTime);

            //Open the shit ad card
            document.getElementsByClassName("ytp-ad-button-icon")[0].click();

            // Wait the card load
            let shitIframeTimes = 0;
            let iframeDomPosi = 0; //find the iframe document posi 
            let shitIframeTimer = setInterval(function() {
                shitIframeTimes++;

                // setDisplay("none");

                if (document.getElementById("iframe") || shitIframeTimes > 50) {
                    console.log("[YT] Detected the ad penel");
                    //find the iframe document posi 
                    for (let i = 0; i < window.frames.length; i++) {
                        let frameId = "iframe";
                        try {
                            if (window.frames[i].frameElement.id == frameId) {
                                iframeDomPosi = i;
                                break;
                            }
                        } catch (e) { /*console.log(e);*/ }
                    }
                    clearInterval(shitIframeTimer);
                }
            }, 40);

            //Wait for document loaded
            let waitCardTimes = 0;
            let frameDom;
            let waitCardTimer = setInterval(() => {
                waitCardTimes++;

                let bodyNodesLength = 0; //iframe body length of child node
                try {
                    bodyNodesLength = window.frames[iframeDomPosi].document.body.childNodes.length;
                } catch {}

                if (waitCardTimes > 400 || bodyNodesLength != 0) {
                    //get the iframe document
                    frameDom = window.frames[iframeDomPosi].document;

                    try {
                        let shitStopDisplayBtn = frameDom.childNodes[1].childNodes[1].childNodes[2].childNodes[0].childNodes[0].childNodes[1].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[1].childNodes[0].childNodes[0];
                        shitStopDisplayBtn.click();

                        let deleteClickTimes = 0;
                        let deleteClickTimer = setInterval(() => {
                            deleteClickTimes++;
                            let isCatchErr = false;
                            try {
                                let clickStopAdBtn = frameDom.childNodes[1].childNodes[1].childNodes[9].childNodes[0].childNodes[1].childNodes[1].childNodes[0].childNodes[0].childNodes[1].childNodes[1].childNodes[0];
                                clickStopAdBtn.click();
                                console.log("获取到移除按钮，移除", clickStopAdBtn);
                                console.log("===>", new DocumentTimeline().currentTime);

                                let closeShitPanelBtn = frameDom.childNodes[1].childNodes[1].childNodes[2].childNodes[0].childNodes[0].childNodes[0].childNodes[2].childNodes[0].childNodes[0];
                                closeShitPanelBtn.click();
                            } catch (e) {
                                isCatchErr = true;
                                console.log("错误捕获");
                            }

                            if (deleteClickTimes > 40 || isCatchErr == false) {
                                clearInterval(deleteClickTimer);
                            }

                        }, 50);


                    } catch (e) { console.log("2", e); }

                    //[Beta]
                    // setTimeout(() => {
                    //     document.getElementsByTagName("tp-yt-iron-overlay-backdrop")[0].style.display = "";
                    //     console.log("reback display");
                    // }, 3000);

                    clearInterval(waitCardTimer);
                }
            }, 50);

            function setDisplay(str) {
                //* Set the shit backdrop display "none" or ""
                try { document.getElementsByTagName("tp-yt-iron-overlay-backdrop")[0].style.display = str; } catch {}

                //* Set the shit ad card display "none" or ""
                try { document.getElementById("iframe").parentNode.parentNode.style.display = str; } catch {}
            }
        }
    }
})();