/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

//DOM-Cache set true because I am using multi html instead of multi page
//$.mobile.page.prototype.options.domCache = true;

//Database Shell
var dbShellStudents=null;
//Lessons database
var dbShellLessons=null;
//Responses for exercise
var dbShellResponsesForExercise=null;
//Responses for student
var dbShellResponsesForStudent=null;

//URI
var imageURIForDBSave = ""; // image path to save in the lessons database
var audioURIForDBSave = ""; // audio path to save in the lessons database

//student, teacher flag
var isStudent;
var isTeacher;


$("#indexPage").live('pageinit',function(){
            snowfall();
            initialize();
            
});

//index page load initialization
$("#indexPage").live('pageshow',function(){
            initialize();
});


//student page load initialization
//$("#studentLogin").live('pageinit',function(){
//            init('student');
//        }
//)

$("#studentLogin").live('pageshow',function(){
            isStudent = true;
            isTeacher = false;
            init('student');
});

var teacherID;
var lessonID;
var exerciseID;
var studentID;

$("#teacherLogin").live('pageshow',function(){
    isTeacher = true;
    isStudent = false;
});

//teacher page load initialization
$("#teacher").live('pageinit',function(){
    if(isStudent){
        $(".teacherOnly").hide();
        $(".studentOnly").show();
    }
    if(isTeacher){
        $(".studentOnly").hide();
        $(".teacherOnly").show();
    }
    
    teacherID = 1;
    console.log("Initialize lessons for teacher page.");
    initLesson();
});

$("#teacher").live('pageshow',function(){
    //hide new lesson button if student
    if(isStudent){
        $(".teacherOnly").hide();
        $(".studentOnly").show();
    }
    if(isTeacher){
        $(".studentOnly").hide();
        $(".teacherOnly").show();
    }
    
    teacherID = 1;
    console.log("Initialize lessons for teacher page.");
    initLesson();
})


//    $("#teacher").live("pageshow",function(){
//        var loc = $(this).data("url");
//        console.log("Teacher page url : " + loc);
//        if(loc.indexOf("?") >= 0){
//            var qs = loc.substr(loc.indexOf("?")+1,loc.length);
//            var teacherID = qs.split("=")[1];
//            console.log("Teacher ID: " + teacherID);
//        }
//    })

$("#lesson").live('pageinit',function(){
    //render exercise after opening the database
    
    //hide new exercise button
    if(isStudent){
        $(".teacherOnly").hide();
        $(".studentOnly").show();
    }
    if(isTeacher){
        $(".teacherOnly").show();
        $(".studentOnly").hide();
    }
    openDataBaseAndCreateTable('lessonPage');
})

$("#lesson").live('pageshow',function(){

    console.log("Teacher id : " + teacherID);//
    var loc = $("#lesson").attr("data-url");
    
    if(loc.indexOf("?") >= 0){
        var s = loc.substr(loc.indexOf("?") + 1,loc.length);
        lessonID = s.split("=")[1];
    }else{
    
    }
    console.log(loc);
    
    console.log("Teacher ID :" + teacherID);
    console.log("Lesson " + lessonID + " Page initialized. ");

    openDataBaseAndCreateTable('lessonPage');
});



