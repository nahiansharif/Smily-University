const express = require("express");
const bodyParser = require("body-parser"); 
const mysql = require("mysql2");
const { query } = require("express");
const app = express(); 
const calculateJS = require('./calculateGrades.js');

app.use(bodyParser.urlencoded({extended: true})); 
app.use(express.static("public")); 
app.set("view engine", "ejs"); 

// creating DB connection 
const db = mysql.createConnection({
    host: 'sudbidentifier.cmbde9mkqfqz.us-east-2.rds.amazonaws.com',
    port: '3306',
    user: 'admin',
    password: 'kobalis123',
    database: 'sudb'
})

//create connection to the database first 
db.connect( err => {
    if(err){ 
        console.log("first error: " + err);
        throw err; }
    console.log("SQL DB is connected "); 
})

//create database if not exist

db.query('CREATE DATABASE IF NOT EXISTS sudb', err => {
    if(err){ 
        console.log("22222 error: " + err);
        throw err; }
    console.log("db created"); 

    db.query("SHOW TABLES LIKE 'adminSU'", (err, result) => {
         
        if(err) {console.log("error:  " + err); throw err; }

        //we check whether the adminSU table is created in DB or not
        if(result.length === 0)
        {
            db.query("CREATE TABLE adminSU (username VARCHAR(50) NOT NULL UNIQUE, password CHAR(64) NOT NULL)"); 

            //writing codes for security 


              db.query("INSERT INTO adminSU (username, password) VALUES ('sNahian22', 'aprilJuly1971')", (err, result) => {
                if (err) throw err; 
                console.log("sNahian22 created password"); 
            }); 
    
            
        }
    })
})

//home page
app.get("/", (req, res) => {
    
    db.query("SHOW TABLES LIKE 'grades'", (err, result) => {

        if(err) {console.log("error:  " + err); throw err; }

        //we check whether the adminSU table is created in DB or not
        else if(result.length === 0)
        {

            res.render("home", {sg: "N/A"}); 
        }
        else{

            db.query("SELECT * FROM grades", (err, result3) => {
                if (err) throw err;


                res.render("home", {sg: result3}); 
               
              });


        }


    })
    

});



app.get("/teacherHome", (req, res) => {

    db.query('SELECT student_name FROM students WHERE student_teacher = ?', [req.query.teacherName], (err, result2) => {
        if (err) throw err;

        res.render("teacherHome", {searchedTeacher: req.query.teacherName, studentWithThisTeacher: result2});
        
    });
});

//show the selected student's detail 
app.get("/viewStudents", (req, res) => {

    
    db.query("SELECT student_name, id, student_teacher FROM students WHERE student_name = ?", [req.query.studentName], (err, result) => {
        if(err)  throw err; 

        db.query("SELECT * FROM grades WHERE id = ?", [result[0].id], (err, result3) => {
            if (err) throw err;
            const letterGrade = result3[0].history;
            console.log(letterGrade);
            res.render("viewStudents", {searchedStudent: result[0], studentGrades: result3[0]});
          });
          

        
    })

    
});

app.get("/logIn", (req, res) => {
    res.render("logIn"); 
});

app.get("/editStudents", (req, res) => {

    db.query("SELECT student_name, id, student_teacher FROM students WHERE id = ?", [req.query.studentID], (err, result) => {
        if(err)  throw err; 

        db.query("SELECT * FROM grades WHERE id = ?", [result[0].id], (err, result3) => {
            if (err) throw err;
            const letterGrade = result3[0].history;
            console.log(letterGrade);
            res.render("editStudents", {searchedStudent: result[0], studentGrades: result3[0]});
          });
          

        
    })

});



