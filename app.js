//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
require('dotenv').config()

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@todolist-project.lp98reg.mongodb.net/todolistDB`);

const itemsSchema = {
  name: String
};

//const Item = mongoose.model(/*singular collection name..*/ , /*schema name..*/);
const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
  name: " Welcome to your to-do list "
});

const item2 = new Item({
  name: " Hit the + button to add new items "
});

const item3 = new Item({
  name: " <-- Hit here to delete an item "
});

const defaultItems = [item1, item2, item3];

const ListsSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("list", ListsSchema);


app.get("/", function(req, res) {

  Item.find({}, (err,result)=>{
    if(result.length === 0){
    Item.insertMany(defaultItems,(err)=> {
      if (err){
        console.log(err);
      }else {
        console.log("Successfully saved default items to DB.");
      }
    });
    res.redirect("/");
    } else{
      res.render("list", {listTitle: "Today", newListItems: result});
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const ListName = req.body.list;

  const additem = new Item({
    name: itemName
  });

  if(ListName === "Today"){ 
    additem.save();
    res.redirect("/");
  }else{
    List.findOne({name: ListName}, (err, foundList)=>{
      foundList.items.push(additem);
      foundList.save();
      res.redirect("/" + ListName);
    })
  }

});

//to delete an item.
app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, (err)=>{
      if(err){
        console.log(err)
      }else{
        console.log("successfully deleted the item.")
      }
    });
    res.redirect('/');
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err,foundList){
      if(!err) {
        res.redirect("/" + listName);
      }
    });
  }
  
});



// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });



app.get("/:listname", (req,res) =>{
  const customListName = _.capitalize(req.params.listname);

  List.findOne({name: customListName}, (err,result) => {
    
    if(!err){
      if(result){
        res.render("List", {listTitle: result.name, newListItems: result.items});
      }else{
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }
    }
  });

});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
