const express         =     require('express')
  , passport          =     require('passport')
  , FacebookStrategy  =     require('passport-facebook').Strategy
  , session           =     require('express-session')
  , cookieParser      =     require('cookie-parser')
  , bodyParser        =     require('body-parser')
  , config            =     require('../configuration/config')
  , mysql             =     require('mysql');

const router = express.Router();
  var path = require('path');
  var tokken = "" ;
  var sumrec = "" ;
  const fetch = require('node-fetch');
  const stringifyObject = require('stringify-object');
  var thenewfbtoken = "" ;
  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'nodelogin'
  });
  router.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }));
  router.use(bodyParser.urlencoded({extended : true}));
  router.use(bodyParser.json());
  router.get('/enter', function(request, response) {
    response.sendFile(path.join(__dirname + '/login.html'));
  });

  router.post('/auth', function(request, response) {
    var username = request.body.username;
    var password = request.body.password;
    if (username && password) {
      connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
        if (results.length > 0) {
          request.session.loggedin = true;
          request.session.username = username;
          response.redirect('/');
        } else {
          response.send('Incorrect Username and/or Password!');
        }			
        response.end();
      });
    } else {
      response.send('Please enter Username and Password!');
      response.end();
    }
  });


  router.get('/home', function(request, response) {
    if (request.session.loggedin) {
      response.send('Welcome back, ' + request.session.username + '!');
      
    } else {
      response.send('Please login to view this page!');
    }
  response.end();

  });

//Define MySQL parameter in Config.js file.
const pool = mysql.createPool({
  host     : config.host,
  user     : config.username,
  password : config.password,
  database : config.database
});

// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the FacebookStrategy within Passport.

passport.use(new FacebookStrategy({
    clientID: config.facebook_api_key,
    clientSecret:config.facebook_api_secret ,
    callbackURL: config.callback_url,
    profileFields: ["id", "birthday", "email", "first_name", "last_name", "gender", "picture.width(200).height(200)"],


  },
  function accestoken(accessToken, refreshToken, profile, done) {
    //console.log('user token : ' + accessToken);
     tokken = accessToken;
    process.nextTick(function  () {
      //Check whether the User exists or not using profile.id
      if(config.use_database) {
        // if sets to true
        pool.query("SELECT * from user_info where user_id="+profile.id, (err,rows) => {
          if(err) throw err;
          if(rows && rows.length === 0) {
              console.log("There is no such user, adding now");
              pool.query("INSERT into user_info(user_id,user_name) VALUES('"+profile.id+"','"+profile.username+"')");
          } else {
              console.log("User already exists in database");
          }
          
        });
      } 
     // console.log('le profil est ' + profile);

     return done(null, profile);
    });
  
  }

));


router.use(cookieParser());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(session({ secret: 'keyboard cat', key: 'sid'}));
router.use(passport.initialize());
router.use(passport.session());
router.use(express.static(__dirname + '/public'));
router.use(bodyParser.json());


router.get('/', function(req, res){
  res.render('index', { user: req.user });
  
  

});
router.get('/postid', function(req, res){
  var idd =fetch('https://graph.facebook.com/v10.0/'+pageid+'?fields=posts&access_token='+ tokken)
  .then(res => res.json())
  .then((json)=>{
  jsonfile = json.posts.data;
  console.log(jsonfile)
  var i;
  some_array = [];
  for(i = 0; i < jsonfile.length; i++) {
      postidss = jsonfile[i].id;
   some_array.push(postidss);
  }
  
  console.log(some_array);
  listlist = [];
  var j;
 for (j = 0; j < some_array.length; j++) {
 var posmec = fetch('https://graph.facebook.com/v10.0/'+some_array[j]+'/?fields=attachments{media},reactions.summary(true)&access_token='+thenewfbtoken+'')
 .then(res => res.json())
 .then(json => console.log('le post en question : '  + json.id  +  '   nombre des reactions du post : ' + json.reactions.summary.total_count))
  } 
  res.render('classement');

  
  });
});

router.get('/usrinf', function(req, res){
  var htt =fetch('https://graph.facebook.com/'+pageid+'?fields=access_token&access_token=' + tokken)
  .then(res => res.json())
  .then((json)=>{
  thenewfbtoken = json.access_token;
  
  var infuser =fetch('https://graph.facebook.com/v10.0/'+pageid+'/insights?access_token='+thenewfbtoken+'&pretty=0&metric=page_fans_country,page_fans_city,page_fans_gender_age')
 .then(res => res.json())
 .then((json)=>{
  // console.log(infuser)
   //console.log('le nom du metric est:' + json.data[0].name +' et les valuers du metric sont : '+json.data[0].values[1])
   //console.log('le nom du metric est:' + json.data[1].name  +' et les valuers du metric sont : '+ json.data[1].values[1])
   //console.log('le nom du metric est:' + json.data[2].name  +' et les valuers du metric sont : '+ json.data[2].values[1])
//console.log(json.data[0].values[1].value)
var page_fans_country = json.data[0].name;
var page_fans_city = json.data[1].name;
var page_fans_gender_age = json.data[2].name;
var countrydetails = json.data[0].values[1].value;
var citydetails = json.data[1].values[1].value;
var agedetails =json.data[20].values[1].value; 
//console.log('page_fans_country : '+page_fans_country+ ' les valeurs '+ infdetails)
  //jsonfile = json.values;
 //console.log(jsonfile)
});
});
});