//new Exercise page load initialization
$("#newExercise").live('pageshow',function(){
                //clear the text fields
                $("#exerciseTitle").val("");
                $("#exerciseDetail").val("");
                
                
                console.log("Got lesson ID: " + lessonID);
                console.log("New Exercise Page");
                
                //Setting recording flag as false
                isRecorded = false;
                
                dbShellLessons.transaction(function(tx){
                                    //get new Lesson ID
                                    tx.executeSql(
                                        "select DISTINCT lesson_id from lessons where teacher_id=?",[teacherID],
                                        function(tx,results){
                                        
                                            if(teacherID == null){
                                                //set teacher id
                                                console.log("Setting teacher id : " + teacherID);
                                                $(document).ready(function(){
                                                            console.log("setting " + teacherID + " to the teacherID hidden field")
                                                            $("#teacherID").val(teacherID);
                                                });
                                            }
                                            
                                            if(lessonID == null){
                                                numberOfLessons = results.rows.length;
                                                console.log("Number of distict rows in lessons DB = " + numberOfLessons + "for teacher " + teacherID);
                                                //set new lesson id
                                                lessonID = numberOfLessons + 1;
                                                console.log("Setting new Lesson id : " + lessonID);
                                                $(document).ready(function(){
                                                            console.log("setting " + lessonID + " to the lessonID hidden field")
                                                            $("#lessonID").val(lessonID);
                                                    });
                                            
                                            }
                                            //Now get new exercise id
                                            tx.executeSql(
                                                "select DISTINCT exercise_id from lessons where teacher_id=? and lesson_id=?",
                                                [teacherID,lessonID],
                                                function(tx,results){
                                                    //set new exercise id
                                                    exerciseID = results.rows.length + 1;
                                                    console.log("Setting new exercise id : " + exerciseID);
                                                    
                                                    //setting exercise id to the exerciseID hidden field
                                                    $(document).ready(function(){
                                                            console.log("setting " + exerciseID + " to the exerciseID hidden field for teacher " + teacherID + " and lesson " + lessonID );
                                                            $("#exerciseID").val(exerciseID);
                                                    });
                                                },
                                                function(err){
                                                    console.log("Exercise ID get Error: "+err.message + "\nCode="+err.code);
                                                    alert("Exercise ID get Error: "+err.message + "\nCode="+err.code);
                                                }
                                            );
                                        },
                                        function(err){
                                            console.log("Lesson Count Error: "+err.message + "\nCode="+err.code);
                                            alert("Lesson Count Error: "+err.message + "\nCode="+err.code);    
                                        }
                                    );
                                    
                                },dberrorhandler);
                   
});

        
//will run after initial show- handles regetting the list
$("#studentPage").live("pageshow",function(){
    console.log("hello");
    getEntries();
});
        
        
//Student Page logic needs to know to get old Student record (possible)
$("#student").live("pageshow", function() {
                //get the location
                var loc = $("#student").attr("data-url");
                //location data
                console.log("Active Page URL:"+loc);
                
                if(loc.indexOf("?") >= 0) {
                    var qs = loc.substr(loc.indexOf("?")+1,loc.length);
                    console.log("qs :" + qs);
                    studentID = qs.split("=")[1];
                    console.log("studentID:" + studentID);
                    //load the values
                    $("#studentFormSubmitButton").attr("disabled","disabled");
                    dbShellStudents.transaction(
                                        function(tx) {
                                                tx.executeSql("select id,name,image from students where id=?",[studentID],function(tx,results) {
                                                              $("#studentId").val(results.rows.item(0).id);
                                                              $("#studentName").val(results.rows.item(0).name);
                                                              $("#studentImage").val(results.rows.item(0).image);
                                                              $("#studentFormSubmitButton").removeAttr("disabled");   
                                                              });
                                                }, dberrorhandler);
                            
                } else {
                    $("#studentFormSubmitButton").removeAttr("disabled");
                }
        });

$("#exercise").live('pageshow',function(){
    console.log("Teacher id : " + teacherID);//
    console.log("Lesson id : " + lessonID);
    var loc = $("#exercise").attr("data-url");
    
    if(loc.indexOf("?") >= 0){
        var s = loc.substr(loc.indexOf("?") + 1,loc.length);
        exerciseID = s.split("=")[1];
    }else{
        alert("Something is wrong in the exercise page.")
    }
    console.log(loc);
    
    console.log("Exercise " + exerciseID + " page of Lesson " + lessonID + "  initialized. ");
    
    //show exercise infor in html divs
    console.log("Getting Exercise infor from lessons database for exercise " + exerciseID);
    dbShellLessons.transaction(function(tx){   // put teacher_id also
            tx.executeSql("select lessonRow_id,teacher_id,lesson_id,exercise_id,exercise_title,exercise_detail,\
              exercise_voice,exercise_image from lessons where teacher_id=? and lesson_id=? and exercise_id=?",
              [teacherID,lessonID,exerciseID]
            ,function(tx,results){
                //set image for the exercise
                $("#exImage").css("display","block");
                $("#exImage").attr("src",results.rows.item(0).exercise_image);
                console.log("Exercise image set success.");
                
                //set title for the exercise
                $("#exTitle").html(results.rows.item(0).exercise_title);
                console.log("Exercise title set success.");
                
                //set details for the exercise
                $("#exDetail").html(results.rows.item(0).exercise_detail);
                console.log("Exercise detail set success.");
                
                //set recording for the exercise
                console.log("playAudio(\"" + results.rows.item(0).exercise_voice + "\");");
                $("#exRecord").attr("onclick","playAudio(\"" + results.rows.item(0).exercise_voice + "\");");
                console.log("Exercise record set success.");
                
                //open response database, get entries for studentandscoresList
                openDataBaseAndCreateTable('responseForExercise');
            },
            function(err){
                console.log("Exercise info get Error: "+err.message + "\nCode="+err.code);
                alert("Exercise info get Error: "+err.message + "\nCode="+err.code);
            });
    },function(err){
                console.log("Exercise info get DB Error: "+err.message + "\nCode="+err.code);
                alert("Exercise info get DB Error: "+err.message + "\nCode="+err.code);
    });
    
});


