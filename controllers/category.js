const Category = require('../models/category');

// Function to render the category management page

// Function to render the category management page
exports.getCategoryPage = (req, res) => {
  Category.find({})
  
    .then((categories) => {
      res.render('category', { categories });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('An error occurred');
    });
};


// Function to create a new category
exports.createCategory = (req, res) => {
  const { name, description } = req.body;
  const category = new Category({ name, description });

  category.save()
    .then(() => {
      res.redirect('/category');
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('An error occurred');
    });
};


// Function to list/unlist a category
exports.listCategory = (req, res) => {
  const categoryId = req.params.id;

  Category.findById(categoryId)
    .then((category) => {
      if (!category) {
        return res.status(404).send('Category not found');
      }

      category.listed = !category.listed;
      return category.save();
    })
    .then(() => {
      res.redirect('/category');
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('An error occurred');
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
      res.status(500).send('An error occurred');
    });
};

