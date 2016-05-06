// ==UserScript==
// @name         youtube blacklist 
// @namespace   wawedo
// @include     https://www.youtube.com/*
// @version     1
// @grant       none
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @grant       GM_addStyle
// ==/UserScript==


// changes to be made
// 5. Let user do more setting. eg: probabtion day, free individual demon, view all demons in the panel
// 6. fix if user click button outside song page
(function() {
    'use strict';
    'allow pasting';
    var debug = true;
    var prisonDuration = 7;
    var currentURL = "";
    var blacklist = {};


    //=============================================  HTML  ============================================
    var buttonSets = document.createElement('div');
    buttonSets.innerHTML = multilineStr(function(){/*
        <button id="addtoBL" type="button" class="GM_button" > Banish </button>
        <button id="settings" class="GM_button" type="button" > Settings </button>
    */});
    document.querySelector("#yt-masthead-user").appendChild(buttonSets);


    var dropdown = document.createElement("div");
    dropdown.innerHTML = multilineStr(function(){/*
        <div id="dropdownPanel">
            <button id="clear" class="GM_button" type="button" style="display:inline-block"> Free all demons(bad idea)? </button>
            <p style="display:inline-block">Duration:</p>
            <p style="display:inline-block" id="duration">TBD</P>
            <form>
                <label >Change Duration?</label>
                <input type="button" value="1 Week" id="oneWeek">
                <input type="button" value="1 Month" id="oneMonth">
                <input type="button" value="1 Year" id="oneYear">
            </form>
            <br>
            <h3 style="text-align:center;"> Demon Captured</h3>
            <table id="prisonCells">
                
            </table>

        <div>
    */});
    // video_list.insertBefore(dropdown, video_list.firstChild);  
    document.querySelector("#masthead-positioner").appendChild(dropdown);  

  
    

    // event handlers

    $('#addtoBL').click(function(){
        addtoBlacklist();
    });
    // document.getElementById("addtoBL").addEventListener("click",addtoBlacklist,false);
    // document.getElementById("clear").addEventListener("click",freeDemon("BlackList_"),false);  
    $("#clear").click(function(){
        freeDemon("BlackList_");
    });

    $('#settings').click(function(){
        document.getElementById("dropdownPanel").classList.toggle("show");
        displayBlacklist();
    });


    // document.getElementById("settings").addEventListener("click",toggleDropdown,false); 


    // function toggleDropdown(){
    //     if(debug) console.log("dropdown clicked");
    //     document.getElementById("dropdownPanel").classList.toggle("show");
    //     displayBlacklist();
    // }

    $('#oneWeek').click(function(){
        if(debug) console.log(this.value);
        prisonDuration = 7;
        document.getElementById("duration").innerHTML = prisonDuration.toString();
    });
    $('#oneMonth').click(function(){
        if(debug) console.log(this.value);
        prisonDuration = 30;
        document.getElementById("duration").innerHTML = prisonDuration.toString();
    });
    $('#oneYear').click(function(){
        if(debug) console.log(this.value);
        prisonDuration = 365;
        document.getElementById("duration").innerHTML = prisonDuration.toString();
    });

    


    //=============================================  CSS ===============================================
    GM_addStyle ( multilineStr ( function () {/*!
       
        

        .GM_button{
            z-index: 10000;
            cursor: pointer;
            border: 2px black solid;
            border-radius:4px;
            background-color: #4d4d4d;
            color:white;

        }

        #clear{
            margin-top: 5px;
            margin-left:5px;
        }

        #dropdownPanel{
            position:absolute;
            width:27vw;
            left:70vw;
            height: 200px;
            z-index:100000;
            background-color:#00e600;
            border: #0066ff 2px solid;
            border-radius: 5px;
            overflow-x:hidden;
            overflow-y:auto;
            display:none;
        }
        
        .demonName{
            width:15vw;
            
        }
        


       .show{
            display:block !important;
        }

        .deleted{
            display:none !important;
        }

        
    */} ) );

    
    function multilineStr (dummyFunc) {
        var str = dummyFunc.toString ();
        str     = str.replace (/^[^\/]+\/\*!?/, '') // Strip function () { /*!
                .replace (/\s*\*\/\s*\}\s*$/, '')   // Strip */ }
                .replace (/\/\/.+$/gm, ''); // Double-slash comments wreck CSS. Strip them.
                
        return str;
    }
    

    // ======================================== JavsScripts  ===============================================

    // update function, activated every 4 seconds
    setInterval(function(){

        // 1. check url change
        if( window.location.href != currentURL){
            checkBlacklist();
            currentURL = window.location.href;
        }

        // 2. update duration
        document.getElementById("duration").innerHTML = prisonDuration.toString();

       

        
    },3000);
    

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
    function addtoBlacklist(){
        var url = window.location.href;
        var videoId = url.substring(url.indexOf("=")+1);
        addBlacklistCookie(videoId, prisonDuration);
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
        if(exdays > 0){
            var d = new Date();
            d.setTime(d.getTime() + (exdays*24*60*60*1000));
            var expires = "expires="+ d.toUTCString();
            document.cookie = cname + "=" + cvalue + "; " + expires;
        }else{
            document.cookie = cname +";"+ "expires=Thu, 01 Jan 1970 00:00:00 UTC";
        }
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
                var Id = each.substring(10,20);
                var title = each.substring(22);
                // add the data to blacklist
                blacklist[Id] = title; 
            }
        }
    }

    function freeDemon(targetName){
        var allCookies = document.cookie.split(';');
        // clear list first then re-populate
        for(var i=0; i< allCookies.length; i++){
            var each = allCookies[i];
            while(each.charAt(0)==" "){
                each = each.substring(1);
            }
            if(each.indexOf(targetName) > -1){
                document.cookie = each+"; "+ "expires=Thu, 01 Jan 1970 00:00:00 UTC";
            }
        }
        if(debug)console.log("current cookies:\n"+document.cookie);
        if(targetName === "BlackList_") alert("All demons are again roaming the Earth !");
    }

    function displayBlacklist(){
        getCookieBlacklist();
        var count = 1;
        var prisonCells = document.querySelector("#prisonCells");
        if(  _isEmpty(blacklist) ){
            if(debug) console.log("No demon found!");
            prisonCells.innerHTML = "No demon imprisoned";
        }else{
            prisonCells.innerHTML = "";  //clear content first
            for(var key in blacklist){
                if(blacklist.hasOwnProperty(key)){  // for each demon, create a tr to hold its data
                    var demon = document.createElement("tr");
                    demon.innerHTML = '<tr><td colspan="7" ><h4>'+count+'.</h4>'+key+' = '+blacklist[key]+'</td>  <td colspan="3"><input type="button" value="free" id="'+key+'"> </td></tr>';
                    prisonCells.appendChild(demon);
                    if(debug) console.log(count+"."+key+" = "+blacklist[key]);
                    count++;
                    

                    // initiate an event handle for click
                    var selector = '#'+key;
                    $(selector).click(function(){
                        freeDemon(this.id);
                        $(this).parents().eq(1).addClass("deleted");       
                    });
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