//initialize lessons for teacher page
function initLesson(){
    // Opening Lessons Database
    openDataBaseAndCreateTable('lessons');
}

//handle exercise form submission
//$("#newExerciseForm").live("submit",function(e){
function onclickFormSubmitNewExercise(){
            
            console.log("New exercise form submission.");
                var data =  {
                            t_id        :   teacherID,
                            l_id        :   lessonID,
                            ex_id       :   $("#exerciseID").val(), //blank id perhaps
                            ex_title    :   $("#exerciseTitle").val(),
                            ex_detail   :   $("#exerciseDetail").val(),
                            ex_voice    :   audioURIForDBSave,
                            ex_image    :   imageURIForDBSave
                        };
            //console log the student data being registered
            console.log(data);
                        
            //registering the new exercise
           registerExercise(data,function() {
                    $(document).ready(function(){
                            $.mobile.changePage("#lesson",{reverse:false,transition:"pop"});
                    });

            });
}


//handle response form submission
function onclickSubmitNewResponse(){
            console.log("New response submission.");
            var data =  {
                            teacher_id        :   teacherID,
                            student_id        :   studentID,
                            lesson_id        :   lessonID,
                            exercise_id       :   exerciseID, //blank id perhaps
                            response    :   audioURIForDBSave
                        };
            //console log the student data being registered
            console.log(data);
    
            //registering the new response
                        //registering the new exercise
           registerResponse(data,function() {
                    $(document).ready(function(){
                           // $.mobile.changePage("#exercise",{reverse:false,transition:"pop"});
                          openDataBaseAndCreateTable('responseForExercise');
                    });

            });
}

//Registering the response in responseAndMarks database
function registerResponse(resp,cb){
     if(resp.response != ""){
           console.log("Response registration Start");
           dbShellResponsesForExercise.transaction(
                    function(tx){
//                        console.log(resp.teacher_id + "  "+ resp.student_id + "  " + resp.lesson_id + "  " + resp.exercise_id + " " + resp.response);
//                    "CREATE TABLE IF NOT EXISTS responseandmark(row_id INTEGER,teacher_id INTEGER,student_id INTEGER,lesson_id INTEGER,\
//    exercise_id INTEGER,response,scoremark,comment,PRIMARY KEY(row_id))"
                        tx.executeSql("select response from responseandmark where teacher_id=? and student_id=? and lesson_id=? and exercise_id=?",
                            [resp.teacher_id,resp.student_id,resp.lesson_id,resp.exercise_id],
                            function(tx1,res1){
                                    if(res1.rows.length == 0){
                                        tx.executeSql( "insert into responseandmark(teacher_id,student_id,lesson_id,exercise_id,response) \
                                                        values(?,?,?,?,?)",
                                                       [resp.teacher_id,resp.student_id,resp.lesson_id,resp.exercise_id,resp.response],
                                                      function(tx2,res2){
                                                            console.log("Response data registered(no update) for student in the responseandmark table in database.");
                                                      },
                                                      function(err){
                                                            console.log("Response register(no update) Error: "+err.message + "\nCode="+err.code);
                                                            alert("Response register(no update) Error: "+err.message + "\nCode="+err.code);
                                                      }
                                        );
                                    }else{
                                        tx1.executeSql("update responseandmark set response=? where teacher_id=? and student_id=? and lesson_id=? and exercise_id=?",
                                                    [resp.response,resp.teacher_id,resp.student_id,resp.lesson_id,resp.exercise_id],
                                                        function(tx3,res3){
                                                            console.log("Response data registered(update) for student in the responseandmark table in database.");
                                                        },
                                                        function(err){
                                                            console.log("Response register(update) Error: "+err.message + "\nCode="+err.code);
                                                            alert("Response register(update) Error: "+err.message + "\nCode="+err.code);
                                                        }
                                        );
                                    }
                                },
                            function(err){
                                console.log("Response register Error: "+err.message + "\nCode="+err.code);
                                alert("Response register Error: "+err.message + "\nCode="+err.code);
                            }
                        );
                    },function(err){
                                console.log("Response Register DB Error: "+err.message + "\nCode="+err.code);
                                alert("Response Register DB Error: "+err.message + "\nCode="+err.code);
                    },cb
        );

    }

}