router.get('/ranking', function(req, res){
  var htt =fetch('https://graph.facebook.com/'+pageid+'?fields=access_token&access_token=' + tokken)
  .then(res => res.json())
  .then((json)=>{
  thenewfbtoken = json.access_token;
  
  var rank =fetch('https://graph.facebook.com/v10.0/'+pageid+'/posts?fields=followers_count,full_picture,created_time,shares,likes.summary(true),comments.limit(0).summary(true).limit(0),insights.metric(post_reactions_like_total,post_reactions_love_total,post_reactions_wow_total,post_reactions_haha_total,post_reactions_sorry_total,post_reactions_anger_total,post_clicks,post_engaged_users,post_impressions_unique)&access_token='+thenewfbtoken+'&limit=100')
 .then(res => res.json())
 .then((json)=>{
//console.log(json.data[0])
var i ; 
var tabp = [];
for (i = 0; i < json.data.length; i++) {
/*
console.log('---------------------------------------------------------------------------------')
console.log('post id : ' + json.data[i].id) 
console.log('total shares : ' + json.data[i].shares.count)
console.log('total likes : ' + json.data[i].likes.summary.total_count)
console.log('total comments : ' + json.data[i].comments.summary.total_count)
//console.log(json.data[i].insights.data[0].values[0].value)
console.log('post clicks :' + json.data[i].insights.data[6].values[0].value)
console.log('post engaged users :' + json.data[i].insights.data[7].values[0].value)
console.log('post_impressions_unique :' + json.data[i].insights.data[8].values[0].value)  */
var toty = json.data[i].insights.data[0].values[0].value + json.data[i].insights.data[1].values[0].value + json.data[i].insights.data[2].values[0].value + json.data[i].insights.data[3].values[0].value + json.data[i].insights.data[4].values[0].value + json.data[i].insights.data[5].values[0].value
//console.log('post reaction total : ' + toty )
//console.log('---------------------------------------------------------------------------------')



var myArray = {p_id: json.data[i].id, likes: json.data[i].likes.summary.total_count, comments :  json.data[i].comments.summary.total_count, clicks : json.data[i].insights.data[6].values[0].value, engaged_users : json.data[i].insights.data[7].values[0].value, post_impr : json.data[i].insights.data[8].values[0].value,  reaction_total : toty };
tabp.push(myArray)

}
console.log(tabp.sort(function (a, b) {
  return b.post_impr - a.post_impr;
}))

});
});
});


router.get('/auth/facebook', passport.authenticate('facebook', { scope : ['email'] }));


router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect : '/', failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  }); 

  router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});



router.post('/facebook' , (req,res) => {
  var pageid = req.body.pageid;
 // console.log(pageid);
var htt =fetch('https://graph.facebook.com/'+pageid+'?fields=access_token&access_token=' + tokken)
.then(res => res.json())
.then((json)=>{
thenewfbtoken = json.access_token;

//console.log('tokenp'+thenewfbtoken);
 // console.log('tokenp'+thenewfbtoken)
var startdate = req.body.startdate;
  var enddate = req.body.enddate;
var htt =fetch('https://graph.facebook.com/v10.0/'+pageid+'/insights?access_token='+thenewfbtoken+'&pretty=0&metric=page_impressions,page_views_total,page_impressions_unique,page_total_actions,page_engaged_users,page_fans,page_fan_adds_unique,page_fans,page_actions_post_reactions_like_total,page_actions_post_reactions_love_total,	page_actions_post_reactions_wow_total,	page_actions_post_reactions_haha_total,	page_actions_post_reactions_sorry_total,page_actions_post_reactions_anger_total&since='+startdate+'&until='+enddate+'&period=day')

.then(res => res.text())
// .then(text => res.json(text)) 
.then(text => {
  // console.log(text);
var obj = JSON.parse(text);
//var obj = JSON.stringify(text);
var values = obj.data ;
//res.json(obj.data);
res.render('table', { data: values});
})

.catch(err => {
  console.log(err);
});
});
});

router.get('/admins', function(req, res){
  var mynewlist= [] ;
  var gh =fetch('https://graph.facebook.com/me?fields=accounts&access_token='+ tokken)
  .then(res => res.json())
 .then((json)=>{
  for (i = 0; i < json.accounts.data.length; i++) {
  pagename = json.accounts.data[i].name;
  pageid = json.accounts.data[i].id;
   mynewlist.push({ pagename , pageid })
}

  res.render('form', { mylist:mynewlist});

 });

});


function ensureAuthenticated(req, res, next) {
 // console.log('the new req' + req);
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
module.exports = router;
