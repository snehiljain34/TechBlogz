//Basic NPM packages
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");


//NPM packages for authentication
require('dotenv').config();
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

//NPM packages for Newsletter
const request = require("request");
const https = require("https");
const app = express();



//authentication
const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const users = [];
const Posts=[];
const blog = [];

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



app.get("/", function(req, res){
  res.render('BlogHome', {Posts: Posts});
})

app.post("/", function(req, res){

  const email = req.body.email;
  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
      }
    ]
  };

  const jsonData = JSON.stringify(data);
  const url = "https://us10.api.mailchimp.com/3.0/lists/fb9f3c895b"

  const options = {
    method: "POST",
    auth: "Snehil:b1862c821dfcd881fd186b84a4cd74aa-us10",
  }

  const request = https.request(url, options, function(response){

    if (response.statusCode === 200){
      res.render("success");
    }
    else{
      res.render("failure");
  }

    response.on("data", function(data){
      console.log(JSON.parse(data));
    });

  });

  request.write(jsonData);
  request.end();

});

app.get('/TechBlogs', checkAuthenticated, (req, res) => {
  res.render('LoggedIN', { username: req.user.username, Posts: Posts })
})

app.post("/TechBlogs", function(req, res){

  const email = req.body.email;
  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
      }
    ]
  };

  const jsonData = JSON.stringify(data);
  const url = "https://us10.api.mailchimp.com/3.0/lists/fb9f3c895b"

  const options = {
    method: "POST",
    auth: "Snehil:b1862c821dfcd881fd186b84a4cd74aa-us10",
  }

  const request = https.request(url, options, function(response){

    if (response.statusCode === 200){
      res.render("success");
    }
    else{
      res.render("failure");
  }

    response.on("data", function(data){
      console.log(JSON.parse(data));
    });

  });

  request.write(jsonData);
  request.end();

});

app.get("/TechBlogs/:username", function(req, res){
  const username = _.lowerCase(req.params.username);

  users.forEach(function(user){
    const StoredUsername = _.lowerCase(user.username);
    console.log(StoredUsername);

    if (username === StoredUsername ){
      console.log("User Found! redirecting..");
      res.render("User",{username: user.username , bio: user.bio, email: user.email, password: user.password, Posts: Posts});

    }else{
      console.log("User Not Found.");
    }
  })

  
})



app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('BlogLogin.ejs');
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/TechBlogs',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('BlogSignUp.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {

    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      username: req.body.username,
      bio: req.body.bio,
      email: req.body.email,
      password: hashedPassword
    });
    console.log(users);
    res.redirect('/login')
  } catch(err) {
    console.log(err);
    res.redirect('/register')
  }
})
app.get("/new", checkAuthenticated , function(req, res){
  res.render("newPost");
})

app.get("/TechBlogs/new/:username", function(req, res){
  const username = _.lowerCase(req.params.username);
  res.render("newPost", {username: username});
})

app.post("/TechBlogs/new/:username", function(req, res){
  const username = _.lowerCase(req.params.username);

  var flag = 0;

  Posts.forEach(function(post){
    const StoredUsername = post.username;

    if (username == StoredUsername){

        newBlogs = post.Blogs;
        var blog = {
          title     : req.body.title,
          content   : req.body.content,
          IMGurl    : req.body.IMGurl,
          category  : req.body.category
        } 
        newBlogs.push(blog);
        flag = 1;
        break;
    }
  })
  
  if (flag == 0){
    var post = {
      username : username,
      Blogs: []
    }
    var blog={
      title     : req.body.title,
      content   : req.body.content,
      IMGurl    : req.body.IMGurl,
      category  : req.body.category
    }
    var newBlogs = post.Blogs;
    newBlogs.push(blog);
    console.log(newBlogs);
    

    Posts.push(post);
  }
  
  var news = Posts.post;
  var js = news.Blogs;
  console.log(js);


  console.log(Posts);
  res.redirect("/TechBlogs");
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/')
})


app.get("/aboutus", function(req, res){
  res.render("aboutus");
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}



app.listen(3000, function(){
  console.log("Server stared on 3000");
});