//Registering exercise data in lesson database
function registerExercise(exercise,cb){
    if(exercise.ex_id != ""){
        console.log("Exercise Registration Start");
        dbShellLessons.transaction(
                    function(tx){
                    //CREATE TABLE IF NOT EXISTS lessons(lessonRow_id INTEGER,teacher_id INTEGER,lesson_id INTEGER,exercise_id INTEGER,exercise_title,exercise_detail\
                    //exercise_voice,exercise_image,PRIMARY KEY(lessonRow_id))
                        tx.executeSql("insert into lessons(teacher_id,lesson_id,exercise_id,exercise_title,exercise_detail,exercise_voice,exercise_image) \
                                        values(?,?,?,?,?,?,?)",
                            [exercise.t_id, exercise.l_id, exercise.ex_id, exercise.ex_title,exercise.ex_detail, exercise.ex_voice, exercise.ex_image],
                            function(tx,results){
                                    console.log("Exercise data registered in the lessons database.");
                            },
                            function(err){
                                console.log("Exercise Register DB tx Error: "+err.message + "\nCode="+err.code);
                                alert("Exercise Register DB tx Error: "+err.message + "\nCode="+err.code);
                            }
                        );
                    },function(err){
                                console.log("Exercise Register DB Error: "+err.message + "\nCode="+err.code);
                                alert("Exercise Register DB Error: "+err.message + "\nCode="+err.code);
                    },cb
        );
    }
	}

function determineImageURIForDB(imageURI){
    imageURIForDBSave = imageURI;
    console.log("Image URI variable set.");
}

function determineAudioURIForDB(audioURI){
    audioURIForDBSave = audioURI;
    console.log("Audio URI variable set.");
}

// Application Constructor
function initialize(){
    console.log("initialized");
    bindEvents();
}
// Bind Event Listeners
//
// Bind any events that are required on startup. Common events are:
// 'load', 'deviceready', 'offline', and 'online'.
function bindEvents() {
    document.addEventListener('deviceready', onDeviceReady, false);
    console.log("Bind events");
}

// deviceready Event Handler
// device APIs are available
function onDeviceReady() {
    console.log("Device ready");
    receivedEvent('deviceready');
}

// Update DOM on a Received Event
function receivedEvent(id) {
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');
    
    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');
    console.log('Received Event: ' + id);
    
    //camera setup
    pictureSource=navigator.camera.PictureSourceType;
    destinationType=navigator.camera.DestinationType;
}

var count = 0;

//Page onload initial function for student and teacher entrance page
function init(who){
    console.log("init called : " + count++);
    //open database on device ready

    
    if(who == 'student'){
        //Opening Student Profile Database first
        openDataBaseAndCreateTable('student'); //********Database load is ok
        console.log("Student page init");
    }
    else if(who == 'teacher'){
        
    }
}

        //handle form submission of a new/old student
