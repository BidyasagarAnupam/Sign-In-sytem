require('dotenv').config();

const express = require("express");
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
require("./db/conn");
const Register = require("./models/registers");

const app = express();
const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const templates_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

// For all static folder link css, js and others
app.use(express.static(static_path));

// For use of josn data
app.use(express.json());

// To get the data of form
app.use(express.urlencoded({ extended: true }));

// For all template engine
app.set("view engine", "hbs");

// Change the views path
app.set("views", templates_path);

// Use Partials
hbs.registerPartials(partials_path);

console.log(process.env.SECRET_KEY);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

// Create a new user in our db
app.post("/register", async (req, res) => {
  try {
    const password = req.body.pass;
    const confirmPassword = req.body.re_pass;

    if (password == confirmPassword) {
      // To create an Instance of the collection
      const registerEmployee = new Register({
        firstname: req.body.fname,
        lastname: req.body.lname,
        email: req.body.email,
        gender: req.body.gender,
        phone: req.body.tel,
        age: req.body.age,
        password: password,
        confirmpassword: confirmPassword,
      });

      // Call the function for generate the token
      const token = await registerEmployee.generateAuthToken();
      console.log(`The return token is ${token}`);

      // Save the Instance
      const registered = await registerEmployee.save();
      console.log(`The page part : ${registered}`);

      console.log(registered);

      res.status(201).render("index");
    } else {
      res.send("Password and confirm password must be equal");
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

// Signin
app.post("/login", async (req, res) => {
  try {
    const email = req.body.your_email;
    const password = req.body.your_pass;

    const userEmail = await Register.findOne({ email: email });

    const isMatch = await bcrypt.compare(password, userEmail.password);

    // Call the function for generate the token (Middlewear)
    const token = await userEmail.generateAuthToken();
    console.log(`The sign in token: ${token}`);

    if (isMatch) {
      res.status(201).render("index");
    } else {
      res.status(400).send("Invalid Login Details");
    }
  } catch (e) {
    res.status(400).send("Invalid Login Details");
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
