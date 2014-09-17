window.addEventListener('message', function (event) { 
    if (event.origin != window.location.origin) {
        return;
    }
    
    if (event.data.type == 'gotScreen') {
        var constraints;
        if (event.data.sourceId === '') { // user canceled
            var error = new Error('NavigatorUserMediaError');
            error.name = 'PERMISSION_DENIED';
            vApp.ss.onError(error);
        } else {
            constraints = constraints || {audio: false, video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: event.data.sourceId,
                },
                optional: [
                    {maxWidth: window.screen.width},
                    {maxHeight: window.screen.height},
                    {maxFrameRate: 3},
                    {googLeakyBucket: true},
                    {googTemporalLayeredScreencast: true}
                ]
            }};
        
            vApp.adpt = new vApp.adapter();
            navigator =  vApp.adpt.init(navigator);
                       
            navigator.getUserMedia(constraints, function (stream){
                vApp.ss._init();   
                vApp.ss.initializeRecorder.call(vApp.ss, stream);   
            }, function (e){
                vApp.ss.onError.call(vApp.ss, e);   
            });
            
            //the stream we can get here with initalizeRecorder() 
        }
    } else if (event.data.type == 'getScreenPending') {
        window.clearTimeout(event.data.id);
    }
    
})