const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const employeeSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  gender: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
    unique: true,
  },
  age: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmpassword: {
    type: String,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

// Middlewear to generate a token
// methods are used when Instance is used but when a collection is used then .statics is used
// Here we can not use fat arrow function
employeeSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign(
      { _id: this._id.toString() },
      process.env.SECRET_KEY
    );

    this.tokens = this.tokens.concat({ token: token });

    await this.save();

    return token;
  } catch (e) {
    res.send("The error part" + e);
    console.log("The error part" + e);
  }
};


// Password Hashing Using Middlewear
employeeSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const passwordHash = await bcrypt.hash(this.password, 10);

    this.password = passwordHash;
    this.confirmpassword = passwordHash;
  }

  next();
});

// Create a collection(model)
const Register = new mongoose.model("Register", employeeSchema);

module.exports = Register;