//$("#studentRegistrationForm").live("submit",function(e) {
function onFormSubmitStudentRegistration(){
            var data =  {
//                            id   :   $("#studentId").val(), //blank id perhaps
                            name :   $("#studentName").val(),
                            image:   imageURIForDBSave
                        };
            //console log the student data being registered
            console.log(data);
            //registering the student
            registerStudent(data,function() {
            //callback function change to the next page, currently the same page
                console.log("Student registered.");
                getEntries();
            });
            e.preventDefault();
}

//registering student
function registerStudent(student,cb){ //cb for callback
  if(student.name != ""){
    console.log("Student Register Start");
    console.log("Student ",student.id);
    dbShellStudents.transaction(function(tx) {
                if(student.id == null){
                    tx.executeSql("insert into students(name,image) values(?,?)",[student.name,student.image]
                        ,function(tx,results){
                            console.log("success.  " + results);
                        },
                        dberrorhandler
                    ); //No need to insert student ID, because ID is the Primary Key, so automatically incremented
                }
                else{
                    tx.executeSql("update students set name=?,image=? where id=?",[student.name,student.image,student.id]);
                }
            },dberrorhandler,cb);
      
  }else{
      console.log("Can't Register Student. No name.")
      alert("名前を入れてください。");
  }
}

//Open Database
function openDataBaseAndCreateTable(who){
    if(who == 'student'){
        console.log("StudentProfile Database start open.");
        dbShellStudents = window.openDatabase("StudentProfile",2,"StudentProfile",1000000);
        console.log("StudentProfile Database is opened");
        //run transaction to create initial table
        dbShellStudents.transaction(setupTable,dberrorhandler,getEntries);
        console.log("Ran setup for StudentProfile Database");
    }
    else if(who == 'teacher'){
        console.log("Teacher Login Page");
    }
    else if(who == 'lessons'){
        console.log("Lessons Database start open to get Lessons.");
        dbShellLessons = window.openDatabase("Lessons",2,"Lessons",1000000);
        console.log("Lessons Database is opened.");
        dbShellLessons.transaction(setupTableForLessons,dberrorhandlerForLessons,getEntriesFromLessons);
        console.log("Ran setup for Lessons Database");
    }else if(who == 'lessonPage'){
        console.log("Lessons Database start open to get Exercises for lesson " + lessonID);
        dbShellLessons = window.openDatabase("Lessons",2,"Lessons",1000000);
        console.log("Lessons Database is opened");
        dbShellLessons.transaction(setupTableForLessons,dberrorhandlerForLessons,getExerciseEntriesFromLessons);
    }else if(who == 'responseForExercise'){
        console.log("ResponseAndMarks Database start open to get Exercises for lesson " + lessonID + " and exercise " + exerciseID);
        //open responseandmark database
        dbShellResponsesForExercise = window.openDatabase("ResponseAndMarks",2,"ResponseAndMarks",1000000);
        console.log("ResponseAndMarks Database is opened");
        dbShellResponsesForExercise.transaction(setupTableForResponseAndMarks,dberrorhandlerForResponseForExercise,getResponseEntriesForExercise);
    }else if(who == 'responseForStudent'){
        console.log("ResponseAndMarks Database start open to get Exercises for lesson " + lessonID + " and exercise " + exerciseID);
        dbShellResponsesForStudent = window.openDatabase("ResponseAndMarks",2,"ResponseAndMarks",1000000);
        console.log("ResponseAndMarks Database is opened");
        dbShellResponsesForStudent.transaction(setupTableForResponseAndMarks,dberrorhandlerForResponseForStudent,getResponseEntriesForStudent);
    }
}

//setup table for studentProfile Database
function setupTable(tx){
    console.log("before execute sql for studentProfile Database");
    tx.executeSql("CREATE TABLE IF NOT EXISTS students(id INTEGER PRIMARY KEY,name,image)");
    console.log("Created table if not existed for studentProfile Database");
    console.log("after execute sql in studentProfile Database");
}

//setup Table for Lessons Database
function setupTableForLessons(tx){
    console.log("before execute sql for Lessons Database");
    tx.executeSql("CREATE TABLE IF NOT EXISTS lessons(lessonRow_id INTEGER,teacher_id INTEGER,lesson_id INTEGER,exercise_id INTEGER,exercise_title,exercise_detail,\
              exercise_voice,exercise_image,PRIMARY KEY(lessonRow_id))");
    console.log("Created table if not existed for Lessons Database");
}

