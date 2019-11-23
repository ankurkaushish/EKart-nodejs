const express =require('express');
const router =express.Router();
var JSAlert = require("js-alert");

let Product=require('../models/product');


// add route
router.get('/add',function(req,res){
res.render('add_product',{
    title:'Add Product'
});
});

//add submit post route
router.post('/add',function(req,res){

        let product = new Product();
        product.product_name=req.body.pname;
        product.product_desc=req.body.pdesc;
        product.product_quantity=req.body.pquantity;
        product.product_price=req.body.pprice;
        
        
        product.save(function(err){
            if(err){
                console.log(err);
                return;
            }
            else{
                req.flash('success','Product Added');
                JSAlert.alert("Data entered successfully.");
                res.redirect('/products/add');
                
            }
        });
    




});

//update product
router.post('/edit/:id',function(req,res){
    let product={};
    product.product_name=req.body.pname;
    product.product_desc=req.body.pdesc;
    product.product_quantity=req.body.pquantity;
    product.product_price=req.body.pprice;
    
    let query={_id:req.params.id}
    
    Product.update(query,product,function(err){
        if(err){
            console.log(err);
            return;
        }
        else{
            req.flash('success','Product updated');
            res.redirect('/');
        }
    });
    });

router.delete('/:id',function(req,res){
    let query= {_id:req.params.id}

    Product.remove(query,function(err){
        if(err)
        {
            console.log(err);
        }
        res.send('Success');
    });
});
//load edit form
router.get('/edit/:id',function(req,res){
    Product.findById(req.params.id,function(err,product){
        res.render('edit_product',{
            title:'Edit product',
            product:product
        });
    });
});

//get single product
router.get('/:id',function(req,res){
    Product.findById(req.params.id,function(err,product){
        res.render('product',{
            product:product
        });
    });
});

module.exports=router;