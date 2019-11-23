const express = require('express');
const path= require('path');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const expressValidator =require('express-validator');
const flash=require('connect-flash');
const session =require('express-session');
const passport =require('passport');
const config =require('./config/database');

mongoose.connect(config.database);
let db=mongoose.connection;

db.once('open',function(){
    console.log('Connected to mongodb');
})

db.on('error',function(err){
    console.log(err);
})

const app=express();

let Product=require('./models/product');

let Cart=require('./models/cart');

app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

app.use(bodyParser.urlencoded({ extended : false}))

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname,'public')));

app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
  }));

app.use(require('connect-flash')());
app.use(function(req,res,next){
    res.locals.messages = require('express-messages')(req,res);
    next();
});

app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
  }));

require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
    res.locals.user = req.user || null;
    next();
  });
  
app.get('/',function(req,res){
 Product.find({},function(err,products){
     if(err){
         console.log(err);
     }
     else{
        res.render('index',{
            title:'Products',
            products:products
            });
     }
    
 });

});

app.post('/productminus/:id',(req,res)=>{
     
    let query={_id:req.params.id};
   var q= Product.findOne(query , (err , pro)=>{
      //console.log(pro.product_quantity);
     
      //return pro.product_quantity;
      let product={};
    product.product_quantity=pro.product_quantity-req.body.quantity;
    Product.updateOne(query,product,function(err){
        if(err){
            console.log(err);
            return;
        }
        else{
            let cart = new Cart();
             cart.product_name = pro.product_name;
             cart.product_quantity=req.body.quantity;
             cart.product_price = pro.product_price;
             cart.save();
            res.redirect('/');
        }
    });
    return pro.product_quantity;
    })
    
});

app.get('/cart',async (req,res)=>{
  await Cart.find({},function(err,cartpro){
    if(err){
        console.log(err);
    }
    else{
       res.render('cartdisp',{
        cartpro : cartpro
           });
    }
   
});
});

app.get('/home',(req,res)=>{

  res.render('homepage');
})

app.post('/clearcart',(req,res)=>{
    Cart.remove({},(err,res)=>{
      if(err) console.log(err);

      
    });
  res.redirect('/');
});

app.post('/deleteproduct/:product_name',async (req,res)=>{
     
   let query={product_name:req.params.product_name};
  await Product.findOne(query,(err,pro)=>{
   if(err)
   {
     console.log(err);
   }
   else
   {
    

  Cart.findOne(query ,async (err,c)=>{
    if(err)
    {
    console.log(err);
    }
    else
    {
    let product={};
     product.product_quantity=pro.product_quantity+c.product_quantity;
    
   await  Product.updateOne(query,product,function(err){
      if(err){
          console.log(err);
          return;
      }
      else{
      }

    });
  
  }
   });
     
  }
  });
 await Cart.deleteOne(query,(err,ca)=>{
    if(err)
    console.log(err);

    else
    {
      
    }
  });
  req.flash('success','Product Deleted Successfully');
  res.redirect('/cart');
});


let products=require('./routes/products');
let users=require('./routes/users');
app.use('/products',products)
app.use('/users',users);


app.listen(3000,function(){
    console.log('server started on port 3000');
})