
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


app.post('/createColor', function(req, res){
    var name = req.body.name;
    var colorList = req.body.colorList;
    for (var i = 0 ; i < colorList.length ; i++){
        var temp = colorList[i].value.substring(5, colorList[i].value.length - 1 );

        temp = temp.split(',');
        var query = "INSERT INTO colors(id ,name, red, green, blue) VALUES ('" + (i + 1) + "', '" + name + "', '" + 
        temp[0] + "', '" + temp[1] + "', '" + temp[2] + "');"
        console.log(query);
        db.run(query, function (error){
            if (error){
                console.log("error : " + error);
            }
        });
    }

});

app.post('/deleteColor', function(req, res){
    var name = req.body.name;
    var query = "DELETE FROM color_sequence WHERE name = '" + name + "'";
    db.run(query, function(error){
        if (error){
            console.log("error : " + error);
        }
    });
});

app.post('/getColor', function(req, res){
    var colorName = req.body.name;
    var query = "SELECT * from colors ORDER BY id";
    db.all(query, function (error, row){
        if (error){
            console.log("error: " + error);
        } else {
            var temp = [];
            for (var i = 0 ; i < row.length ; i++){
                temp.push({id : row[i].id, name : row[i].name, value : "rgb(" + row[i].red + "," + row[i].green + "," + row[i].blue + ")"});
            }
            res.send(temp);
            console.dir(temp);
        }
    })
});






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

app.post('/deletePattern', function (req,res){
    var val;
    db.all("SELECT PID from pattern_list WHERE pattern_name = '" + req.body.name + "';" , function(error, row){
        val = row[0].PID;
        console.dir(row);
        console.log(val);
        db.run("DELETE FROM coordinate WHERE P2ID = " + val + ";", function(error){
            if (error){
                console.log("error ja : " + error);
            }
        })

        var query = "DELETE FROM pattern_list WHERE PID = '" + val + "';";

        db.run(query, function(error){
            if (error){
                console.log("error na ja : " + error);
            }
        });
        
    });
    
})


app.post('/getHistory', function(req,res){
    var query = "SELECT id, name , tested_date , score, time_spend, shade, shape from history_list;"
    db.all(query, function(err, row){
        if (err){
            console.log("error ja : " + err);
        } else {
            console.log(row);
            res.send(row);
        }
    });
})

app.post('/getEachHistory', function(req,res){
    var query = "SELECT xPos, yPos from history_coordinate WHERE PID = '" + req.body.name + "';";
    db.add(query, function(err, row){
        if (err){
            console.log("error get each history : " + err);
        } else {
            console.log(row);
            res.send(row);
        }
    });
});

app.post('/saveGame' , function(req,res){
    var name = req.body.name;
    var score = req.body.score;
    var fullScore = req.body.fullscore;
    var cellList = req.body.cellList;
    var timeSpend = req.body.timeSpend;
    var date = req.body.date;
    var shade = req.body.shade;
    var shape = req.body.shape;

    var realScore = score + "/" + fullScore;
    var query = "INSERT INTO history_list(name ,score, tested_date, shade, time_spend, shape) VALUES ('" + name + "', '" + realScore + "', '" + 
    date + "', '" + shade + "', '" + timeSpend + "', '" + shape + "');";

    db.run(query , function(error){
        if (error){
            console.log("error: " + error);
        }
    });
});

app.post('/savePattern' , function(req,res){
    addPattern(req.body.name, req.body.options);
    res.send({"result" : "success"});
});



console.log("Hello");
//app.listen(3616, "192.168.1.106");

app.listen(3616, "localhost");
