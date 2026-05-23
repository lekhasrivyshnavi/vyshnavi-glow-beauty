const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(express.json());

// MYSQL CONNECTION

const db = mysql.createConnection(process.env.DATABASE_URL);

db.connect((err) => {
    if (err) {
        console.log(err);
        console.log("Database connection failed");
    } else {
        console.log("Database Connected");
    }
});
app.get("/", (req, res) => {
    res.send("Backend is running successfully");
});

// LOGIN API

app.post("/login", (req, res) => {

    const { username, password } = req.body;
    console.log(username);
    console.log(password);

    const sql =
    "SELECT * FROM users WHERE username=?";

    db.query(sql, [username], async (err, result) => {
        console.log(result);

        if(err){

            res.send("Error");

        }

        else if(result.length > 0){

            const user = result[0];

            const match = await bcrypt.compare(
                password,
                user.password
            );

            if(match){

                // ADMIN LOGIN
                if(user.role === "admin"){

                    res.json({
                        success:true,
                        redirect:"index.html",
                        role:"admin"
                    });

                }

                // USER LOGIN
                else{

                    res.json({
                        success:true,
                        redirect:"index.html",
                        role:"user"
                    });

                }

            }

            else{

                res.json({
                    success:false,
                    message:"Wrong Password"
                });

            }

        }

        else{

            res.json({
                success:false,
                message:"Invalid Username or Password"
            });

        }

    });

});

// SIGNUP API

app.post("/signup", async (req,res)=>{

    const { username,password } = req.body;

    const hashedPassword =
    await bcrypt.hash(password,10);

    const sql =
    "INSERT INTO users (username,password,role) VALUES (?,?,?)";

    db.query(
    sql,
    [username,hashedPassword,"user"],

    (err,result)=>{

        if(err){

            console.log(err);

            res.json({
                success:false,
                message: err.sqlMessage
            });

        }

        else{

            res.json({
                success:true,
                message:"Signup Successful"
            });

        }

    });

});

// DELETE PRODUCT

app.delete("/delete-product/:id",(req,res)=>{

    let id = req.params.id;

    let sql =
    "DELETE FROM products WHERE id=?";

    db.query(sql,[id],(err,result)=>{

        if(err){

            console.log(err);

            res.json({
                message:"Error deleting product"
            });

        }

        else{

            res.json({
                message:"Product Deleted Successfully"
            });

        }

    });

});

// ADD PRODUCT

app.post("/add-product",(req,res)=>{

    let {
        brand,
        product_name,
        price,
        stock,
        image
    } = req.body;

    let query = `
    INSERT INTO products
    (brand,product_name,price,stock,image)
    VALUES (?,?,?,?,?)
    `;

    db.query(
    query,
    [brand,product_name,price,stock,image],

    (err,result)=>{

        if(err){

            console.log(err);

        }

        else{

            res.json(result);

        }

    });

});


app.delete("/delete-user/:id",(req,res)=>{

let id = req.params.id;

let sql = "DELETE FROM users WHERE id=?";

db.query(sql,[id],(err,result)=>{

if(err){

res.json({
message:"Error deleting user"
});

}
else{

res.json({
message:"User Deleted"
});

}

});

});

app.get("/users",(req,res)=>{

    const sql = "SELECT * FROM users";

    db.query(sql,(err,result)=>{

        if(err){

            console.log(err);

        }

        else{

            res.json(result);

        }

    });

});

// GET PRODUCTS

app.get("/products", (req, res) => {

    const sql = "SELECT * FROM products";

    db.query(sql, (err, result) => {

        if(err){
            res.send(err);
        }

        else{
            res.json(result);
        }

    });

});



// ADD STOCK

app.put("/add-stock/:id", (req, res) => {

    const id = req.params.id;

    const sql = "UPDATE products SET stock = stock + 1 WHERE id=?";

    db.query(sql, [id], (err, result) => {

        if(err){
            res.send(err);
        }

        else{
            res.json({
                message:"Stock Added"
            });
        }

    });

});



// REMOVE STOCK

