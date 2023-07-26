const asyncHandler = require('express-async-handler');
const Product = require('../models/product');
const cloudinary = require('cloudinary').v2;

const createProduct = asyncHandler(
    async (req, res) => {
        const {name,sku,category,quantity,price,description } = req.body;
        
        //validation.
        if(!name || !category || !quantity || !price || !description){
            res.status(404);
            throw new Error("All fields are required");
        }
        // By calling cloudinary.config() and passing an object with the appropriate credentials, you configure the Cloudinary library to use your specific Cloudinary account.
        cloudinary.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.API_KEY,
            api_secret: process.env.API_SECRET
        });
        //Image upload Manager
        let fileData = {};
        if(req.file) {       
            // Save image in cloudinary
            let uploadedFile;
            try {
                // cloudinary.uploader.upload: This is a method provided by the cloudinary library for uploading files to Cloudinary. It takes two main arguments: the file path (req.file.path) and an options object.
                uploadedFile = await cloudinary.uploader.upload(
                    req.file.path,
                    {
                        folder: "Inventory app",
                        resource_type : "image"
                    }
                )
            } catch (error) {
                res.status(500);
                throw new Error("Image could not be uploaded");
            } 
            fileData = {
                fileName: req.file.originalname,
                filePath: uploadedFile.secure_url, //req.file.path,   
                fileType: req.file.mimetype,
                fileSize: `${req.file.size/1024} KB`,
            }
        }

        //Creating Product
        const product = await Product.create({
            //because it is protect route, has access to req.user.
            user : req.user.id,
            name,
            sku,
            category,
            quantity,
            price,
            description,
            image: fileData
        });

        res.status(201).json(product);
    }
);

//Get all products
const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({user: req.user.id}).sort('-createdAt');
    res.status(200).json(products);
});

//Get single product
const getProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    //If product doesnt exist
    if( !product){
        res.status(404);
        throw new Error("Product not found!");
    }
    //Match product to user
    if(product.user.toString() !== req.user.id){
        res.status(404);
        throw new Error("User not authorized");
    }
    res.status(200).json(product);
})

//Delete product
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    //If product doesnt exist
    if(!product){
        res.status(404);
        throw new Error("Product not found");
    }
    //Match product to user
    if(product.user.toString() !== req.user.id){
        res.status(404);
        throw new Error("User not authorized");
    }
    await product.remove();
    res.status(200).json({message: "Product deleted successfully"});

});

//Update product
const updateProduct = asyncHandler(async (req, res) =>{
    const {name,sku,category,quantity,price,description } = req.body;
    const {id} = req.params;
    const product = await Product.findById(id);

    //If product doesnt exist
    if(!product){
        res.status(404);
        throw new Error("Product not found");
    }
    //Match product to user
    if(product.user.toString() !== req.user.id){
        res.status(404);
        throw new Error("User not authorized");
    }
    
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET
    });
    //Image upload Manager
    let fileData = {};
    if(req.file) {       
        // Save image in cloudinary
        let uploadedFile;
        try {
            uploadedFile = await cloudinary.uploader.upload(
                req.file.path,
                {
                    folder: "Inventory app",
                    resource_type : "image"
                }
            )
        } catch (error) {
            res.status(500);
            throw new Error("Image could not be uploaded");
        } 
        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url, //req.file.path,   
            fileType: req.file.mimetype,
            fileSize: `${req.file.size/1024} KB`,
        }
    }
    //Updating Product
    const updatedProduct = await Product.findByIdAndUpdate(
        {_id: id},
        {
            name,
            category,
            quantity,
            price,
            description,
            // This checks if the fileData object is empty by checking if the length of its keys is equal to 0
            image: Object.keys(fileData).length === 0 ? product?.image : fileData,     //if image not updated, pass the prev image.
        },
        {
            // new: true: When set to true, this option instructs Mongoose to return the modified document after the update operation is completed.
            new: true,
            // runValidators: true: By default, Mongoose does not run any validators on update operations. However, setting runValidators: true allows the update operation to trigger validation checks defined in the schema for the model. 
            runValidators: true,
        }

    )

    res.status(200).json(updatedProduct);
});
module.exports = {
    createProduct,
    getProducts,
    getProduct,
    deleteProduct,
    updateProduct,
};