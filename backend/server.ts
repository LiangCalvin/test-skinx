var express = require("express");
var cors = require("cors");
var app = express();
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
const bcrypt = require("bcrypt");
const saltRounds = 10;
var jwt = require("jsonwebtoken");
const secret = "fullstack-login";
import { Express, Request, Response } from "express";

app.use(cors());

const mysql = require("mysql2");
const { Send } = require("@mui/icons-material");

var host = "localhost";
if (process.env.NODE_ENV == "production") {
  host = "mysql-server3";
}

// Create the connection to database
const connection = mysql.createConnection({
  host: host,
  user: "root",
  password: "1234",
  database: "mydb",
});

app.get("/test", function (req: Request, res: Response, next: any) {
  res.json({'mess': "Hello"})
})

app.post("/login",jsonParser,function (req: Request, res: Response, next: any) {
    connection.execute(
      "SELECT * FROM users WHERE email=?",
      [req.body.email],
      function (err: any, users: any, fields: any) {
        if (err) {
          res.json({
            status: "error",
            message: "An error occurred during login",
            error: err,
          });
          return;
        }
        if (users.length === 0) {
          res.json({ status: "error", message: "no user found" });
          return;
        }
        // Access the first user in the array
        const user = users[0];
        // Load hash from your password DB.
        bcrypt.compare(
          req.body.password,
          users[0].password,
          function (err: any, isLogin: any) {
            if (err) {
              res.json({
                status: "error",
                message: "An error occurred during login",
                error: err,
              });
              return;
            }
            if (isLogin) {
              var token = jwt.sign({ email: users[0].email }, secret, {
                expiresIn: "1h",
              });
              res.json({
                status: "True",
                message: "login successful",
                token: token,
              });
            } else {
              res.json({ status: "False", message: "login failed" });
            }
          }
        );
      }
    );
  }
);

app.post("/auth",jsonParser,function (req: Request, res: Response, next: any) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      var decoded = jwt.verify(token, secret);
      res.json({ status: "ok", decoded });
    } catch (error) {
      res.json({ status: "error", decoded });
    }
  }
);

app.get("/home", function (req: Request, res: Response, next: any) {
  connection.query(
    "SELECT * FROM Post",
    function (err: any, results: any, fields: any) {
      if (err) {
        console.error(err); // Log any errors
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(results);
    }
  );
});

app.listen(3333, function () {
  console.log("CORS-enabled web server listening on port 3333");
});
