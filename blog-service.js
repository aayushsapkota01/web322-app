const fs = require("fs");

let posts = [];
let categories = [];

const initialize = () => {
  return new Promise((resolve, reject) => {
    fs.readFile("./data/posts.json", "utf8", (err, data) => {
      if (err) {
        reject("unable to read file : posts.json");
        return;
      }
      posts = JSON.parse(data);
      fs.readFile("./data/categories.json", "utf8", (err, data) => {
        if (err) {
          reject("unable to read file : categories.json");
          return;
        }
        categories = JSON.parse(data);
        resolve();
      });
    });
  });
};

const getAllPosts = () => {
  return new Promise((resolve, reject) => {
    if (posts.length === 0) {
      reject("no results returned");
      return;
    }
    resolve(posts);
  });
};

const getPublishedPosts = () => {
  return new Promise((resolve, reject) => {
    const publishedPosts = posts.filter((post) => post.published === true);
    if (publishedPosts.length === 0) {
      reject("no results returned");
      return;
    }
    resolve(publishedPosts);
  });
};

const getPublishedPostsByCategory = (category) => {
  return new Promise((resolve, reject) => {
    const publishedPosts = posts.filter(
      (post) => post.published == true && post.category == category
    );
    if (publishedPosts.length === 0) {
      reject("no results returned");
      return;
    }
    resolve(publishedPosts);
  });
};

const getCategories = () => {
  return new Promise((resolve, reject) => {
    if (categories.length === 0) {
      reject("no results returned");
      return;
    }
    resolve(categories);
  });
};

function addPost(postData) {
  return new Promise((resolve, reject) => {
    if (postData.published === undefined) {
      postData.published = false;
    } else {
      postData.published = true;
    }

    // Setting the next post id
    postData.id = posts.length + 1;
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${
      currentDate.getMonth() + 1
    }-${currentDate.getDate()}`;
    postData.postDate = formattedDate;

    // Adding to posts
    posts.push(postData);
    resolve(postData);
  });
}

// => Finds a post using its ID
function getPostById(id) {
  return new Promise((resolve, reject) => {
    const filteredPosts = posts.filter((post) => post.id == id);
    const uniquePost = filteredPosts[0];

    if (uniquePost) {
      resolve(uniquePost);
    } else {
      reject("no result returned");
    }
  });
}

function getPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    const filteredPosts = posts.filter((post) => post.category == category);

    if (filteredPosts.length > 0) {
      resolve(filteredPosts);
    } else {
      reject("no results returned");
    }
  });
}

function getPostsByMinDate(minDate) {
  return new Promise((resolve, reject) => {
    const filteredPosts = posts.filter(
      (post) => new Date(post.postDate) >= new Date(minDate)
    );

    if (filteredPosts.length > 0) {
      resolve(filteredPosts);
    } else {
      reject("no results returned");
    }
  });
}

module.exports = {
  initialize,
  getAllPosts,
  getPublishedPosts,
  getPublishedPostsByCategory,
  getCategories,
  addPost,
  getPostById,
  getPostsByCategory,
  getPostsByMinDate,
};
