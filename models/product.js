const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        name : {
            type : String,
            required : [true,"Name is required"],
            // This option trims any leading or trailing whitespace from the value of the name
            trim : true 
        },
        sku : {
            type : String,
            required : true,
            default : "SKU",
            trim : true 
        },
        category : {
            type : String,
            required : [true,"Category is required"],
            trim : true 
        },
        quantity : {
            type : String,
            required : [true,"Quantity is required"],
            trim : true 
        },
        price: {
            type: String,
            required: [true, "Please add a price"],
            trim: true,
          },
        description : {
            type : String,
            required : [true,"Description is required"],
            trim : true 
        },
        image : {
            type : Object,
            default : {}
        }
    }, 
    {
        timestamps : true,
    }
);

const Product = mongoose.model("Product",productSchema)
module.exports = Product;