app.put("/remove-stock/:id", (req, res) => {

    const id = req.params.id;

    const sql = "UPDATE products SET stock = stock - 1 WHERE id=? AND stock > 0";

    db.query(sql, [id], (err, result) => {

        if(err){
            res.send(err);
        }

        else{
            res.json({
                message:"Stock Removed"
            });
        }

    });

});

// UPDATE PROFILE

app.put("/update-profile/:username", (req, res) => {

    const username = req.params.username;

    const {
        full_name,
        email,
        mobile,
        location
    } = req.body;

    const sql = `
    UPDATE users
    SET
    full_name=?,
    email=?,
    mobile=?,
    location=?
    WHERE username=?
    `;

    db.query(
        sql,
        [full_name, email, mobile, location, username],
        (err, result) => {

            if(err){

                console.log(err);

                res.json({
                    message:"Profile Update Failed"
                });

            }

            else{

                res.json({
                    message:"Profile Updated Successfully"
                });

            }

        }
    );

});

// GET PROFILE

app.get("/profile/:username", (req,res)=>{

    const username = req.params.username;

    const sql =
    "SELECT * FROM users WHERE username=?";

    db.query(sql,[username],(err,result)=>{

        if(err){

            console.log(err);

        }

        else{

            res.json(result[0]);

        }

    });

});

// GET ADDRESSES

app.get("/addresses/:username",(req,res)=>{

    const username = req.params.username;

    const sql =
    "SELECT * FROM addresses WHERE username=?";

    db.query(sql,[username],(err,result)=>{

        if(err){

            console.log(err);

        }

        else{

            res.json(result);

        }

    });

});



// ADD ADDRESS

app.post("/add-address",(req,res)=>{

    const {
        username,
        city,
        name,
        address_line,
        pincode
    } = req.body;

    const sql = `
    INSERT INTO addresses
    (id,username,city,name,address_line,pincode)
    VALUES (?,?,?,?,?,?)
    `;

    db.query(
        sql,
        [
            Date.now(),
            username,
            city,
            name,
            address_line,
            pincode
        ],
        (err,result)=>{

            if(err){
                console.log(err);
                res.send("Address failed");
            }else{
                res.send("Address added");
            }

        }
    );

});


// DELETE ADDRESS

app.delete("/delete-address/:id",(req,res)=>{

    const id = req.params.id;

    const sql =
    "DELETE FROM addresses WHERE id=?";

    db.query(sql,[id],(err,result)=>{

        if(err){

            console.log(err);

        }

        else{

            res.json({
                message:"Address Deleted"
            });

        }

    });

});

// GET WISHLIST

app.get("/wishlist/:username",(req,res)=>{

    const username = req.params.username;

    const sql =
    "SELECT * FROM wishlist WHERE username=?";

    db.query(sql,[username],(err,result)=>{

        if(err){

            console.log(err);

        }

        else{

            res.json(result);

        }

    });

});



// ADD TO WISHLIST

app.post("/add-wishlist",(req,res)=>{

    const {
        username,
        product_name,
        price,
        image
    } = req.body;

    const sql = `
    INSERT INTO wishlist
    (username,product_name,price,image)
    VALUES (?,?,?,?)
    `;

    db.query(
    sql,
    [username,product_name,price,image],

    (err,result)=>{

        if(err){

            console.log(err);

        }

        else{

            res.json({
                message:"Added to Wishlist"
            });

        }

    });

});



// DELETE WISHLIST

app.delete("/delete-wishlist/:id",(req,res)=>{

    const id = req.params.id;

    const sql =
    "DELETE FROM wishlist WHERE id=?";

    db.query(sql,[id],(err,result)=>{

        if(err){

            console.log(err);

        }

        else{

            res.json({
                message:"Wishlist Item Removed"
            });

        }

    });

});

// GET ORDERS

app.get("/orders/:username",(req,res)=>{

    const username = req.params.username;

    const sql =
    "SELECT * FROM orders WHERE username=?";

    db.query(sql,[username],(err,result)=>{

        if(err){

            console.log(err);

        }

        else{

            res.json(result);

        }

    });

});



// ADD ORDER

