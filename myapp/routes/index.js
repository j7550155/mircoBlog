var express = require('express');
var router = express.Router();
var rp = require('request-promise');
var cheerio = require('cheerio');

var dbo=require('../models/expDB.js')
// var MongoClient = require('mongodb').MongoClient;
// var url = 'mongodb://johnson:as072400@ds263917.mlab.com:63917/exp-test';
// MongoClient.connect(url, function (err, client) {
//   if (err) throw err;
//   dbo = client.db('exp-test');
//   console.log('db connected');
//   dbo.collection('posts').find().toArray((err, result) => {
//     if (err) return console.log(err);
//     postCount = result.length;
//     console.log('postCounts:' + postCount);

//   })
// });


var isLogin = false;
var user_id = '';
// var posts = [{ id: 1, name: 'jack', post: 'say something' },
// { id: 2, name: 'john', post: 'say anything' },
// { id: 3, name: 'john', post: 'say anything again' }];


var checkLoginState = function (req, res) {
  isLogin = false;
  //console.log(req.signedCookies.user);
  if (req.signedCookies.user && req.signedCookies.pwd) {
    user_id = req.signedCookies.user;
    isLogin = true;  
  }
  console.log('loginState:' + isLogin + " user:" + req.signedCookies.user);

};

var checkId = function (req, res, callback) {
  var username = req.body['id'];
  var pwd = req.body['pwd'];

  dbo.getUser(username,function(err,result){
    if (result != null) {
      console.log('id重複');
      return res.render('signup',{msg:'使用者名稱重複'});
    }
    callback();
  })
  // dbo.collection('users').findOne({ username: username }, function (err, result) {
  //   console.log(result);
  //   if (result != null) {
  //     console.log('id重複');
  //     return res.redirect('/signup');
  //   }
  //   callback();
  // })

}

var login = function (req, res, callback) {
  var username = req.body['id'];
  var pwd = req.body['pwd'];

  dbo.login(username,pwd,function(err,result){
    if (result != null) {
      console.log('login success');
    } else {
      console.log('login fails');
      return res.render('login',{msg:'帳號密碼錯誤'});
    }
    callback();
  })
  // dbo.collection('users').findOne({ username: username, pwd: pwd }, function (err, result) {
  //   if (err) throw console.log(err);
  //   if (result != null) {
  //     console.log('login success');
  //   } else {
  //     console.log('login fails');
  //     return res.redirect('/login');
  //   }
  //   //return res.redirect('/');
  //   callback();

  // })
}

/* GET home page. */
router.get('/',function (req, res, next) {
  checkLoginState(req, res);

  // dbo.collection('posts').find().toArray((err, result) => {
  //   if (err) return console.log(err);
  //   console.log(result.length);
  // })
  //res.render('index', { title: 'mircoBlog', loginState: isLogin, user_id: user_id, posts: result });
  res.redirect('/p/1');
});

// router.get('/hello', function (req, res, next) {
//   res.render('hello', { title1: 'hello' });
// });
router.get('/signup', function (req, res, next) {
  // checkLoginState(req, res);
  res.render('signup');
});

router.post('/signup', function (req, res, next) {

  checkId(req, res, function () {
    console.log('開始註冊程序')
    if (req.body['pwd'] != req.body['pwd2']) {
      console.log('pwd!=pwd2');
      res.render('signup' ,{msg:'密碼不一致'});
    } else {
      var obj = {
        username: req.body['id'],
        pwd: req.body['pwd']
      };

      dbo.signup(obj,function(err,result){
        console.log('insert users success');
        console.log('signup success');
      })
      // dbo.collection('users').insertOne(obj, function (err, result) {
      //   if (err) throw console.log(err);

      //   console.log('insert users success');
      //   console.log('signup success');
      // })
      res.cookie('user', req.body['id'], { path: '/', signed: true });
      res.cookie('pwd', req.body['pwd'], { path: '/', signed: true });
      //return res.render('index', { title: 'login', loginState: true });
      return res.redirect('/');
    }
  });

});
router.get('/signout', function (req, res) {
  res.clearCookie('user', { path: '/' });
  res.clearCookie('pwd', { path: '/' });
  return res.redirect('/');
})

router.get('/login', function (req, res) {
  res.render('login');
})

router.post('/login', function (req, res) {
  //checkLoginState(req, res);
  // var username=req.body['id'];
  // var pwd=req.body['pwd'];
  login(req, res, function (err,result) {
    
    // if(result==null){
    //   res.render('login',)
    // }

    res.cookie('user', req.body['id'], { path: '/', signed: true });
    res.cookie('pwd', req.body['pwd'], { path: '/', signed: true });
    res.redirect('/');

  })
})

