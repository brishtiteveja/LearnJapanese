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

//Database Shell
var dbShellStudents=null;
//Lessons database
var dbShellLessons=null;

//Camera
var pictureSource = null;   // picture source
var destinationType = null; // sets the format of returned value

var imageURIForDBSave = ""; // image path to save in the lessons database

// Audio player
//
var my_media = null;
var mediaTimer = null;
//mediaRecorder
var mediaRec = null;



//index page load initialization
$("#indexPage").live('pageinit',function(){
            initialize();
});

//student page load initialization
$("#studentLogin").live('pageinit',function(){
            init('student');
        }
)

var teacherID;
var lessonID;
var exerciseID;
//teacher page load initialization
$("#teacher").live('pageinit',function(){
            console.log("Initialize lessons for teacher page.");
            teacherID = 1;
            initLesson();
});

$("#lesson").live('pageinit',function(){
        
});


//new Exercise page load initialization
$("#newExercisePage").live('pageinit',function(){
                console.log("New Exercise Page");
                dbShellLessons.transaction(function(tx){
                                    //get new Lesson ID
                                    tx.executeSql(
                                        "select DISTINCT lesson_id from lessons where teacher_id=?",[teacherID],
                                        function(tx,results){
                                            numberOfLessons = results.rows.length;
                                            console.log("Number of distict rows in lessons DB = " + numberOfLessons);
                                            //set new lesson id
                                            lessonID = numberOfLessons + 1;
                                            console.log("Setting new Lesson id : " + lessonID);
                                            //setting lesson id for the lesson page
                                            $(document).ready(
                                                function(){
                                                    $("#lessonID").val(lessonID);
                                                }
                                            );
                                      
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
                                                            console.log("setting " + exerciseID + " to the exerciseID hidden field")
                                                            $("#exerciseID").val(exerciseID);
                                                            console.log($("#exerciseID").val());
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
                $(document).ready(function(){
                    $("#backToTeacher").click(function(){
                            console.log("Back to teacher button pressed.");
                            $.mobile.changePage("Teacher.html",{reverse:false});
                    });
                });
});

//handle exercise form submission
$("#newExerciseForm").live("submit",function(e) {
            console.log("New exercise form submission.");
            var data =  {
                            t_id        :   teacherID,
                            l_id        :   lessonID,
                            ex_id       :   $("#exerciseID").val(), //blank id perhaps
                            ex_title    :   $("#exerciseTitle").val(),
                            ex_image    :   imageURIForDBSave
                            //ex_voice    :   $("#exerciseVoice").val()
                        };
            //console log the student data being registered
            console.log(data);
//            //registering the student
//            registerExercise(data,function() {
//            //callback function change to the next page, currently the same page
//                $.mobile.changePage("NewExercise.html",{reverse:false});
//            });
//            //Student registration success
//            console.log("Exercise Registered Successfully and page changed to New Lesson Page again.");
//            e.preventDefault();
});


function determineImageURIForDB(imageURI){
    imageURIForDBSave = imageURI;
    console.log("Image URI variable set.");
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
     
        //handle form submission of a new/old student
        $("#studentRegistrationForm").live("submit",function(e) {

            var data =  {
                            id   :   $("#studentId").val(), //blank id perhaps
                            name :   $("#studentName").val(),
                            image:   $("#studentImage").val()
                        };
            //console log the student data being registered
            console.log(data);
            //registering the student
            registerStudent(data,function() {
            //callback function change to the next page, currently the same page
                $.mobile.changePage("StudentLogin.html",{reverse:false});
            });
            //Student registration success
            console.log("Student Registered Successfully and page changed.");
            e.preventDefault();
        });
        
        //will run after initial show- handles regetting the list
        $("#studentPage").live("pageshow",function(){
                               getEntries();
                               });
        
        
        //Student Page logic needs to know to get old Student record (possible)
        $("#student").live("pageshow", function() {
                //get the location
                var loc = $(this).data("url");
                //location data
                console.log("Active Page URL:"+loc);
                
                if(loc.indexOf("?") >= 0) {
                    var qs = loc.substr(loc.indexOf("?")+1,loc.length);
                    console.log("qs :" + qs);
                    var studentId = qs.split("=")[1];
                    console.log("studentId:" + studentId);
                    //load the values
                    $("#studentFormSubmitButton").attr("disabled","disabled");
                    dbShellStudents.transaction(
                                        function(tx) {
                                                tx.executeSql("select id,name,image from students where id=?",[studentId],function(tx,results) {
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
      
    }
    else if(who == 'teacher'){
        
    }
}

//registering student
function registerStudent(student,cb){ //cb for callback
  if(student.name != ""){
    console.log("Student Register Start");
    dbShellStudents.transaction(function(tx) {
                if(student.id == "")
                    tx.executeSql("insert into students(name,image) values(?,?)",[student.name,student.image]); //No need to insert student ID, because ID is the Primary Key, so automatically incremented
                else
                    tx.executeSql("update students set name=?,image=? where id=?",[student.name,student.image,student.id]);
                    },dberrorhandler,cb);
    console.log("Student Register End")
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
        console.log("Lessons Database start open.");
        dbShellLessons = window.openDatabase("Lessons",2,"Lessons",1000000);
        console.log("Lessons Database is opened");
        dbShellLessons.transaction(setupTableForLessons,dberrorhandlerForLessons,getEntriesFromLessons);
        console.log("Ran setup for Lessons Database");
    }
}

//create Table for Lessons Database
function setupTableForLessons(tx){
    console.log("before execute sql for Lessons Database");
    tx.executeSql("CREATE TABLE IF NOT EXISTS lessons(teacher_id INTEGER,lesson_id INTEGER,exercise_id INTEGER,exercise_title,\
              exercise_voice,exercise_image,PRIMARY KEY(teacher_id,lesson_id,exercise_id))");
    console.log("Created table if not existed for Lessons Database");
}

function getEntriesFromLessons(){
    console.log("Getting Lesson Entries for Teacher Page.");
    dbShellLessons.transaction(function(tx){
            tx.executeSql("select teacher_id,lesson_id,exercise_id,exercise_title,exercise_voice,exercise_image from lessons order by teacher_id,lesson_id,exercise_id",[]
            ,renderEntriesForLessons,dberrorhandlerForLessons);
    },dberrorhandlerForLessons);
}

function renderEntriesForLessons(tx,results){
    console.log("Rendering entries for lessons.");
    if (results.rows.length == 0) {
        $("#lessonsList").html("<p>レッスンはまだないです。</p>");
    } else {
        var s = "";
        for(var i=0; i<results.rows.length; i++) {
            //console.log("resuts:" + results.rows.item(i).name);
            s += "<li><p><a href='Lesson.html?id="+results.rows.item(i).id + "'>" + results.rows.item(i).name + "</a></p></li><br>";
        }
        $("#lessonsList").html(s);
        $("#lessonsList").listview().listview("refresh"); 
    }
}

function dberrorhandlerForLessons(){
    console.log("Lessons DB Error: "+err.message + "\nCode="+err.code);
    alert("Lessons DB Error: "+err.message + "\nCode="+err.code);
}

//I just create our initial table - all one of em
function setupTable(tx){
    console.log("before execute sql for studentProfile Database");
    tx.executeSql("CREATE TABLE IF NOT EXISTS students(id INTEGER PRIMARY KEY,name,image)");
    console.log("Created table if not existed for studentProfile Database");
    console.log("after execute sql in studentProfile Database");
}

//I handle getting entries from the db
function getEntries() {
    console.log("Getting Entries");
    dbShellStudents.transaction(function(tx) {
                tx.executeSql("select id,name,image from students order by name",[],renderEntries,dberrorhandler);
      }, dberrorhandler);
}

//After getting Entries from database data will be rendered in this function
function renderEntries(tx,results){
    console.log("Rendering Entries");
    console.log("Number of Students = " + results.rows.length);
    if (results.rows.length == 0) {
        $("#studentList").html("<p>No registered students.</p>");
    } else {
        var s = "";
        for(var i=0; i<results.rows.length; i++) {
            //console.log("resuts:" + results.rows.item(i).name);
            s += "<li><p><a href='student.html?id="+results.rows.item(i).id + "'>" + results.rows.item(i).name + "</a></p></li><br>";
        }
        $("#studentList").html(s);
        
    }
    $("#studentList").listview().listview("refresh");
}

//Database Error Handler
function dberrorhandler(err){
    console.log("Student Profile DB Error: "+err.message + "\nCode="+err.code);
    alert("Student Profile DB Error: "+err.message + "\nCode="+err.code);
}

//var addLessonClickCounter;
//
////Lesson Codes
//function showClickNumber(){
//    var num = addLessonClickCounter ++;
//    console.log("Number of clicks: " + num);
//}



//counting lessons from database
function countLessonsFromDatabase(tID){
    var lessonNum;
    

    console.log(lessonNum);
}
//initialize lessons for teacher page
function initLesson(){
    
    // Opening Lessons Database
    openDataBaseAndCreateTable('lessons');

////pass teacher id,lesson id to newExercise Page from the newExercise submit button
    $(document).ready(function(){
                                $("#newLessonFormButton").click(function(){
                                        console.log("New Lesson Click.");
                                        $.mobile.changePage("NewExercise.html",{reverse:false});
                                     });

                                }
    );
    
//    $("#teacher").live("pageshow",function(){
//        var loc = $(this).data("url");
//        console.log("Teacher page url : " + loc);
//        if(loc.indexOf("?") >= 0){
//            var qs = loc.substr(loc.indexOf("?")+1,loc.length);
//            var teacherID = qs.split("=")[1];
//            console.log("Teacher ID: " + teacherID);
//        }
//    })
}



//Registering exercise data in lesson database
//function registerExercise(exercise,cb){
//    if(exercise.ex != ""){
//    console.log("Student Register Start");
//    dbShellStudents.transaction(function(tx) {
//                if(student.id == "")
//                    tx.executeSql("insert into students(name,image) values(?,?)",[student.name,student.image]); //No need to insert student ID, because ID is the Primary Key, so automatically incremented
//                else
//                    tx.executeSql("update students set name=?,image=? where id=?",[student.name,student.image,student.id]);
//                    },dberrorhandler,cb);
//    console.log("Student Register End")
//  }else{
//      console.log("Can't Register Student. No name.")
//      alert("名前を入れてください。");
//  }
//}