app.get("/adminHome", (req, res) => {



    db.query("SHOW TABLES LIKE 'teachers'", (err, result) => {

        if(err) {console.log("errorl:  " + err); throw err; }

        if(result.length === 0)
        {
            res.render("adminHome", {showIncome: "0", showSpend: "0", showNumOfStudents: "0", showNumOfTeacher: "0", showProfit:"0"}); 
            
       }
       else
       {
            db.query("SHOW TABLES LIKE 'students'", (err, result2) => {

                    if(err) {console.log("errorl:  " + err); throw err; }
            
                if(result2.length === 0)
                {
                    res.render("adminHome", {showIncome: "0", showSpend: "0", showNumOfStudents: "0", showNumOfTeacher: "0", showProfit:"0"}); 
                }  
                else
                {
                         
                    db.query("SELECT SUM(student_salary) AS total_fee, COUNT(*) AS total_students FROM students", (err, student) => {
                        if (err) throw err;

                        db.query("SELECT SUM(salary) AS total_salary, COUNT(*) AS total_teacher FROM teachers", (err, teacher) => {
                            if (err) throw err;
    
                            res.render("adminHome", {showIncome: student[0].total_fee, showSpend: teacher[0].total_salary, showNumOfStudents: student[0].total_students, showNumOfTeacher: teacher[0].total_teacher, showProfit:(parseInt(student[0].total_fee) - parseInt(teacher[0].total_salary))}); 
    
    
    
                        })


                    })
                }
            })
       }

   })





    
});

app.get("/searchStudent", (req, res) => {


    db.query('SELECT id, student_name FROM students', (err, result) => {

        if (err) throw err;

        res.render("searchStudent", {students: result}); 

    });


    
});

//show the name and id that is in the database for teachers

app.get("/searchTeacher", (req, res) => {

    db.query("SHOW TABLES LIKE 'teachers'", (err, result0) => {
        if(err) throw err; 

        else if(result0.length === 0)
        {
            res.render('searchTeacher', { teachers: [] });
        }
        else
        {
            db.query('SELECT id, name FROM teachers', (err, result) => {
                if (err) throw err;
                
                res.render('searchTeacher', { teachers: result });
            });
        }



    })


});


app.get("/adminViewStudents", (req, res) => {
    db.query("SELECT * FROM students WHERE student_name = ?", [req.query.studentName], (err, result) => {
        if(err)  throw err; 
        else{
            res.render("adminViewStudents", {searchedStudent: result[0]});
        }
        
    })


    
});

app.get("/adminEditStudents", (req, res) => {

    db.query("SELECT * FROM students WHERE id = ?", [parseInt(req.query.id)], (err, result) => {

        if (err) throw err;

        db.query("SELECT name FROM teachers", [], (err, result2) => {

            if (err) throw err;

            res.render("adminEditStudents", { searchedStudent: result[0], teachers: result2 });
        });

    });
});

  

app.get("/adminAddStudents", (req, res) => {

    

    db.query('SELECT name FROM teachers', (err, result) => {
        if (err) throw err;
        res.render('adminAddStudents', { teachers: result });
    });
      

 

    
});

//when teacher search bar found something in database for teacher, it's going to display the searched item 

app.get("/adminViewTeacher", (req, res) => {

    db.query("SELECT * FROM teachers WHERE name = ?", [req.query.teacherName], (err, result) => {
        if(err)  throw err; 
        else{

            // get students who has this teacher

            db.query("SHOW TABLES LIKE 'students'", (err, result0) => {
                if(err) throw err; 
                else if (result0.length === 0)
                {
                    res.render("adminViewTeacher", {searchedTeacher: result[0], studentWithThisTeacher: []});
                }
                else
                {
                    db.query('SELECT student_name FROM students WHERE student_teacher = ?', [req.query.teacherName], (err, result2) => {
                        if (err) throw err;

                            res.render("adminViewTeacher", {searchedTeacher: result[0], studentWithThisTeacher: result2});
                        
                    });
           

                }



            })
   
            

        }
        
    })

});


app.get("/adminEditTeacher", (req, res) => {
    db.query("SELECT * FROM teachers WHERE id = ?", [parseInt(req.query.id)], (err, result) => {
    if (err) throw err;
  
        res.render("adminEditTeacher", {editTeacher: result[0]});

    })
     
});


//when adding new teacher page is open, it should start creating  a new table or be ready use it

