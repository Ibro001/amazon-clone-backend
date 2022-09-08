const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const products = require('./products');
const Order = require('./Order');
const Stripe = require('stripe')('sk_test_51LcVfmC6XiTjG1nLnkl8ciQk0zxarptu88QWu0SDYKqtenNiWzumrzdP4D4RAMAn9aXukCP9ALxnPA5U3PreT7DN00f5yztM0V'); //secret key//
const bcrypt = require('bcryptjs');
const User = require('./User');



const app = express();
const port = process.env.PORT || 3001; /**use heroku port or our custom port */

// MIDDLEWARE //

app.use(express.json());
app.use(cors());

// CONNECTION URL //
const connection_url = 'mongodb+srv://ibro001:kaliLINUX2525@Blog.llrgipw.mongodb.net/?retryWrites=true&w=majority'

mongoose.connect(connection_url,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}); 

//  HomePage API //

app.get('/', (req,res) => {
    res.status(200).send('Home Page')
});

// ADD PRODUCT API //
app.post('/products/add', (req, res) => {
    const productDetail = req.body;

    console.log('productDetails>>>>>', productDetail);

    products.create(productDetail, (err, data) => {
        if (err){
            res.status(500).send(err.message);
        } else {
            res.status
            (201).send(data);
        }
    }); //store product details in our schema//
});


//API to get our data from the DB//
app.get('/products/get/', (req,res) => {
    products.find((err,data) => {
        if (err) {
            res.status(500).send(err.message);
        }else{
            res.status(200).send(data);
        }
    });
});

// API FOR SIGNUP //
app.post('/auth/signup', async(req,res) => {
    const { email, password, fullName} = req.body;

    const encrypt_password = await bcrypt.hash(password, 10);

    const userDetail = {
        email: email,
        password: encrypt_password,
        fullName: fullName,
    };

    //check if user exist or not //
    const user_exist = await User.findOne({email: email});

    if (user_exist) {
        res.send({message: 'This Email is already in use !'});
    } else {
        User.create(userDetail, (err,result) => {
            if (err) {
                res.status(500).send({message: err.message});
            } else {
                res.send({message: 'User Created Succesfully'});
            }
        });
    }
});

// API FOR LOGIN //
app.post('/auth/login', async (req, res) => {
    const {email, password} = req.body;

    const userDetail = await User.findOne({email: email});

    if (userDetail){
        if (await bcrypt.compare(password, userDetail.password)){
            res.send(userDetail);
        } else {
            res.send({Error: 'Invalid Password'});
        }
    } else{
        res.send({Error: 'User does not exist'});
    }
});

// Payment API //
app.post('/payment/create', async(req, res) => {
    const total = req.body.amount;
    console.log('total>>>', total);

    const payment = await Stripe.paymentIntents.create({
        amount: total * 100,
        currency: 'usd',
    });

    res.status(201).send({
        clientSecret: payment.client_secret, 
    });
}); 

// API TO ADD ORDER DETAILS TO DB //
app.post('/orders/add', (req,res) => {

    const products = req.body.basket;
    const price = req.body.price;
    const email = req.body.email;
    const address = req.body.address;

    const orderDetail = {
        products: products, 
        price: price, 
        email: email, 
        address: address
    };
    Order.create(orderDetail, (err, result) => {
        if (err){
            console.log(err);
        } else {
            console.log('order added to database>>>', result);
        }
    });
});

app.post('/orders/get', (req, res) => {
    const email = req.body.email;

    Order.find((err, result) => {
        if (err) {
            console.log(err.message);
        } else {
            const userOrders = result.filter( (order) => order.email === email ); //filter to get each users email from the dB//
            res.send(userOrders);
        }
    });
});

app.listen(port, () => console.log('listening for request @ 3001'));
