const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const alert = require("alert");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true,
  useUnifiedTopology: true
}));
app.use(express.static(__dirname + "/public"));

mongoose.connect("mongodb+srv://admin-yash:Tanishq562000@cluster0.7ouhp.mongodb.net/bankdb?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const bankSchema = {
  firstname: String,
  lastname: String,
  age: Number,
  email: String,
  accountnumber: String,
  ifsccode: String,
  amount: Number

};
const transactionschema = {
  from: String,
  to: String,
  amount: Number,
  remarks: String
};

const Transaction = mongoose.model("Transaction", transactionschema)
const Bank = mongoose.model("Bank", bankSchema);



app.get("/", function(req, res) {
  res.render("index");
});
app.get("/customers", function(req, res) {
  Bank.find({}, function(err, foundcust) {
    res.render("customers", {
      Bank: foundcust
    });
  })
});
app.get("/addnewcustomer", function(req, res) {
  res.render("addnewcustomer");
});
app.post("/addnewcustomer", function(req, res) {

  const fname = _.toUpper(req.body.fname);
  const lname = _.toUpper(req.body.lname);
  const age = req.body.age;
  const ifsc = _.toUpper(req.body.ifsc);
  const balance = (req.body.balance);
  const email = (req.body.email);
  const account = (req.body.account);

  const customer = new Bank({
    firstname: fname,
    lastname: lname,
    age: age,
    email: email,
    accountnumber: account,
    ifsccode: ifsc,
    amount: balance
  });
  Bank.findOne({
    accountnumber: account
  }, function(err, foundcust) {
    if (!foundcust) {

      customer.save()
      res.redirect("/");



    } else {
      console.log(err);
    }
    //res.redirect("/");
  })
});

app.get("/transactions", function(req, res) {

  Transaction.find({}, function(err, foundtrans) {
    res.render("transactions", {
      Transaction: foundtrans,

    });
  });

});




app.get("/sendmoney", function(req, res) {
  Bank.find({}, function(err, foundcust) {
    res.render("sendmoney", {
      Bank: foundcust
    });
  })
});

app.post("/sendmoney", function(req, res) {


  const fromacc = (req.body.from);
  const toacc = (req.body.to);

  const remarksacc = _.toUpper(req.body.remarks);
  const amountacc = (req.body.amount);
  // console.log(fromacc);
  const transaction = new Transaction({
    from: fromacc,
    to: toacc,
    amount: amountacc,
    remarks: remarksacc
  });


  Bank.findOne({
    accountnumber: fromacc
  }).then((foundcustomer) => {
    const x = foundcustomer.amount;

    if (fromacc === toacc) {
      alert("From and To accounts cannot be same");
      res.redirect("/sendmoney");
    } else if (amountacc > x || x <= 0) {
      alert("Available Balance in your account is less than the amount being tranferred.Kindy fill your account with sufficient funds.");
      res.redirect("/");
    } else {

      transaction.save();
    }
    foundcustomer.amount = x - amountacc;
    foundcustomer.save();
  }).catch((e) => {
    res.redirect("/");
  });
  Bank.findOne({
    accountnumber: toacc
  }).then((foundcustomerto) => {
    const y = foundcustomerto.amount;


    foundcustomerto.amount = parseInt(y) + parseInt(amountacc)
    foundcustomerto.save();

  }).catch((e) => {
    res.redirect("/");
  });





  res.redirect("/transactions");

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port || 3000, function() {
  console.log("server is on port 3000");
});