//setup Table for ResponseAndMarks
function setupTableForResponseAndMarks(tx){
    console.log("before execute sql for ResponseAndMarks Database");
    tx.executeSql("CREATE TABLE IF NOT EXISTS responseandmark(row_id INTEGER PRIMARY KEY,teacher_id,student_id,lesson_id,\
    exercise_id,response,scoremark,comment)");
}

//Get from Lessons Database
function getEntriesFromLessons(){
    console.log("Getting Lesson Entries");
    dbShellLessons.transaction(function(tx){
            tx.executeSql("select lessonRow_id,teacher_id,lesson_id,exercise_id,exercise_title,exercise_detail,\
              exercise_voice,exercise_image from lessons group by lesson_id",[]
            ,renderEntriesForLessons,dberrorhandlerForLessons);
    },dberrorhandlerForLessons);
}

//Get exercise from Lessons Database
function getExerciseEntriesFromLessons(){
    console.log("Getting Exercise Entries for lesson Page " + lessonID);
    dbShellLessons.transaction(function(tx){   // put teacher_id also
            tx.executeSql("select lessonRow_id,teacher_id,lesson_id,exercise_id,exercise_title,exercise_detail,\
              exercise_voice,exercise_image from lessons where lesson_id=? group by exercise_id",[lessonID]
            ,renderEntriesForExerciseInLessonPage,dberrorhandlerForLessons);
    },dberrorhandlerForLessons);
}

//Get response entries of all students for exercise from ResponseAndMarks Database
function getResponseEntriesForExercise(){
    console.log("Getting Response entries of all students from Response and \n Score Marks for teacher " + teacherID +", lesson " + lessonID +" and exercise " + exerciseID);
    dbShellResponsesForExercise.transaction(function(tx){
            tx.executeSql("select row_id,teacher_id,student_id,lesson_id,exercise_id,response,scoremark,comment\
               from responseandmark where teacher_id=? and lesson_id=? and exercise_id=?",[teacherID,lessonID,exerciseID]
            ,renderResponseEntriesForExercise,dberrorhandlerForResponseForExercise);
    },dberrorhandlerForResponseForExercise);
}

//Get response entries of a student for all exercises from ResponseAndMarks Database
function getResponseEntriesForStudent(){
    console.log("Getting all exercise response entries for \
    teacher " + teacherID +", lesson " + lessonID +" and student " + studentID);
    dbShellResponsesForStudent.transaction(function(tx){
            tx.executeSql("select row_id,teacher_id,student_id,lesson_id,exercise_id,response,scoremark,comment\
              from responseandmark where teacher_id=? and student_id=? order by lesson_id,exercise_id",[teacherID,studentID]
            ,renderResponseEntriesForStudent,dberrorhandlerForResponseForStudent);
    },dberrorhandlerForResponseForStudent);
}

//Get students from StudentProfile Database
function getEntries() {
    console.log("Getting Entries");
    dbShellStudents.transaction(function(tx) {
                tx.executeSql("select id,name,image from students order by name",[],renderEntries,dberrorhandler);
      }, dberrorhandler);
}

//render entries for studentProfile Database
function renderEntries(tx,results){
    console.log("Rendering Entries");
    console.log("Number of Students = " + results.rows.length);
    if (results.rows.length == 0) {
        $("#studentList").html("<p>No registered students.</p>");
    } else {
        var s = "";
        for(var i=0; i<results.rows.length; i++) {
            //console.log("resuts:" + results.rows.item(i).name);
            s += "<li><p><a href='#student?id="+results.rows.item(i).id + "'>" + results.rows.item(i).name + "</a></p></li><br>";
        }
        $("#studentList").html(s);
        
    }
    $("#studentList").listview().listview("refresh");
}

