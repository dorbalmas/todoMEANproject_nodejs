const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const cors = require("cors");
router.use(cors());

mongoose.connect("mongodb://localhost:27017/task_list", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("collection connected!!!");
});
const taskSchema = new mongoose.Schema({
  name: String,
  date: String,
  category: String,
});
const tasksModel = mongoose.model("tasks", taskSchema);

// "http://localhost:3000/tasks"
router.get("/", (req, res) => {
  tasksModel.find({}, (err, data) => {
    if (err) {
      res.json({ message: "error mongo" });
    } else {
      res.header("Access-Control-Allow-Origin", "*");
      res.json(data);
    }
  });
});
// http://localhost:3000/tasks/AddTodo
router.post("/AddTodo", async (req, res) => {
  let saveData = await tasksModel.insertMany([req.body]);
  res.header("Access-Control-Allow-Origin", "*");
  res.json(saveData[0]);
  console.log(saveData[0]);
});
// "http://localhost:3000/tasks/RemoveTodo"
router.post("/RemoveTodo", (req, res) => {
  console.log(req.body._id);
  tasksModel.deleteOne({ _id: req.body._id }).then((data) => {
    if (data.deletedCount > 0) {
      res.json({ message: "deleted" });
    } else {
      res.status(400).json({ error: "error!!! cant find id" });
    }
  });
});
// "http://localhost:3000/tasks/EditTodo"
router.post("/EditTodo", async (req, res) => {
  let changedObject = {
    name: req.body.name,
    category: req.body.category,
  };
  try {
    let updateData = await tasksModel.updateOne(
      { _id: req.body._id },
      changedObject
    );
    res.json(updateData);
  } catch {
    res.status(400).json({ message: "error!!! cant find id" });
  }
});
// `http://localhost:3000/tasks/SearchTodo/?q=${}`
router.get("/SearchTodo/", (req, res) => {
  const mySearch = new RegExp(`${req.query.q}`);
  tasksModel
    .find({
      $or: [{ name: mySearch }, { category: mySearch }, { date: mySearch }],
    })
    .then((data) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.json(data);
      console.log(data);
    });
});

module.exports = router;

// res.header("Access-Control-Allow-Origin", "*");

// // `http://localhost:3000/tasks/single/${}`
// router.get("/single/:id", (req, res, next) => {
// 	tasksModel
// 	  .findOne({ _id: req.params.id })
// 	  .then((data) => {
// 		res.json(data);
// 	  })
// 	  .catch((err) => {
// 		res.status(400).json(err);
// 	  });
//   });
//   // `http://localhost:3000/tasks/category/${}`
//   router.get("/category/:categoryId", (req, res) => {
// 	let categoryId = req.params.categoryId;
// 	tasksModel
// 	  .find({ category: categoryId })
// 	  .then((data) => {
// 		res.json(data);
// 	  })
// 	  .catch((err) => {
// 		res.status(400).json(err);
// 	  });
//   });
