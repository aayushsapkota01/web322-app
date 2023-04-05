const fs = require("fs");

let posts = [];
let categories = [];

const Sequelize = require("sequelize");

var sequelize = new Sequelize(
  "fzzcslqz",
  "fzzcslqz",
  "HtmfjPJi3Fg4erR-kFHom6VwXjcQ7PEM",
  {
    host: "ruby.db.elephantsql.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    query: { raw: true },
  }
);

// ========= Initialize =========
const initialize = () => {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        console.log("Database synced successfully.");
        resolve();
      })
      .catch((error) => {
        console.log("Error syncing database: ", error);
        reject("unable to sync the database");
      });
  });
};

// ========= getAllPosts =========
const getAllPosts = () => {
  return new Promise((resolve, reject) => {
    Post.findAll()
      .then((data) => {
        resolve(data);
      })
      .catch(() => {
        reject("no results returned");
      });
  });
};

// ========= getPublishedPosts =========
const getPublishedPosts = () => {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        published: true,
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch(() => {
        reject("no results returned");
      });
  });
};

// ========= getPublishedPostsByCategory =========
const getPublishedPostsByCategory = (category) => {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        published: true,
        category: category,
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch(() => {
        reject("no results returned");
      });
  });
};

// ========= getCategories=========
const getCategories = () => {
  return new Promise((resolve, reject) => {
    Category.findAll()
      .then((data) => {
        resolve(data);
      })
      .catch(() => {
        reject("no results returned");
      });
  });
};

// ========= getPostById =========
// => Finds a post using its ID
function getPostById(id) {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        id: id,
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch(() => {
        reject("no results returned");
      });
  });
}

// ========= getPostsByCategory =========
function getPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        category: category,
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch(() => {
        reject("no results returned");
      });
  });
}

// ========= getPostsByMinDate =========
function getPostsByMinDate(minDate) {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        postDate: {
          [gte]: new Date(minDateStr),
        },
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch(() => {
        reject("no results returned");
      });
  });
}

// ========= addPost =========
function addPost(postData) {
  return new Promise((resolve, reject) => {
    postData.published = postData.published ? true : false;

    for (const i in postData) {
      if (postData[i] === "") {
        postData[i] = null;
      }
    }

    postData.postDate = new Date();

    Post.create(postData)
      .then(() => {
        resolve();
      })
      .catch(() => {
        reject("unable to create post");
      });
  });
}

// =============== addCategory ===============
function addCategory(categoryData) {
  return new Promise((resolve, reject) => {
    for (const i in categoryData) {
      if (categoryData[i] === "") {
        categoryData[i] = null;
      }
    }

    Category.create(categoryData)
      .then(() => {
        resolve();
      })
      .catch(() => {
        reject("unable to create category");
      });
  });
}

// =============== deleteCategoryById ===============
function deleteCategoryById(id) {
  return new Promise((resolve, reject) => {
    Category.destroy({
      where: {
        id: id,
      },
    })
      .then(() => {
        resolve("destroyed");
      })
      .catch(() => {
        reject("was rejected");
      });
  });
}

// =============== deletePostById ===============
function deletePostById(id) {
  return new Promise((resolve, reject) => {
    Post.destroy({
      where: {
        id: id,
      },
    })
      .then(() => {
        resolve("destroyed");
      })
      .catch(() => {
        reject("was rejected");
      });
  });
}

// ========= Creating Post =========
var Post = sequelize.define("Post", {
  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  postDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN,
});

// ========= Creating Category =========
var Category = sequelize.define("Category", {
  category: Sequelize.STRING,
});

// ===== define a relationship between Posts and Categories ======
Post.belongsTo(Category, { foreignKey: "category" });

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
  addCategory,
  deleteCategoryById,
  deletePostById,
};
