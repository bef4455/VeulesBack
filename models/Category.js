const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const CategorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
    },
    {
        // this second object adds extra properties: `createdAt` and `updatedAt`    
        timestamps: true
    }
);

const User = model("Category", CategorySchema);

module.exports = User;
