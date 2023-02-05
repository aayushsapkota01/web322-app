/*********************************************************************************
 * WEB322 – Assignment 02
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
 * of this assignment has been copied manually or electronically from any other source
 * (including 3rd party web sites) or distributed to other students. *
 * Name: Aayush Sapkota Student ID: 152406211 Date: Feb 05, 2023*
 * Cyclic Web App URL: https://filthy-blue-battledress.cyclic.app *
 * GitHub Repository URL: https://github.com/aayushsapkota01/web322-app
 * ********************************************************************************/
var blogService = require("./blog-service.js");
const express = require("express"); // instance of the express app
const path = require("path");
const app = express();
const port = process.env.PORT || 8080;

app.use(express.static("public")); // Defining the "static" middleware to serve static files

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
  res.redirect("/about");
});

// setup another route to listen on /about
app.get("/about", function (req, res) {
  res.sendFile(path.join(__dirname, "/views/about.html"));
});

// setup another route to listen on /blog
app.get("/blog", (req, res) => {
  blogService
    .getPublishedPosts()
    .then((posts) => {
      res.json(posts);
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

// setup another route to listen on /posts
app.get("/posts", (req, res) => {
  blogService
    .getAllPosts()
    .then((posts) => {
      res.json(posts);
    })
    .catch((error) => {
      res.json({ message: error });
    });
});

// setup another route to listen on /categories
app.get("/categories", (req, res) => {
  blogService
    .getCategories()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

// Defining the custom 404 error handling route
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

blogService
  .initialize()
  .then(() => {
    // start the server only if the initialize method is successful
    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  })
  .catch((err) => {
    // if the initialize method throws an error, output the error message to the console
    console.error("Error starting the server:", err);
  });