app.get("/adminAddTeacher", (req, res) => {
    res.render("adminAddTeacher"); 

    db.query("SHOW TABLES LIKE 'teachers'", (err, result) => {

        if(err) {console.log("error:  " + err); throw err; }

        if(result.length === 0)
        {
            db.query("CREATE TABLE teachers (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(20) NOT NULL, phone_number VARCHAR(12) NOT NULL, email VARCHAR(30) NOT NULL, address VARCHAR(50) NOT NULL, salary INT NOT NULL, username VARCHAR(20) NOT NULL, password VARCHAR(20) NOT NULL)");

        }

    })
});






//log in 
app.post("/logIn", (req, res) => 
{

//send user's input and search username in the table adminSU




db.query("SELECT * FROM adminSU WHERE username = '" + req.body.username + "';", (err, results) => {
  if (err) throw err;
  if (results.length === 0) {
    // admin user not found
    
    db.query("SHOW TABLES LIKE 'teachers'", (err) => { 
        if (err) throw err;

        db.query("SELECT * FROM teachers WHERE username = '" + req.body.username + "';", (err, teacherUsername) => {
            if (err) throw err;

            if(teacherUsername.length === 0){
                res.send("Invalid username");

            }
            else
            {
                db.query("SELECT password FROM teachers WHERE password = '" + req.body.password + "';", (err, pass) => {
                    if (err) {
                        console.error('Error comparing password and hash:', err);
                      } 
                      
                      else {
                        console.log('Passwords match: ' + pass[0].password);
                        res.redirect("/teacherHome?teacherName=" + teacherUsername[0].name); 
                      }

                
                })

            }



            

        })



        
    })

    
  } 
  
  //username found now we r checking for that damn password 
  else {
    db.query("SELECT * FROM adminSU WHERE password = '" + req.body.password + "';", (err, pass) => {

        if (err) {
            console.error('Error comparing password and hash:', err);
          } 
          
          else {
            console.log('Passwords match: ' + pass[0].password);
            res.redirect("/adminHome"); 
          }

    })
   



  }
});

    
})

//teacher viewing a specific student 
app.post("/teacherHome", (req, res) => {
    
    db.query("SELECT * FROM students where student_name = ?;", [req.body.searchedStudent], (err, result) => {
        if (err) throw err;
        else if (result.length === 0){
            res.send("no result bro"  + req.body.searchedStudent);
        } 
        else{
            res.redirect("/viewStudents?studentName=" + req.body.searchedStudent);
        }
    })
    
})

// teacher is about to edit student's details

app.post("/viewStudents", (req, res) => {
    if(req.body.updateStudents)
    {
        res.redirect("/editStudents?studentID=" + req.body.updateStudents); 
    }
    else if (req.body.backToTeacherHome)
    {

        res.redirect("/teacherHome?teacherName=" + req.body.backToTeacherHome); 
    }
    
})

// teacher finished or canceled editing student's info

app.post("/editStudents", (req, res) => {

    if(req.body.backToStudentView)
    {
         res.redirect("/viewStudents?studentName=" + req.body.backToStudentView); 
    }
    else if(req.body.updatingGrades)
    {

        const { updatedMath, updatedEnglish, updatedScience, updatedHistory, updatedArt} = req.body;
  
        let letterGrades  =  calculateJS.calculateLetterGrades(parseInt(updatedMath), parseInt(updatedEnglish), parseInt(updatedScience), parseInt(updatedHistory), parseInt(updatedArt));
        let gPA =  calculateJS.calculateGPA(parseInt(updatedMath), parseInt(updatedEnglish), parseInt(updatedScience), parseInt(updatedHistory), parseInt(updatedArt));
        
console.log("letter: " + letterGrades + " gpa: " + gPA); 
        
db.query('UPDATE grades SET math = ?, english = ?, science = ?, history = ?, art = ?, letter_grade = ?, GPA = ? WHERE id = ?', [parseInt(updatedMath), parseInt(updatedEnglish), parseInt(updatedScience), parseInt(updatedHistory), parseInt(updatedArt), letterGrades, gPA, req.body.idOfStudent], (err, result) => {

    if(err) throw err; 

    res.redirect("/viewStudents?studentName=" + req.body.updatingGrades);

})


        
    }

   
})