router.post('/say', function (req, res) {
  var newPost = { name: req.signedCookies.user, post: req.body['say'] };

  dbo.say(newPost,function(err,result){
    console.log('db inserted');
    return res.redirect('/');
  })
  // dbo.collection('posts').save(newPost, function (err, result) {
  //   if (err) throw err;
  //   console.log('db inserted');
  //   // db.close();
  //   return res.redirect('/');
  // });
  //posts.push(newPost);
  //console.log(posts);
})

router.get('/s/:user',function(req,res){

  var user = req.params.user;
  var cb = req.query.cb; // cb?=... 
  var arr={}
  dbo.searchUser(user,function(err,result){
    console.log( result);
    // result.forEach(element => {
    //   arr['name']=element.username;
    // });
    var fn=cb+"("+JSON.stringify(result)+")";
    console.log(fn)
    res.send(fn);
  //  return res.render('index', { title: 'mircoBlog', loginState: isLogin, user_id: user_id, posts: result ,postCount:dbo.postCount,/*avatar:avatar*/});
  })
})
router.get('/p/:page', function (req, res) {

  var page = req.params.page;
  console.log('page:' + page);
  page = (page - 1) * 5;
  dbo.getPagePostsJoinUser(page,function(err,result){
    //avatar+='../images/avatar/'+result.userdata[0].avatar;
    console.log(dbo.postCount);
    return res.render('index', { title: 'mircoBlog', loginState: isLogin, user_id: user_id, posts: result ,postCount:dbo.postCount});
  });
  // dbo.getPagePosts(page,function(err,result){
  //   console.log(dbo.postCount);
  //   return res.render('index', { title: 'mircoBlog', loginState: isLogin, user_id: user_id, posts: result ,postCount:dbo.postCount,/*avatar:avatar*/});
  // })
  // dbo.collection('posts').find(/*{skip:page,limit:5}*/).skip(page).limit(5).toArray(function (err, result) {
  //   if (err) throw console.log(err);
  //   console.log(result);
  //   //return res.send(result);
  //  return res.render('index', { title: 'mircoBlog', loginState: isLogin, user_id: user_id, posts: result ,postCount:postCount});
  // })
})



router.get('/u/:name', function (req, res) {
  var username = req.params.name;
  //var userPost=[];
  dbo.getUserPosts(username,function(err,result){
    return res.render('user', { name: username, loginState: isLogin,posts: result })

  })
  // dbo.collection('posts').find({ name: username }).toArray((err, result) => {
  //   if (err) return console.log(err);
  //   console.log(result);
  //   return res.render('user', { name: username, posts: result });

  // })

  // for(var i =0;i<posts.length;i++){
  //   if(posts[i].name==username){
  //     userPost.push(posts[i]);
  //   }
  //  // console.log(userPost);
  // }

  //return res.redirect('/users/');
});
router.get('/ajaxpage', function (req, res) {
  return res.render("ajax");
})

router.get('/ajaxdata/:page', function (req, res) {

  var page = req.params.page;
  var url = 'http://app.api.repaiapp.com/sx/yangshijie/1406aitao/show.php?type=0&page=' + page;
  rp(url).then((response) => {

    console.log(typeof response);
    return res.send(response);

  }).catch(err => {
    console.log(err)
  })


})

//爬蟲 it幫 1,2頁標題
router.get('/curl', function (req, res) {
  var data = '';
  for (var i = 1; i < 3; i++) {
    var option = {
      uri: 'https://ithelp.ithome.com.tw/?page=' + i,
      transform: function (html) {
        return cheerio.load(html);
      }

    };
    rp(option).then(function ($) {
      console.log('開始爬');
      $('.qa-list').each(function () {
        var postTitle = $(this).find('.qa-list__title-link').text();
        //data+=postTitle;
        console.log(postTitle);
      })


    }).catch(err => {
      console.log(err);
    })
  }

})


// var fs=require('fs');
// var multer=require('multer');
// var path = require('path')
// var storage =multer.diskStorage({
//   destination:'./public/images/avatar',
//   filename:function(req,file,cb){
//     cb(null,file.originalname);
//   }
// });

// var upload=multer({
//   storage:storage,
//   limits:{fileSize:500000},//500kb
//   fileFilter:function(req,file,cb){
//     checkFilesType(file,cb);
//   }
// }).single('avatar');
// function checkFilesType (file,cb){
//   var filetypes=/jpeg|jpg|png|gif/;
//   var extname=filetypes.test(path.extname(file.originalname).toLowerCase());
//   var mimetype=filetypes.test(file.mimetype);
//   if(mimetype && extname){
//     return cb(null,true);
//   }else{
//     cb('error:images only!!');
//   }
// }
// router.post('/avatar',function(req,res){
//   upload(req,res,(err)=>{
//     if(err) {
//       throw console.log(err);
//     }else{
//      return res.send({result:'success'});
//     } 
//   })
//  })

module.exports = router;
