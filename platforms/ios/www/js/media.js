

//Media codes
// Play audio
//
function playAudio(src) {
    // Create Media object from src
    my_media = new Media(src, onMediaSuccess, onMediaError);
    
    // Play audio
    my_media.play();
    
    // Update my_media position every second
    if (mediaTimer == null) {
        mediaTimer = setInterval(function() {
                                 // get my_media position
                                 my_media.getCurrentPosition(
                                                             // success callback
                                                             function(position) {
                                                             if (position > -1) {
                                                             setAudioPosition((position) + " sec");
                                                             }
                                                             },
                                                             // error callback
                                                             function(e) {
                                                             console.log("Error getting pos=" + e);
                                                             setAudioPosition("Error: " + e);
                                                             }
                                                             );
                                 }, 1000);
    }
}

// Pause audio
//
function pauseAudio() {
    if (my_media) {
        my_media.pause();
    }
}

// Stop audio
//
function stopAudio() {
    if (my_media) {
        my_media.stop();
    }
    clearInterval(mediaTimer);
    mediaTimer = null;
}



// onMediaSuccess Callback
//
function onMediaSuccess() {
    console.log("playAudio():Audio Success");
}

// onMediaError Callback
//
function onMediaError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}

// Set audio position
//
function setAudioPosition(position) {
    document.getElementById('audio_position').innerHTML = position;
}

//Audio Recording

function recordAudio() {
    var src = "myrecording.wav";
    mediaRec = new Media(src, onRecordSuccess, onRecordError);
    
    // Record audio
    mediaRec.startRecord();
    
    // Stop recording after 10 sec
    var recTime = 0;
    var recInterval = setInterval(function() {
                                  recTime = recTime + 1;
                                  setAudioPosition(recTime + " sec");
                                  if (recTime >= 10) {
                                  clearInterval(recInterval);
                                  mediaRec.stopRecord();
                                  }
                                  }, 1000);
}

function stopRecord(){
    mediaRec.stopRecord();
}

// onRecordSuccess Callback
//
function onRecordSuccess() {
    console.log("recordAudio():Audio Success");
}

// onRecordError Callback
//
function onRecordError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}


