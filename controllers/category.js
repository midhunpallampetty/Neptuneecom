const Category = require('../models/Category');

// Function to render the category management page

// Function to render the category management page
exports.getCategoryPage = (req, res) => {
  Category.find({})
  
    .then((categories) => {
      res.render('category', { categories });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('An error occurred!!');
    });
};


// Function to create a new category
exports.createCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    // Check if a category with the same name (case-insensitive) already exists
    const existingCategory = await Category.aggregate([
      {
        $match: {
          name: { $regex: new RegExp(`^${name}$`, 'i') }
        }
      },
      {
        $addFields: {
          errorMsg: "Category already exists!"
        }
      }
    ]);

    if (existingCategory.length > 0) {
      // If a category with the same name exists, display an alert to the user
      res.send(`
        <script>
          alert('${existingCategory[0].errorMsg}');
          window.location.href = '/category'; // Redirect to the desired page
        </script>
      `);
    } else {
      // If the category doesn't exist, create and save it
      const category = new Category({ name, description });

      category.save()
        .then(() => {
          res.redirect('/category');
        })
        .catch((err) => {
          console.error(err);
          const errorMsg = "An error occurred!!";
          res.send(`
            <script>
              alert('${errorMsg}');
              window.location.href = '/category'; // Redirect to the desired page
            </script>
          `);
        });
    }
  } catch (error) {
    console.error(error);
    const errorMsg = "An error occurred!!";
    res.send(`
      <script>
        alert('${errorMsg}');
        window.location.href = '/category'; // Redirect to the desired page
      </script>
    `);
  }
};



exports.getEditCategory = async (req, res) => {
  try {
    const categoryId = req.query.categoryId;
    console.log(categoryId);
    const category = await Category.findById(categoryId);

    if (!category) {
      // Handle the case where the category is not found
      return res.redirect('/category');
    }

    res.render('editCategory', { category });
  } catch (err) {
    console.error(err);
    const errorMsg = "'An error occurred!!";
    res.send(`
      <script>
        alert('${errorMsg}');
        window.location.href = '/category'; // Redirect to the desired page
      </script>
    `);
  }
};


exports.postEditCategory = async (req, res) => {
  try {
    const categoryId = req.query.categoryId;
   
    console.log(categoryId);
    const NewData = {
      name: req.body.name,
      description: req.body.description,
    };

    await Category.findByIdAndUpdate(categoryId, NewData);

    res.redirect('/category');
  } catch (err) {
    console.error(err);
    const errorMsg = "An error occurred!!";
    res.send(`
      <script>
        alert('${errorMsg}');
        window.location.href = '/category'; // Redirect to the desired page
      </script>
    `);
  }
};


// Function to list/unlist a category
// categoryController.js
 // Import your Category model or schema

exports.listCategory = (req, res) => {
  const categoryId = req.params.id;
  const searchTerm = req.query.search;

  Category.findById(categoryId)
    .then((category) => {
      if (!category) {
        return res.status(404).send('Category not found');
      }

      category.listed = !category.listed;

      return category.save()
        .then(() => {
          if (searchTerm) {
            // If there's a search term, redirect back to the category list with the search query
            res.redirect(`/category?search=${searchTerm}`);
          } else {
            // If no search term, redirect back to the category list without a search query
            res.redirect('/category');
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send('An error occurred!!');
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('An error occurred!!');
    });
};



// Function to delete a category
exports.deleteCategory = (req, res) => {
  const categoryId = req.params.id;

  Category.findByIdAndDelete(categoryId)
    .then((deletedCategory) => {
      if (!deletedCategory) {
        return res.status(404).send('Category not found');
      }
      res.redirect('/category');
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('An error occurred>>>>>');
    });
};