app.post("/add-order",(req,res)=>{

    const {
        username,
        order_id,
        order_date,
        delivery_date,
        status,
        product_name,
        price,
        image
    } = req.body;

    const sql = `
    INSERT INTO orders
    (username,order_id,order_date,delivery_date,status,product_name,price,image)
    VALUES (?,?,?,?,?,?,?,?)
    `;

    db.query(
    sql,
    [
        username,
        order_id,
        order_date,
        delivery_date,
        status,
        product_name,
        price,
        image
    ],

    (err,result)=>{

        if(err){

            console.log(err);

        }

        else{

            res.json({
                message:"Order Added"
            });

        }

    });

});


// PLACE ORDER

app.post("/place-order",(req,res)=>{

    const {
        username,
        product_name,
        price,
        address,
        payment_method
    } = req.body;

    const sql = `
    INSERT INTO orders
    (username,product_name,price,status,address,payment_method)
    VALUES (?,?,?,?,?,?)
    `;

    db.query(
    sql,
    [
        username,
        product_name,
        price,
        "Placed",
        address,
        payment_method
    ],

    (err,result)=>{

        if(err){

            console.log(err);

        }

        else{

            res.json({
                message:"Order Placed"
            });

        }

    });

});

// GET ADMIN DETAILS

app.get("/admin/:username",(req,res)=>{

    const username = req.params.username;

    const sql =
    "SELECT * FROM admins WHERE username=?";

    db.query(sql,[username],(err,result)=>{

        if(err){

            console.log(err);

            res.status(500).json({
                message:"Database Error"
            });

        }

        else{

            if(result.length > 0){

                res.json(result[0]);

            }

            else{

                res.status(404).json({
                    message:"Admin Not Found"
                });

            }

        }

    });

});



/* UPDATE ADMIN */

app.put("/update-admin", async(req,res)=>{

    const {
        admin,
        username,
        email,
        password
    } = req.body;

    try{

        const hashedPassword =
        await bcrypt.hash(password,10);

        const sql = `
        UPDATE admins
        SET
        username=?,
        email=?,
        password=?
        WHERE username=?
        `;

        db.query(
        sql,
        [
            username,
            email,
            hashedPassword,
            admin
        ],

        (err,result)=>{

            if(err){

                console.log(err);

                res.json({
                    message:"Database Error"
                });

            }

            else{

                if(result.affectedRows > 0){

                    res.json({
                        message:"Admin Updated Successfully"
                    });

                }

                else{

                    res.json({
                        message:"Admin Not Found"
                    });

                }

            }

        });

    }

    catch(error){

        console.log(error);

        res.json({
            message:"Something went wrong"
        });

    }

});

// CREATE ADMIN

app.post("/create-admin",async(req,res)=>{

    const {
        username,
        email,
        password
    } = req.body;
    const hashedPassword =
    await bcrypt.hash(password,10);

    const sql = `
    INSERT INTO admins
    (username,email,password)
    VALUES (?,?,?)
    `;

    db.query(
    sql,
    [
        username,
        email,
        hashedPassword
    ],

    (err,result)=>{

        if(err){

            console.log(err);

            res.status(500).json({
                message:"Failed to create admin"
            });

        }

        else{

            res.json({
                message:"New Admin Created"
            });

        }

    });

});

app.get("/create-users-table",(req,res)=>{

    const sql = `
    CREATE TABLE users (

        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100),
        password VARCHAR(255),
        role VARCHAR(20)

    )
    `;

    db.query(sql,(err,result)=>{

        if(err){

            console.log(err);

            res.send(err);

        }

        else{

            res.send("Users table created");

        }

    });

});


app.get("/create-admin-user", async(req,res)=>{

    const hashedPassword =
    await bcrypt.hash("admin123",10);

    const sql = `
    INSERT INTO users
    (username,password,role)
    VALUES (?,?,?)
    `;

    db.query(
    sql,
    ["admin",hashedPassword,"admin"],

    (err,result)=>{

        if(err){

            console.log(err);

            res.send(err);

        }

        else{

            res.send("Admin user created");

        }

    });

});


// SERVER

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});