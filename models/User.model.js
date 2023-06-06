const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    username: {
      type: String,
      maxLength: 20,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
    },

    password: {
      type: String,
      required: [true, 'Password is required.']
    },

    profilePic: {
      type: String,
      default: "",
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`    
    timestamps: true
  }
);

const User = model("User", userSchema);

module.exports = User;
