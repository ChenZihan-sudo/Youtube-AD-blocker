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
(function () {
    let rmAry = new Array();
    let { href } = location;

    setInterval(() => {
        // console.log("execute");
        let bufHref = location.href; //detect the change of href and execute 
        let detectAd; //detect the activity of insert ad
        if (document.getElementsByClassName("ytp-ad-preview-text").length) {
            detectAd = (document.getElementsByClassName("ytp-ad-preview-text")[0].innerHTML.constructor == String);
        }

        if (bufHref != href || detectAd) {
            console.log("[YT AD block] Detect the change of href", href);
            href = bufHref;
            executeManager('f');
            // frameworkAlreadyAdded = false; //From close video AD, change the frameworkAlreadyAdded to be false when href changed.
        }
    }, 500);

    if (location.hostname.search("youtube") != -1) {

        // action - companion - ad - info - button
        addBData('id', 'player-ads', 'f'); //add data
        addBData('id', 'masthead-ad', 'f');
        addBData('path', '#YtKevlarVisibilityIdentifier', 'f');
        addBData('class', 'ytp-ad-overlay-container', 'a');
        addBData('csClick', [['ytp-ad-feedback-dialog-reason-input', 'randomPara(0, 2)'], ['ytp-ad-feedback-dialog-confirm-button', '0'], 1], 'f');
        addBData('tag', 'ytd-display-ad-renderer', 'a');
        addBData('csClick', [['ytp-ad-skip-button', '0'], 0], 'a');
        // addBData("exe", "skipFixedAD();frameworkAlreadyAdded = true;", 'f');
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

                window.onload = function () { intervalExecute(); } //if player already load
                if (exePara == 'f') { intervalExecute(); }
                intervalExecute();
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
                    case 'id': idRm(exeData);
                        break;
                    case 'path': pathRm(exeData);
                        break;
                    case 'class': classRm(exeData);
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
                    case 'tag': tagRm(exeData);
                        break;
                    case 'exe': { dataExe(exeData); }
                        break;
                    case 'remTactic1': {
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

    // var frameworkAlreadyAdded = false;
    // function optimizeUserExperience(type) {
    //     if (type == 1) {
    //         //Let user can't see this about ad card
    //         let adCard = document.getElementsByTagName("yt-about-this-ad-renderer")[0];
    //         if (adCard) { adCard.style.display = "none"; };

    //         //Let user can't see this backdrop
    //         let backdrop = document.getElementsByTagName("tp-yt-iron-overlay-backdrop")[0];
    //         if (backdrop) { backdrop.style.display = "none"; }
    //     }

    //     if (type == 2) {
    //         //Check the current path
    //         if (location.pathname.search("watch") != -1) {
    //             //click the play button when it load fininshed, avoid stopping in ad video. 
    //             let playButton = document.getElementsByClassName("ytp-play-button")[0];
    //             let isClick = document.getElementsByClassName("ytp-ad-preview-container").length;
    //             if (playButton && isClick) { playButton.click(); }
    //         }
    //     }

    //     if (type == 3) {
    //         //Set backdrop can be seen when ad is removed
    //         let backdrop = document.getElementsByTagName("tp-yt-iron-overlay-backdrop")[0];
    //         if (!backdrop) {
    //             backdrop.style.display = "";
    //         }
    //     }
    // }


    // /*————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
    //  Thanks for the contribution at https://github.com/ChenZihan-sudo/Youtube-AD-blocker/pull/2
    //  Author: Naccl
    //  AuthorLink: https://github.com/Naccl
    //  Function: skipFixedAD()
    // ————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————*/
    // function skipFixedAD() {
    //     if (!frameworkAlreadyAdded) {
    //         console.log("triggered2");
    //         let adClickable, times = 0;
    //         let timer = setInterval(() => {
    //             //open the feedback iframe
    //             times++;
    //             adClickable = document.getElementsByClassName('ytp-ad-clickable').length;
    //             if (adClickable || times > 20) {
    //                 clearInterval(timer);
    //             };
    //         }, 500);

    //         if (adClickable) {
    //             optimizeUserExperience(1);
    //             console.log("triggered3");

    //             document.getElementsByClassName('ytp-ad-clickable')[0].click();

    //             const observerInit = { childList: true, subtree: true };

    //             //In the first time, wo should detect the iframe element.
    //             //After the first time, the iframe element will always exist.
    //             const iframeObserver = new MutationObserver(() => {
    //                 console.log("triggered4");
    //                 const iframe = document.getElementById('iframe');
    //                 if (iframe) {
    //                     iframeObserver.disconnect();

    //                     function iframeLoaded() {
    //                         iframe.removeEventListener('load', iframeLoaded, true);

    //                         //get feedback iframe document
    //                         const iframeDocument = iframe.contentWindow.document;
    //                         //click feedback button to open the confirm dialog (the element id or class are random, so we need XPath)
    //                         document.evaluate('/html/body/c-wiz/div/div/div[2]/div[2]/div/div[1]/div[1]/div/div[2]/div[2]/div/button', iframeDocument).iterateNext().click();

    //                         const iframeBody = document.evaluate('/html/body', iframeDocument).iterateNext();
    //                         const okBtnObserver = new MutationObserver(() => {
    //                             //get ok button after dialog created
    //                             const okBtn = document.evaluate('/html/body/div[2]/div/div[2]/span/div/div/div[2]/div[2]/button', iframeDocument).iterateNext();
    //                             if (okBtn) {
    //                                 okBtnObserver.disconnect();
    //                                 okBtn.click();

    //                                 //There may be delay and we need to detect the ok tips.
    //                                 //But ComputedStyle has not change event, MutationObserver can't do it.
    //                                 let okTipsTimer = setInterval(() => {
    //                                     //If the feedback is done, it will change from 'none' to 'flex'.
    //                                     const finishedTipsDisplay = getComputedStyle(document.evaluate('/html/body/c-wiz/div/div/div[2]/div[1]', iframeDocument).iterateNext(), null).display;
    //                                     if (finishedTipsDisplay !== 'none') {
    //                                         clearInterval(okTipsTimer);
    //                                         //Finished, close the iframe, the video will continue automatically.
    //                                         document.evaluate('/html/body/c-wiz/div/div/div[1]/div[2]/div/button', iframeDocument).iterateNext().click();
    //                                         // optimizeUserExperience(2); //click the play button when it load fininshed, avoid stopping in ad video. 
    //                                         // optimizeUserExperience(3); //reset the backdrop element
    //                                     }
    //                                 }, 50);
    //                             }
    //                         });
    //                         okBtnObserver.observe(iframeBody, observerInit);
    //                     }
    //                     //listen for the iframe element load event
    //                     iframe.addEventListener('load', iframeLoaded, true);
    //                 }
    //             });
    //             iframeObserver.observe(document, observerInit);
    //         };
    //     }
    // }
    // //————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
})();

