// This file is part of Vidyamantra - http:www.vidyamantra.com/
/**@Copyright 2014  Vidyamantra Edusystems. Pvt.Ltd.
 * @author  Suman Bogati <http://www.vidyamantra.com>
  */
(
    function(window) {
        var adData = [];
        var wbDataArr = [];
        var that;
        var storage = {
            init : function (){
                that = this;
                this.tables = ["wbData", "allData", "audioData"];
                
                var openRequest = window.indexedDB.open("vidya_app", 2);
                
                openRequest.onerror = function(e) {
                    console.log("Error opening db");
                    console.dir(e);
                };
                
                openRequest.onupgradeneeded = function(e) {
                    var thisDb = e.target.result;
                    var objectStore;
                    //Create Note OS
                    
                    if(!thisDb.objectStoreNames.contains("wbData")) {
                        thisDb.createObjectStore("wbData", { keyPath : 'timeStamp', autoIncrement:true});
                    }
                    
                    if(!thisDb.objectStoreNames.contains("audioData")) {
                        thisDb.createObjectStore("audioData", { keyPath : 'timeStamp', autoIncrement:true});
                    }
                    
                    if(!thisDb.objectStoreNames.contains("allData")) {
                       thisDb.createObjectStore("allData", { keyPath : 'timeStamp', autoIncrement:true});
                     //   thisDb.createObjectStore("allData", {autoIncrement:true});
                    }
                    
                };
                
                openRequest.onsuccess = function(e) {
                    that.db = e.target.result;
                    that.db.onerror = function(event) {
                      console.dir(event.target);
                    };
                    that.getAllObjs();
                };
            },
            
            store : function (data){
                var t = that.db.transaction(["wbData"], "readwrite");  
                var objectStore = t.objectStore("wbData");
                objectStore.clear();
                t.objectStore("wbData").add({repObjs :data , timeStamp : new Date().getTime(), id : 1})
                return false;
            },
            
            audioStore : function (data){
                var t = that.db.transaction(["audioData"], "readwrite");
                t.objectStore("audioData").add({audiostream :data , timeStamp: new Date().getTime(), id : 2});
                return false;
            },
            
            wholeStore_working : function (dt, type){
                var dtArr = [];
                var currTime = new Date().getTime();
                if(typeof dt == "object" && !(dt instanceof Array) ) {
                    dtArr.push(dt);
                }else{
                    dtArr = dt;
                }
                 
                for(var i=0; i<dtArr.length; i++){
                    var dt = dtArr[i];
                    currTime = dt.mt;
                    
                    console.log("current Time " + currTime);
                    
                    dt.peTime = window.pageEnter;
                    var data = JSON.stringify((dt));
                    
                    if(typeof window.prevTime != 'undefined' && currTime == window.prevTime){
                        currTime = currTime + 1;
                    }

                    var t = that.db.transaction(["allData"], "readwrite");

                    if(typeof type == 'undefined'){
                        t.objectStore("allData").add({recObjs :data, timeStamp : currTime, id : 3});
                    }else{
                        t.objectStore("allData").put({recObjs :data, timeStamp :window.prevTime, id : 3});
                    }
                    

                    window.wholeStoreData = data;
                    window.prevTime = currTime;
                } 
            },
            
            
            wholeStore : function (obj, type){
                obj.peTime = window.pageEnter;
                
                var data = JSON.stringify(obj);
                
                var currTime = new Date().getTime();
                
                if(typeof window.prevTime != 'undefined' && currTime == window.prevTime){
                    currTime = currTime + 1;
                }
                
                var t = that.db.transaction(["allData"], "readwrite");
                
                if(typeof type == 'undefined'){
                    t.objectStore("allData").add({recObjs :data, timeStamp : currTime, id : 3});
                }else{
                    t.objectStore("allData").put({recObjs :data, timeStamp :window.prevTime, id : 3});
                }
                
                window.wholeStoreData = data;
                window.prevTime = currTime;
            },
            
            displayData : function (){
                var transaction = that.db.transaction(["vapp"], "readonly"); 
                var objectStore = transaction.objectStore("vapp");
                objectStore.openCursor().onsuccess =  that.handleResult;
            },
            
            getAllObjs : function (){
                for(var i=0; i<that.tables.length; i++){
                    var transaction = that.db.transaction(that.tables[i], "readonly"); 
                    var objectStore = transaction.objectStore(that.tables[i]);
                    objectStore.openCursor().onsuccess =  (
                        function (val){
                            return function (event){
                                that[that.tables[val]].handleResult(event);
                            }
                        }
                    )(i);
                }
            },
            
            
            wbData : {
                handleResult : function (event){
                    var cursor = event.target.result;  
                    if (cursor) {
                        if(cursor.value.hasOwnProperty('repObjs')){
                            vApp.wb.utility.replayFromLocalStroage(JSON.parse(cursor.value.repObjs));
                        }
                        cursor.continue();    
                    }
                 }
            },
            
            audioData : {
                handleResult : function (event){
                    var cursor = event.target.result;  
                    if (cursor) {
                        if(cursor.value.hasOwnProperty('audiostream')){
                            adData.push(JSON.parse(cursor.value.audiostream));
                        }
                        cursor.continue();    
                    } else {
                        if(adData.length > 1){
                            vApp.gObj.video.audio.recordingLength = 0;
                            vApp.gObj.video.audio.assignFromLocal(adData);
                        }
                    }
                 }
            },
            
            allData : {
                handleResult : function (event){
                    var cursor = event.target.result;  
                    if (cursor) {
                        if(cursor.value.hasOwnProperty('recObjs')){
                            vApp.recorder.items.push(JSON.parse(cursor.value.recObjs));
                        }
                        cursor.continue();    
                    } 
                }
            },
            shapesData : {
                handleResult : function (){
                    vApp.recorder.items.push(JSON.parse(cursor.value.recObjs));
                }
            },
            
            clearStorageData : function (){
                for(var i=0; i<this.tables.length; i++){
                    var t = this.db.transaction([this.tables[i]], "readwrite");  
                    if(typeof t != 'undefined'){
                        var objectStore = t.objectStore(this.tables[i]);
                        objectStore.clear();  
                    }
                }

            },
            
            handleResultNoUsing : function (){
                var cursor = event.target.result;  
                if (cursor) {
                    if(cursor.value.hasOwnProperty('repObjs')){
                        var allObjs = JSON.parse(cursor.value.repObjs);
                        vApp.wb.utility.replayFromLocalStroage(allObjs);
                    }else if(cursor.value.hasOwnProperty('audiostream')){
                        
                        var allObjs = JSON.parse(cursor.value.audiostream);
                        vApp.gObj.video.audio.assignFromLocal(allObjs);
                        
                    }else  if (cursor.value.hasOwnProperty('recObjs')){
                        vApp.recorder.items.push(JSON.parse(cursor.value.recObjs));
                    }
                    cursor.continue();
                }
            }
        }
        
        window.storage = storage;
    }
)(window);
