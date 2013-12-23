// Audio player
var my_media = null;
var mediaTimer = null;
//mediaRecorder
var mediaRec = null;


//Recording folder and recording file name
var myRecFolder;
var recFileName;
var recFilePath;
var isRecorded = false;

var recTime;
var recInterval;


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
                                                        setAudioPosition("プレー："+(position) + " sec");
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

function setAudioPosition(position){

}

//play the recorded Audio
function playRecordedAudio(){
    console.log("Currently recording flag " + isRecorded);
    if(isRecorded == true){
            //Take the source file path as the recorded audio file path
            var src = recFilePath;
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
                                                setRecAudioPositionPlay("録音後：" + (position) + " sec" + "<br>" +"必要ならまた録音してファイルを置き換えてください。");
                                            }
                                        },
                                        // error callback
                                        function(e) {
                                            console.log("Error getting pos=" + e);
                                            setRecAudioPositionPlay("Error: " + e);
                                        }
                                 );
                            }, 1000);
            }
    }else{
        alert("録音してください。");
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

// Set audio position during recording
//
function setRecAudioPosition(position) {
    $("#audioPositionForRecording").html(position);
}


//Set audio position during playing
function setRecAudioPositionPlay(position){
    $("#audioPositionForRecordPlay").html(position);
}


//var gotFS = function (fileSystem) {
//    fileSystem.root.getFile("myrecording.wav",
//        { create: true, exclusive: false }, //create if it does not exist
//        function success(entry) {
//            var src = entry.toURI();
//            console.log(src); //logs blank.wav's path starting with file://
//        },
//        function fail() {}
//    );
//};

//Audio Recording
function recordAudio() {
    isRecorded = false;
    console.log("Recording started.");

    var d = new Date();
    var n = d.getTime();
    //setting record file name and folder
    recFileName = n + ".wav";
    myRecFolder = "Recordings";


    var src = recFileName;
    mediaRec = new Media(src, onRecordSuccess, onRecordError);

    // Record audio
    mediaRec.startRecord();
    
    // Stop recording until stop record 
    recTime = 0;
    recInterval = setInterval(function() {
                                    recTime = recTime + 1;
                                    setRecAudioPosition("録音中 :" +recTime + " sec");
//                                    if (recTime >= 10) {                 
//                                        clearInterval(recInterval);
//                                    }
                                  }, 1000);
    
    
}

function moveAndsaveRecordToDB(){
    //move the recorded file to the Documents/Recordings folder
    moveRecordedFile(recFileName);
}

function moveRecordedFile(recFileName){
    var recURI;
    window.requestFileSystem(LocalFileSystem.TEMPORARY, 0,
      function(fileSys) {
            recURI = "file://localhost"+fileSys.root.fullPath+"/"+recFileName ;
            console.log("Setting record source URI : " + recURI);
            window.resolveLocalFileSystemURI(recURI, resolveOnSuccessForRecording, resOnErrorForRecording);
        }, function(e) {
                console.log("Error in temporary record source URI " + "code" + e.code + " message " + e.message);
    });
    console.log(recURI);
    

}

function resolveOnSuccessForRecording(entry){
    console.log("Audio Record move URI resolve success.");
    console.log(entry.fullPath);
    recFilePath = entry.fullPath;
    
    var myFolderApp = "Recordings";
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
        function(fileSys)
        {
           //The folder is created if doesn't exist
            fileSys.root.getDirectory(myFolderApp,
                                    {create:true, exclusive: false},
                                    function(directory) {
                                        console.log("Started moving the recorded audio file.");
                                        entry.moveTo(directory, recFileName,  successMoveForRecording, resOnErrorForRecording);
                                    },
                                    resOnErrorForRecording
                                );
      },resOnErrorForRecording
    );
}

//function moveRecordedFile(folderName,fileName){

//}

function successMoveForRecording(entry){
    console.log("Moved the audio recording to the folder successfully.");
    console.log("New File path after moving the record:" + entry.fullPath);
    
    //saving the recording file path for play
    
    determineAudioURIForDB(entry.fullPath);
    recFilePath = audioURIForDBSave;
}

function resOnErrorForRecording(error){
    console.log("Error in moving recording file to the folder.");
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}


function stopRecord(){
    mediaRec.stopRecord();
    moveAndsaveRecordToDB();
    //clear the interval
    clearInterval(recInterval);
    //make the isRecorded flag false after recording
    isRecorded = true;
    console.log("Setting the recorded flag " + isRecorded);
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


