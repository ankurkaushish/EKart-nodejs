let mongoose =require('mongoose');


//articel schema
let cartSchema=mongoose.Schema({
    product_name:{
        type:String,
        required:true
    },
    product_quantity:{
        type:Number,
        required:true
    },
    product_price:{
        type:Number,
        required:true
    }
});
let Cart =module.exports =mongoose.model('Cart',cartSchema);