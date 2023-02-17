/************************************************************************ *********
 * WEB322 – Assignment 03
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
 * of this assignment has been copied manually or electronically from any other source
 * (including 3rd party web sites) or distributed to other students. *
 * Name: Aayush Sapkota Student ID: 152406211 Date: feb 17, 2023 *
 * Cyclic Web App URL: ________________________________________________________ *
 * GitHub Repository URL: ______________________________________________________
 * ********************************************************************************/
var blogService = require("./blog-service.js"); // Blog Service Module
const express = require("express"); // instance of the express app
const path = require("path");
const app = express();

// Defining the "static" middleware to serve static files
app.use(express.static("public"));

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// ====== cloudinary configuration ====== //
cloudinary.config({
  cloud_name: "dt1wsxch5",
  api_key: "959354861721274",
  api_secret: "P9WPAgDyFC3HSGmIR_A7yuCMsS8",
  secure: true,
});

const upload = multer(); // no { storage: storage }

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

// setup another route to listen on /posts
app.get("/posts", (req, res) => {
  // Checking if a category was provided
  if (req.query.category) {
    blogService
      .getPostsByCategory(req.query.category)
      .then((data) => {
        res.send(data);
      })
      // Error Handling
      .catch((err) => {
        res.send(err);
      });
  }

  // Checking if a minimum date is provided
  else if (req.query.minDate) {
    blogService
      .getPostsByMinDate(req.query.minDate)
      .then((data) => {
        res.send(data);
      })
      // Error Handling
      .catch((err) => {
        res.send(err);
      });
  }

  // Checking whether no specification queries were provided
  else {
    blogService
      .getAllPosts()
      .then((data) => {
        res.send(data);
      })
      // Error Handling
      .catch((err) => {
        res.send(err);
      });
  }
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

// Adding a routes in server.js to support the new view
app.get("/posts/add", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/addPost.html"));
});

// post request for post add
app.post("/posts/add", upload.single("featureImage"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };
    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }
    upload(req).then((uploaded) => {
      // added error handling
      processPost(uploaded.url).catch((err) => {
        res.send(err);
      });
    });
  } else {
    processPost("");
  }

  function processPost(imageUrl) {
    req.body.featureImage = imageUrl;

    let postObj = {};

    postObj.body = req.body.body;
    postObj.title = req.body.title;
    postObj.postDate = Date.now();
    postObj.category = req.body.category;
    postObj.featureImage = req.body.featureImage;
    postObj.published = req.body.published;

    // Adding the post if everything is okay
    // Only add the post if the entries make sense
    if (postObj.title) {
      addPost(postObj);
    }
    res.redirect("/posts");
  }
});

// get post by id
app.get("/post/:value", (req, res) => {
  blogService
    .getPostById(req.params.value)
    .then((data) => {
      res.send(data);
    })
    // Error Handling
    .catch((err) => {
      res.send(err);
    });
});

// Defining the custom 404 error handling route
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

// Start the server
const port = process.env.PORT || 8080;
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