// admin is about to open students search bar or teacher search bar details

app.post("/adminHome", (req, res) => {
    
// AH = Admin Home
    if(req.body.studentAH)
    {
        db.query("SHOW TABLES LIKE 'students'", (err, result) => {
            if (err) throw err;
          
          
            if (result.length === 0) {
  
                        db.query("CREATE TABLE students (id INT AUTO_INCREMENT PRIMARY KEY, student_Name VARCHAR(20) NOT NULL, student_teacher VARCHAR(20) NOT NULL, student_phone_number VARCHAR(12) NOT NULL, student_email VARCHAR(30) NOT NULL, student_address VARCHAR(50) NOT NULL, student_salary INT NOT NULL)");
                        db.query("CREATE TABLE grades (letter_grade VARCHAR(1) NOT NULL, GPA FLOAT, math VARCHAR(3) NOT NULL, english INT NOT NULL, science INT NOT NULL, history INT NOT NULL, art INT NOT NULL, id INT NOT NULL, FOREIGN KEY (id) REFERENCES students(id))")
                   
                        db.query('SELECT id, student_name FROM students', (err, result) => {
                            if (err) throw err;
                            res.render("searchStudent", {students: result});
                          });
             
            } else {
              db.query('SELECT id, student_name FROM students', (err, result) => {
                if (err) throw err;
                res.render("searchStudent", {students: result});
              });
            }
          });
          
          
    
    }
    else if(req.body.teacherAH)
    {
        
        res.redirect("/searchTeacher"); 
    } 
    
})


app.post("/searchStudent", (req, res) => {
    
    db.query("SELECT * FROM students where student_name = ?", [req.body.searchStudentsName], (err, result) => {
        if (err) throw err;
        else if (result.length === 0) res.send("search didnt bring any result bro");
        else{
            res.redirect("/adminViewStudents?studentName=" + req.body.searchStudentsName);
        }
    })

    
})



app.post("/adminViewStudents", (req, res) => {

    if(req.body.backToAdminStudentSearch){
        res.redirect("/searchStudent"); 
    }

    else if (req.body.deleteStudent){

        db.query("DELETE FROM grades WHERE id = ?", [req.body.deleteStudent], (err) => {
            if(err) throw err; 

            db.query("DELETE FROM students WHERE id = ?", [req.body.deleteStudent], (err) => {
                if (err) throw err;
    
                res.redirect("/searchStudent");
            })


            
        })


    }
    else if (req.body.updateStudents){
        res.redirect("/adminEditStudents?id=" + req.body.updateStudents);   
    }

    
       
})


// admin edit or cancel edit student

app.post("/adminEditStudents", (req, res) => {

console.log("d++ "); 

    if(req.body.goBacktoViewStudent){
        db.query("SELECT * FROM students where student_name = ?", [req.body.goBacktoViewStudent], (err, result) => {
            if (err) throw err;
            else if (result.length === 0) res.send("search didnt bring any result bro");
            else{
                res.redirect("/adminViewStudents?studentName=" + req.body.goBacktoViewStudent);
            }
        });
    }

    else if (req.body.updateNewInfo){

        const { studentName, teacherSelection, studentPhone, studentEmail, studentAddress, studentFee, studentId} = req.body;
        console.log(studentName + " " + teacherSelection  + " " +  studentPhone + " " +  studentEmail + " " +  studentAddress + " " +  studentFee + " " +  studentId);

        db.query('UPDATE students SET student_Name = ?, student_teacher = ?, student_phone_number = ?, student_email = ?, student_address = ?, student_salary = ? WHERE id = ?', 
        [studentName, teacherSelection, studentPhone, studentEmail, studentAddress, studentFee, parseInt(studentId)], 
        (err, result) => {
            if (err) throw err;
            
            res.redirect("/adminViewStudents?studentName=" + studentName);
        });

    }


        
})

