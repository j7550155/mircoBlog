var express = require('express');
var router = express.Router();
var dbo = require('../models/expDB.js')
var mongodb = require('mongodb');
/* GET users listing. */

var fs = require('fs');
var multer = require('multer');
var path = require('path')
var storage = multer.diskStorage({
  destination: './public/images/avatar',
  filename: function (req, file, cb) {
    cb(null, 'avtar_' + Date.now() + '.png');
  }
});

var upload = multer({
  storage: storage,
  limits: { fileSize: 1500000 },//500000 ->500kb
  fileFilter: function (req, file, cb) {
    checkFilesType(file, cb);
  }
}).single('avatar');
function checkFilesType(file, cb) {
  var filetypes = /jpeg|jpg|png|gif/;
  var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  var mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('error:images only!!');
  }
}


router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/info', function (req, res) {
  var loginState = false;
  var username = req.signedCookies.user;
  var avatar = '';
  if (username) {
    loginState = true;
  }
  //var data=[];
  dbo.getUser(username, function (err, result) {
    avatar += '../images/avatar/' + result.avatar;
    dbo.getUserInfo(username, function (err, result) {
      // result.forEach(element => {

      //   data.push(element.post);
      // });
      console.log(result.length);
      console.log('avatar:' + avatar);
      res.render('homepage', { user: username, posts: result, loginState: loginState, avatar: avatar });
    });
  });
})

router.get('/del', function (req, res) {
  var parms = req.query.id;
  var obj = { _id: new mongodb.ObjectID(parms) };
  console.log('del mode');
  // if(parms){
  //   dbo.del(obj,function(req,result){
  //     console.log(result);
  //   })
  //   res.render('homepage');
  // }else{
  //   res.send('錯誤操作');
  // }

  dbo.del(obj, function (req, result) {
    console.log(result);
    return res.send({ msg: 'ok' });
  })
  // return res.redirect('/users/info');
})

router.post('/avatar', function (req, res) {
  var username = req.signedCookies.user;
  var hasAvatar = false;
  upload(req, res, (err) => {
    if (err) {
      throw console.log(err);
    }
    else {
      //dbo.avatar()
      var obj = { username: username, avatar: req.file.filename };
      dbo.avatar(obj, function (err, result) {
        //res.render('homepage',{ msg:'頭貼 上傳/更新 成功'});
        return res.redirect('/users/info');
      })
    }
  })
})


// router.get('/signup',function(req,res,next){
//   res.render('signup',{title:'註冊'})
// })

module.exports = router;
