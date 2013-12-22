//
//// Called when a photo is successfully retrieved
////
//function onPhotoDataSuccess(imageData) {
//    // Uncomment to view the base64-encoded image data
//    // console.log(imageData);
//    
//    // Get image handle
//    //
//    console.log("photo capture success");
//    var smallImage = document.getElementById('smallImage');
//    // Unhide image elements
//    //
//    smallImage.style.display = 'block';
//    // Show the captured photo
//    // The in-line CSS rules are used to resize the image
//    //
//    smallImage.src = "data:image/jpeg;base64," + imageData;
//}
//
//// Called when a photo is successfully retrieved
////
//function onPhotoURISuccess(imageURI) {
//    // Uncomment to view the image file URI
//     console.log(imageURI);
//    
//    // Get image handle
////    var largeImage = document.getElementById('largeImage');
//    
//    // Unhide image elements
//    $("#largeImage").css("display","block");    //    largeImage.style.display = 'block';
//    
//    // Show the captured photo
//    // The in-line CSS rules are used to resize the image
//    $("#largeImage").attr("src",imageURI); //    largeImage.src = imageURI;
//
//}

function onPhotoURISuccessForLesson(imageURI){
    console.log(imageURI);
    movePicForLesson(imageURI);
}

//function resolveFile(){
//    var fileURI="/var/mobile/Applications/CCC3486E-1004-4158-A44A-7142ECB4DA0E/Documents/newFile2.txt";
//   // window.resolveLocalFileSystemURI(file,resolveOnSuccess,resOnError);
//    
//    //getting file
//    window.requestFileSystem(LocalFileSystem.PERSISTENT,0,
//                            function(fs){
//                                var reader = new FileReader();
//                                console.log("here");
//                                reader.onloadend = function(evt){
//                                    console.log("Read success.");
//                                    console.log(evt.target.result);
//                                }
//                             
//                                console.log(fileURI);
//                             
//                                var fileObject = fs.root.getFile(fileURI,{create: true, exclusive: false},
//                                   function(entry){
//                                        console.log("Got File.");
//                                        console.log(entry.fullPath);
//                                    },
//                                   function(error){
//                                        alert(error.message);
//                                    }
//                                ;
//                             
//                                console.log("Daijoubu");
//                            
//                                //console.log(fileObject.name);
//                                //reader.readAsDataURL(fileURI);
//                            
//                            },
//                            function(){
//                                alert(error.code);
//                                console.log("error source " + error.source);
//                                console.log("error target " + error.target);
//                                console.log("error code " + error.code);
//                            });
//    console.log("Ananda");
//}
//
//
function movePicForLesson(imageURI){
    console.log("Moving picture " + imageURI);                  /*file:///var/mobile/Applications/CCC3486E-1004-4158-A44A-7142ECB4DA0E/Documents */
    
    window.resolveLocalFileSystemURI(imageURI, resolveOnSuccessForLesson, resOnErrorForLesson);
}

// requestFileSystem calls
    //window.requestFileSystem(LocalFileSystem.TEMPORARY,0,resolveOnSuccess,resOnError);
    //window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, resolveOnSuccess,resOnError);


//Callback function when the file system uri has been resolved
function resolveOnSuccessForLesson(entry){
    console.log("Resolve on success moving.");
    console.log(entry.fullPath);
    var d = new Date();
    var n = d.getTime();
    //new file name
    var newFileName = n + ".jpg";
    var myFolderApp = "Lessons";

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) {      
        //The folder is created if doesn't exist
        fileSys.root.getDirectory( myFolderApp,
                    {create:true, exclusive: false},
                    function(directory) {
                        entry.moveTo(directory, newFileName,  successMoveForLesson, resOnErrorForLesson);
                    },
                    resOnErrorForLesson);
                    },
    resOnErrorForLesson);
    console.log("hello");
    
}
//
///*window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, function(fs){
//    fs.root.getFile("temp", {create: true, exclusive: false},
//      function(entry){
//        fileTransfer.download(
//                Url, // the filesystem uri you mentioned
//                entry.fullPath,
//                function(entry) {
//                    // do what you want with the entry here
//                    console.log("download complete: " + entry.fullPath);
//                },
//                function(error) {
//                    console.log("error source " + error.source);
//                    console.log("error target " + error.target);
//                    console.log("error code " + error.code);
//                },
//                false,
//                null
//        );
//    }, function(){
//        alert("file create error");
//    });
//}, null);
//*/
//
//Callback function when the file has been moved successfully - inserting the complete path
function successMoveForLesson(entry) {
    //I do my insert with "entry.fullPath" as for the path
    console.log("Moved the picture to the folder successfully.");
    console.log("New File path after moving:" + entry.fullPath);

    determineImageURIForDB(entry.fullPath);
    
//    
//    //Show that image in the image tag
//    var imageFileURI = entry.fullPath;
//    $("#smallImage").css({"display":"block"});
//    $("#smallImage").attr("src",imageFileURI);
}

function resOnErrorForLesson(error) {
    console.log("Error in moving file to the folder.");
    alert(error.code);
}


// A button will call this function
//
function capturePhoto(page) {
    console.log("Capturing photo.");
    
    if(page=='lesson'){
        // Take picture using device camera and retrieve image as base64-encoded string
        navigator.camera.getPicture(onPhotoURISuccessForLesson, onCameraFail, { quality: 50
                                                ,destinationType: destinationType.FILE_URI });
    
    }
}

//// A button will call this function
////
//function capturePhotoEdit() {
//    // Take picture using device camera, allow edit, and retrieve image as base64-encoded string
//    navigator.camera.getPicture(onPhotoDataSuccess, onCameraFail, { quality: 20, allowEdit: true,
//                                destinationType: destinationType.DATA_URL });
//}
//
//// A button will call this function
////
//function getPhoto(source) {
//    // Retrieve image file location from specified source
//    navigator.camera.getPicture(onPhotoURISuccess, onCameraFail, { quality: 50,
//                                destinationType: destinationType.FILE_URI,
//                                sourceType: source });
//}
//
// Called if something bad happens.
//
function onCameraFail(message) {
    console.log("Photo Capture Error");
    alert('Failed because: ' + message);
}
