
var sqlite = require('sqlite3').verbose();
var db = new sqlite.Database('qc-db.db');
var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var app = express();

app.use(function (req, res, next){
     res.header( "Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(bodyParser.json());

function addPattern(name,cellList){
    var query = "INSERT INTO pattern_list(pattern_name) VALUES ('" + name + "');";
    db.run(query, function (error){
        db.each("SELECT * FROM pattern_list WHERE pattern_name = '" + name + "';", function(err, row) {
            for (var i =  0 ; i < cellList.length; i++){
                db.run("INSERT INTO coordinate(P2ID, xPos,yPos) VALUES ('" + row.PID + "', '" + cellList[i].xPos + "', '" + cellList[i].yPos + "');", function (error){
                    if (error){
                        console.log("error : " + error);
                    }
                });       
            } 
        });
        if (error){
            console.log(error);
            console.log("insert error");
            return null;
        }
    });
}


app.post('/getPattern', function(req, res){
    var query = "SELECT pattern_name, PID, xPos, yPos from coordinate INNER JOIN pattern_list ON PID = P2ID";
    db.all(query, function(err, row) {
        if (err){
            console.log("error ja : " + err);
            
        } else {
            console.log(row);
            res.send(row);
        }
    });
});


app.post('/savePattern' , function(req,res){
    addPattern(req.body.name, req.body.options);
    res.send({"result" : "success"});
});

console.log("Hello");
app.listen(3616, "192.168.1.106");
