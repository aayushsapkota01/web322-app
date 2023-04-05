/*********************************************************************************
 * WEB322 – Assignment 05
 *
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part of this
 * assignment has been copied manually or electronically from any other source (including web sites) or
 * distributed to other students.
 *
 * Name: Aayush Sapkota     Student ID: 152406211      Date: April 04, 2023
 *
 * Cyclic Web App URL: https://filthy-blue-battledress.cyclic.app
 *
 * GitHub Repository URL: https://github.com/aayushsapkota01/web322-app
 *
 * ********************************************************************************/

var blogService = require("./blog-service.js"); // Blog Service Module
const express = require("express"); // instance of the express app
const path = require("path");
const app = express();
const stripJs = require("strip-js");

//  ================== require the "express-handlebars" ==================
const exphbs = require("express-handlebars");

//  ================== Defining the "static" middleware to serve static files ==================
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));

app.engine(
  "hbs",
  exphbs.engine({
    extname: "hbs",
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute ? ' class="active" ' : "") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      safeHTML: function (context) {
        return stripJs(context);
      },
      formatDate: function (dateObj) {
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      },
    },
  })
);
app.set("view engine", "hbs");

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

app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

// ==== setup a 'route' to listen on the default url path =====
app.get("/", (req, res) => {
  res.redirect("/blog");
});

//  ================== setup another route to listen on /about ==================
app.get("/about", function (req, res) {
  res.render("about");
});

//  =========  setup another route to listen on /blog "ASSIGNMENT 4 UPDATED" =========
app.get("/blog", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blogService.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blogService.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // get the latest post from the front of the list (element 0)
    let post = posts[0];

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;
    viewData.post = post;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blogService.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData });
});

// ================== /blog/:id ==================
app.get("/blog/:id", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blogService.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blogService.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the post by "id"
    viewData.post = await blogService.getPostById(req.params.id);
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blogService.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData });
});
// setup another route to listen on /posts
app.get("/posts", (req, res) => {
  // Checking if a category was provided
  if (req.query.category) {
    blogService
      .getPostsByCategory(req.query.category)
      .then((data) => {
        data.length > 0
          ? res.render("posts", { posts: data })
          : res.render("posts", { message: "no results" });
      })
      // Error Handling
      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
  }

  // Checking if a minimum date is provided
  else if (req.query.minDate) {
    blogService
      .getPostsByMinDate(req.query.minDate)
      .then((data) => {
        data.length > 0
          ? res.render("posts", { posts: data })
          : res.render("posts", { message: "no results" });
      })
      // Error Handling
      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
  }

  // Checking whether no specification queries were provided
  else {
    blogService
      .getAllPosts()
      .then((data) => {
        data.length > 0
          ? res.render("posts", { posts: data })
          : res.render("posts", { message: "no results" });
      })
      // Error Handling
      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
  }
});

// setup another route to listen on /categories
app.get("/categories", (req, res) => {
  blogService
    .getCategories()
    .then((data) => {
      data.length > 0
        ? res.render("categories", { categories: data })
        : res.render("categories", { message: "no results" });
    })
    .catch((err) => {
      res.render("categories", { message: "no results" });
    });
});

// ================== Adding a routes in server.js to support the new view ==================
app.get("/posts/add", (req, res) => {
  blogService
    .getCategories()
    .then((categories) => {
      res.render("addPost", { categories: categories });
    })
    .catch(() => {
      res.render("addPost", { categories: [] });
    });
});

//  ================== post request for post add ==================
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
    upload(req)
      .then((uploaded) => {
        // added error handling
        processPost(uploaded.url);
      })
      .catch((err) => {
        s;
        res.send(err);
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
      blogService.addPost(postObj);
    }
    res.redirect("/posts");
  }
});

// ================== get post by id ==================
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

// Assignment 5
app.get("/categories/add", (req, res) => {
  res.render("addCategory");
});

app.post("/categories/add", (req, res) => {
  let categoryObj = {};

  categoryObj.category = req.body.category;

  // Adding the post if everything is okay
  // Only add the post if the entries make sense
  if (categoryObj.category) {
    blogService
      .addCategory(categoryObj)
      .then(() => {
        res.redirect("/categories");
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

app.get("/categories/delete/:id", (req, res) => {
  blogService
    .deleteCategoryById(req.params.id)
    .then(() => {
      res.redirect("/categories");
    })
    .catch(() => {
      console.log("Unable to remove category / Category not found");
    });
});

app.get("/posts/delete/:id", (req, res) => {
  blogService
    .deletePostById(req.params.id)
    .then(() => {
      res.redirect("/posts");
    })
    .catch(() => {
      console.log("Unable to remove post / Post not found");
    });
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
