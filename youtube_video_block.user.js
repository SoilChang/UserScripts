// ==UserScript==
// @name         youtube blacklist 
// @namespace   wawedo
// @include     https://www.youtube.com/*
// @version     1
// @grant       none
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @grant       GM_addStyle
// ==/UserScript==

(function() {
    'use strict';
    'allow pasting';
    var debug = true;
    var probationDay = 7;
    var currentURL = "";
    var blacklist = { "OPf0YbXqDm0" : "uptown funk" };


    //create button black list button
    var buttonSets = document.createElement('div');
    // buttonSets.innerHTML = '<button id="addtoBL" type="button" class="GM_button" > Banish </button><button id="clear" class="GM_button" type="button" > Free all demon </button><button id="display" class="GM_button" type="button" > show all demon </button>';
    buttonSets.innerHTML = multilineStr(function(){/*
        <button id="addtoBL" type="button" class="GM_button" > Banish </button>
        <button id="clear" class="GM_button" type="button" > Free all demons </button>
        <button id="display" class="GM_button" type="button" > show all demons </button>

    */});
    
    document.querySelector("#yt-masthead-user").appendChild(buttonSets);
    document.getElementById("addtoBL").addEventListener("click",addtoBlakclist,false);
    document.getElementById("clear").addEventListener("click",clearBlacklist,false);  
    document.getElementById("display").addEventListener("click",displayBlacklist,false);  

    //========================  CSS ===============================================
    GM_addStyle ( multilineStr ( function () {/*!
        #addtoBL {
            background-color:red;
        }
        #clear {
            background:green;
        }
        

        .GM_button{
            z-index: 10000;
            cursor: pointer;
            border: 1px black solid;

        }
    */} ) );
    function multilineStr (dummyFunc) {
        var str = dummyFunc.toString ();
        str     = str.replace (/^[^\/]+\/\*!?/, '') // Strip function () { /*!
                .replace (/\s*\*\/\s*\}\s*$/, '')   // Strip */ }
                .replace (/\/\/.+$/gm, '') // Double-slash comments wreck CSS. Strip them.
                ;
        return str;
    }
    

    // ======================================== functionality starts===============================================
    

    // update function, activated every 4 seconds
	setInterval(function(){

        // 1. check url change
		if( window.location.href != currentURL){
			checkBlacklist();
			currentURL = window.location.href;
		}
		
	},4000);
    
    //     getCookieBlacklist();
    //     for(var i in blacklist){
    //       if(window.location.href.indexOf(blacklist[i])> -1){
    //         nextLink();
    //       }
    // }
    function checkBlacklist(){
        getCookieBlacklist();
        for(var key in blacklist){
          if(blacklist.hasOwnProperty(key)){
            if(window.location.href.indexOf(key)>-1){
                if(debug) console.log("blacklisted video found");
                nextLink();
                break;
            }
          }
        }
    }

    //when clicked with button add to black list and jump to next song
    function addtoBlakclist(){
        var url = window.location.href;
        var videoId = url.substring(url.indexOf("=")+1);
        addBlacklistCookie(videoId, probationDay);
        if(debug) console.log("VideoID = '"+videoId+"' added to blacklist");
        nextLink();
    }


    function nextLink(){
        if(debug) console.log("start of nextLink()");
        //select next video button
        var nextUrl = "";
        try{
            nextUrl = document.getElementsByClassName("autoplay-bar")[0].getElementsByTagName("a")[0].href;
            if(debug) console.log("next URL"+nextUrl);
        }catch(err){
            if(debug) alert("Fail to jump to next video because next URl isn't found");
        }

        if(nextUrl){
            window.location.href = nextUrl;

        }
    }

    function addBlacklistCookie(cname, exdays) {
        var title = '';
        try{
            title = document.getElementById("eow-title").title;
        }catch(err){
            if(debug) console.log("addToBlacklist fail to get title");
        }
        title = title || "unknown";
        var name = "BlackList_"+cname;
        var cvalue = title;
        setCookie(name,cvalue,exdays);
    } 


    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    }

    function getCookieBlacklist(){
        var allCookies = document.cookie.split(';');
        // clear blacklist first then re-populate
        blacklist = {};
        for(var i=0; i< allCookies.length; i++){
            var each = allCookies[i];
            while(each.charAt(0)==" "){
                each = each.substring(1);
            }
            if(each.indexOf("BlackList_") > -1){
                // blacklist.push(each.substring(10,20));
                // nameList.push(each.substring(21));
                var Id = each.substring(10,20);
                var title = each.substring(22);
                // add the data to blacklist
                blacklist[Id] = title; 
            }
        }
    }

    function clearBlacklist(){
        var allCookies = document.cookie.split(';');
        // clear list first then re-populate
        for(var i=0; i< allCookies.length; i++){
            var each = allCookies[i];
            while(each.charAt(0)==" "){
                each = each.substring(1);
            }
            if(each.indexOf("BlackList_") > -1){
                document.cookie = each+"; "+ "expires=Thu, 01 Jan 1970 00:00:00 UTC";
            }
        }
        if(debug)console.log("current cookies:\n"+document.cookie);
        alert("clear!");
    }

    function displayBlacklist(){
        getCookieBlacklist();
        var count = 1
        if(  _isEmpty(blacklist) ){
            console.log("No demon found!");
        }else{
            for(var key in blacklist){
                if(blacklist.hasOwnProperty(key)){
                    console.log(count+"."+key+" = "+blacklist[key]);
                    count++;
                }
                
            }
        }
    }

    // check if an object is empty
    function _isEmpty(obj) {
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop))
                return false;
        }
        return true;
    }
   
})(); //The end of the code