//render entries for lessons
function renderEntriesForLessons(tx,results){
    console.log("Rendering entries for lessons.");
    if (results.rows.length == 0) {
        $("#lessonsList").html("<p>レッスンはまだないです。</p>");
    } else {
        var s = "<table id='lessons'><tr>";
        console.log("Number of lessons = " + results.rows.length);
        for(var i=0; i<results.rows.length; i++) {
            //console.log("resuts:" + results.rows.item(i).name);
            s = s + "<div id ='lesson"+ i +"'>"+
                      "<li>"            +
                          "<img height='100' width='100' src='" + results.rows.item(i).exercise_image + "' ><br>"               +
                          "<p>"         +
                                "<a href='#lesson?id=" + results.rows.item(i).lesson_id + "'>" + results.rows.item(i).lesson_id + "</a>" +
                          "</p>"        +
                      "</li>"       +
                  "</div>";
        }
        s += "</tr></table>";
        $("#lessonsList").html(s);
        $("#lessonsList").listview().listview("refresh");
    }
}

//render entries for exercise
function renderEntriesForExerciseInLessonPage(tx,results){
    console.log("Rendering exercise entries for lesson " + lessonID);
    if (results.rows.length == 0) {
        $("#exerciseList").html("<p>このレッスンには練習はまだ入ってないです。</p>");
    } else {
        var s = "<table id='exercises'><tr>";
        console.log("Number of exercises = " + results.rows.length + "in lesson "+ lessonID);
        for(var i=0; i<results.rows.length; i++) {
//            console.log("resuts:" + results.rows.item(i).exercise_id);
            s = s + "<div id ='exercise"+ i +"'>"+
                      "<li>"            +
                          "<img height='100' width='100' src='" + results.rows.item(i).exercise_image + "' ><br>"               +
                          "<p>"         +
                                "<a href='#exercise?id=" + results.rows.item(i).exercise_id + "'>" + results.rows.item(i).exercise_title + "</a>" +
                          "</p>"        +
                      "</li>"       +
                  "</div>";
        }
        s += "</tr></table>";
        $("#exerciseList").html(s);
        $("#exerciseList").listview().listview("refresh"); 
    }
}

//render responses for an exercise
function renderResponseEntriesForExercise(tx,results){
    console.log("Rendering response entries of all students for exercise " + exerciseID + " of lesson "+ lessonID + " of teacher " + teacherID);
    if (results.rows.length == 0) {
        console.log("No row found for the query in responseandmark table");
        $("#studentListForEx").html("<p>この練習はだれも答えてないです。</p>");
    } else {
        var s = "<table id='studentAndScores'><tr>";
        console.log("Number of responses from students = " + results.rows.length);
        
        dbShellStudents = window.openDatabase("StudentProfile",2,"StudentProfile",1000000);
        
        //open student database
        //get info from StudentProfile database for student_id
        dbShellStudents.transaction(setupTable,dberrorhandler,function(){
                console.log("Getting student entries for exercise.");

                dbShellStudents.transaction(
                         function(tx){
//                                console.log("teacher = " + item.teacher_id + "student=" + item.student_id + "lesson" + item.lesson_id + "exercise" + item.exercise_id + "response=" + item.response);
                                dbShellStudents.transaction(function(tx){
                                    for(var i=0; i<results.rows.length; i++) {
                                        //getting student info
                                        var student_ID = results.rows.item(i).student_id;
                                
                                        var studentImageURI;
                                        var studentName;
                                
                                        var item = results.rows.item(i);
                                        console.log("i="+i+"id=" + student_ID); //+ "name=" + studentName);
                                        (function(student_ID){
                                            tx.executeSql("select id,name,image from students where id=?",[student_ID],
                                                function(tx,res){
                                                    //studentID is unique
                                                    studentImageURI = res.rows.item(0).image;
                                                    studentName = res.rows.item(0).name;
                                                    //
                                                    //show student image, student name and score mark
                                                    s = s +
                                                    "<div id ='responseFromStudent?id=" + i + "'>"+
                                                        "<li>"            +
                                                        "<img height='40' width='40' src=\"" + studentImageURI + "\" ><br>"               +
                                                        "<p>"         +
                                                        //
//                                              if(results.rows.item(i).scoremark != null){
//                                                     s += "<p> スコアー:" + results.rows.item(i).scoremark + "</p>";
//                                              }else{
//                                                      s += "";
//                                              }
                                                        "<a href='#response?studentID=" + student_ID + "'> 学生名:" + studentName + "</a>" +
                                                        "</p><br>";

                                                    s +="</li>"+"</div>";

                                                },
                                                function(err){
                                                    console.log("Student info get Error: "+err.message + "\nCode="+err.code);
                                                    alert("Student info get Error: "+err.message + "\nCode="+err.code);
                                                }
                                            );

                                        })(student_ID);
                                    }//end for
                                }
                                ,dberrorhandler,
                                    function(){
                                        s +="</tr>"+"</table>";
                                        console.log(s);
                                        console.log("Showing the list");
                                        $("#studentListForEx").html(s);
                                        $("#studentListForEx").listview().listview("refresh");
                                    }
                                );
                        },
                        dberrorhandler
                );
                
        });
     }
}

