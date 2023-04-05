//=========  add a new Postgres server on our web-322 app using ElephantSQL =========
const Sequelize = require("sequelize");

var sequelize = new Sequelize(
  "yagjwylp",
  "yagjwylp",
  "djFNNSTBbRV4qsm9Y4ijZuZ0WuiMTnA6",
  {
    host: "isilo.db.elephantsql.com",
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
      .catch((error) => {
        reject("no results returned");
      });
  });
};

// ========= getPostsByCategory =========

function getPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        category: category,
      },
    })
      .then((data) => {
        console.log(category);
        resolve(data);
      })
      .catch(() => {
        reject("No results returned");
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
        reject("No results returned");
      });
  });
}

// ========= getPostById =========

function getPostById(id) {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        id: id,
      },
    })
      .then((data) => {
        resolve(data[0]);
      })
      .catch(() => {
        reject("No results returned");
      });
  });
}

// ========= addPost =========

const addPost = (postData) => {
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
      .catch((err) => {
        reject("Unable to create post.");
      });
  });
};

// ========= getPublishedPosts =========

function getPublishedPosts() {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        published: true,
      },
    })
      .then((posts) => {
        resolve(posts);
      })
      .catch((error) => {
        reject("no results returned");
      });
  });
}
// ========= getPublishedPostsByCategory =========

function getPublishedPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        published: true,
        category: category,
      },
    })
      .then((posts) => {
        resolve(posts);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
}

// ========= getCategories=========

function getCategories() {
  return new Promise((resolve, reject) => {
    Category.findAll()
      .then((data) => {
        resolve(data);
      })
      .catch(() => {
        reject("No results returned");
      });
  });
}

// =============== addCategory ===============
function addCategory(categoryData) {
  return new Promise((resolve, reject) => {
    for (let i in categoryData) {
      if (categoryData[i] === "") {
        categoryData[i] = null;
      }
    }

    Category.create(categoryData)
      .then((category) => {
        resolve(category);
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
        resolve("Destroyed");
      })
      .catch(() => {
        reject("Unable to delete category");
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
        resolve("Destroyed");
      })
      .catch(() => {
        reject("Unable to delete post");
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
  getPostsByCategory,
  getPostsByMinDate,
  getPostById,
  addPost,
  getPublishedPosts,
  getCategories,

  getPublishedPostsByCategory,
  addCategory,
  deleteCategoryById,
  deletePostById,
};