app.post("/adminAddStudents", (req, res) => {

    if (req.body.goingTOStudentSearch)
    {
        console.log("canceling to studnet searchbar");
        res.render("searchStudent"); 

    }
    
    else if(req.body.savingNewSTudent)
    {
        
        const { studentName, teacherSelection, studentPhone, studentEmail, studentAddress, studentFee, } = req.body;

        db.query('INSERT INTO students (student_Name, student_teacher, student_phone_number, student_email, student_address, student_salary) VALUES (?, ?, ?, ?, ?, ?)', [studentName, teacherSelection, studentPhone, studentEmail, studentAddress, studentFee], (err, result) => {
            if (err) throw err;

            db.query('SELECT id FROM students ORDER BY id DESC LIMIT 1', (err, result2) => {
            
           
                    db.query("INSERT INTO grades (letter_grade, GPA, math, english, science, history, art, id) VALUES ('G', 0.0, '0', '0', '0', '0', '0', ?)", [result2[0].id], (err, result3) => {
                        if (err) throw err;
                        res.redirect("searchStudent"); 
                    })

            
            })
           
        })


    }
 




    
            
})




app.post("/searchTeacher", (req, res) => {



    db.query("SELECT * FROM teachers where name = ?", [req.body.searchedTeacherName], (err, result) => {
        if (err) throw err;
        else if (result.length === 0) res.send("search didnt bring any result bro");
        else{
            res.redirect("/adminViewTeacher?teacherName=" + req.body.searchedTeacherName);
        }
    })

        
   
    
})



app.post("/adminViewTeacher", (req, res) => {

    if(req.body.deleteTeacher){

        console.log(req.body.deleteTeacher); 
        db.query("DELETE FROM teachers WHERE id = ?", [req.body.deleteTeacher], (err, result) => {
            if (err) throw err;
        })
                
       res.redirect("/searchTeacher"); 
    }

    else if(req.body.updateTeacher){


            res.redirect("/adminEditTeacher?id=" + req.body.updateTeacher);            


        
    }

    //going back 
    else
    {
        res.redirect("/searchTeacher"); 
    }

})

app.post("/adminEditTeacher", (req, res) => {

    //when cancel button is pressed 

    if(req.body.adminCancelEditTeacher){
        
    console.log(req.body.adminCancelEditTeacher);
       res.redirect("/adminViewTeacher?teacherName=" + req.body.adminCancelEditTeacher); 

    }

    //when a change is made
    else if (req.body.adminSaveEditTeacher)
    {
    
        const { editTeachername, editTeacherphone, editTeacheremail, editTeacheraddress, editTeachersalary, editTeacherusername, editTeacherpassword,  editTeacherid} = req.body;


        db.query("SELECT name FROM teachers WHERE id = ?", [editTeacherid], (err, result) => {
            if (err) throw err;
        
            const teacherName = result[0].name;
        
            db.query('UPDATE students SET student_teacher = ? WHERE student_teacher = ?', [editTeachername, teacherName], (err, result2) => {
                if (err) throw err;
                
                // Handle success
            });
        });


        db.query('UPDATE teachers SET name = ?, phone_number = ?, email = ?, address = ?, salary = ?, username = ?, password = ? WHERE id = ?', 
        [editTeachername, editTeacherphone, editTeacheremail, editTeacheraddress, editTeachersalary, editTeacherusername, editTeacherpassword, editTeacherid], 
        (err, result) => {
            if (err) throw err;
            console.log(editTeachername+editTeacherid);





            res.redirect("/adminViewTeacher?teacherName=" + editTeachername); 
        });
        

    }

})




app.post("/adminAddTeacher", (req, res) => {
 
    const { teacherName, teacherPhone, teacherEmail, teacherAddress, teacherSalary, teacherUsername, teacherPassword } = req.body;

    db.query('INSERT INTO teachers (name, phone_number, email, address, salary, username, password) VALUES (?, ?, ?, ?, ?, ?, ?)', [teacherName, teacherPhone, teacherEmail, teacherAddress, teacherSalary, teacherUsername, teacherPassword], (err, result) => {
        if (err) throw err;
        res.redirect("/searchTeacher"); 
    })


})

//res.redirect("/searchTeacher"); 



app.listen(3000)