//Lessons Database Error Handler
function dberrorhandlerForLessons(err){
    console.log("Lessons DB Error: "+err.message + "\nCode="+err.code);
    alert("Lessons DB Error: "+err.message + "\nCode="+err.code);
}

//Response entries for a exercise Database Error Handler
function dberrorhandlerForResponseForExercise(err){
    console.log("Response entries for Exercise DB Error: "+err.message + "\nCode="+err.code);
    alert("Response entries for Exercise DB Error: "+err.message + "\nCode="+err.code);
}

//Response entries for a student error handler
function dberrorhandlerForResponseForStudent(err){
    console.log("Response entries for a student DB Error: "+err.message + "\nCode="+err.code);
    alert("Response entries for for a student DB Error: "+err.message + "\nCode="+err.code);
}

//StudentProfile Database Error Handler
function dberrorhandler(err){
    console.log("Student Profile DB Error: "+err.message + "\nCode="+err.code);
    alert("Student Profile DB Error: "+err.message + "\nCode="+err.code);
}

//counting lessons from database
function countLessonsFromDatabase(tID){
    var lessonNum;
    console.log(lessonNum);
}


//snowfall effect
function snowfall(){
	//canvas init
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	
	//canvas dimensions
	var W = window.innerWidth;
	var H = window.innerHeight;
	canvas.width = W;
	canvas.height = H;
	
	//snowflake particles
	var mp = 25; //max particles
	var particles = [];
	for(var i = 0; i < mp; i++)
	{
		particles.push({
			x: Math.random()*W, //x-coordinate
			y: Math.random()*H, //y-coordinate
			r: Math.random()*4+1, //radius
			d: Math.random()*mp //density
		})
	}
	
	//Lets draw the flakes
	function draw()
	{
		ctx.clearRect(0, 0, W, H);
		
		ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
		ctx.beginPath();
		for(var i = 0; i < mp; i++)
		{
			var p = particles[i];
			ctx.moveTo(p.x, p.y);
			ctx.arc(p.x, p.y, p.r, 0, Math.PI*2, true);
		}
		ctx.fill();
		update();
	}
	
	//Function to move the snowflakes
	//angle will be an ongoing incremental flag. Sin and Cos functions will be applied to it to create vertical and horizontal movements of the flakes
	var angle = 0;
	function update()
	{
		angle += 0.01;
		for(var i = 0; i < mp; i++)
		{
			var p = particles[i];
			//Updating X and Y coordinates
			//We will add 1 to the cos function to prevent negative values which will lead flakes to move upwards
			//Every particle has its own density which can be used to make the downward movement different for each flake
			//Lets make it more random by adding in the radius
			p.y += Math.cos(angle+p.d) + 1 + p.r/2;
			p.x += Math.sin(angle) * 2;
			
			//Sending flakes back from the top when it exits
			//Lets make it a bit more organic and let flakes enter from the left and right also.
			if(p.x > W+5 || p.x < -5 || p.y > H)
			{
				if(i%3 > 0) //66.67% of the flakes
				{
					particles[i] = {x: Math.random()*W, y: -10, r: p.r, d: p.d};
				}
				else
				{
					//If the flake is exitting from the right
					if(Math.sin(angle) > 0)
					{
						//Enter from the left
						particles[i] = {x: -5, y: Math.random()*H, r: p.r, d: p.d};
					}
					else
					{
						//Enter from the right
						particles[i] = {x: W+5, y: Math.random()*H, r: p.r, d: p.d};
					}
				}
			}
		}
	}
	
	//animation loop
	setInterval(draw, 33);
}




