var MongoClient = require('mongodb').MongoClient;
// var ObjectID = require('mongodb').ObjectID;

var url = 'mongodb://<dbuser>:<dbpassword>@ds263917.mlab.com:63917/<dbname>';
var postCount;


MongoClient.connect(url, function (err, client) {
    if (err) throw err;
    dbo = client.db('exp-test');
    console.log('db connected');

    
    function getPostCount(){
        dbo.collection('posts').find().toArray((err, result) => {
            if (err) return console.log(err);
            postCount = result.length;
            console.log('postCounts:' + postCount);
            module.exports.postCount=postCount; 
        })
    }
    

    
    module.exports.getUserInfo = function (user, callback) {
        
        dbo.collection('posts').find({ name: user }).toArray(function(err, result) {
           // if (err) return console.log(err);
           // console.log(result);
            //return res.send({ name: username, posts: result });
            callback(err, result);
        })
    }
    module.exports.searchUser= function (user, callback) {
        
        var obj={username:{$regex:".*"+user+".*"}}
        dbo.collection('users').find(obj).toArray(function(err, result) {
            //if (err) return console.log(err);
           // console.log(result);
            //return res.send({ result });
            callback(err, result);
        })
    }


    module.exports.getUserPosts = function (username, callback) {

        dbo.collection('posts').find({name:username}).toArray(function(err,result){
           // console.log(result);
            callback(err,result);
        })
    }


    module.exports.getPagePosts = function (page, callback) {

        dbo.collection('posts').find().skip(page).limit(5).toArray(function (err, result) {

            console.log(result);
            callback(err, result);

        })
    }

    
    module.exports.getPagePostsJoinUser = function (page, callback) {
        getPostCount();

        dbo.collection('posts').aggregate([
            { $lookup:
               {
                 from: 'users',
                 localField: 'name',
                 foreignField: 'username',
                 as: 'userdata'
               },
            },{
                $skip:page,
            },{
                $limit:5
            }
            ]).toArray(function (err, result) {

            console.log(result);
            callback(err, result);

        })
    }


    module.exports.say = function (obj, callback) {

        dbo.collection('posts').save(obj, function (err, result) {
          //  console.log(result);
            callback(err, result);
        })
    }

    module.exports.del = function (obj, callback) {

        dbo.collection('posts').deleteOne(obj, function (err, result) {
            if(err) throw console.log(err);
            //console.log(result);
            callback(err, '刪除成功');
        })
    }


    module.exports.getUser = function (username, callback) {

        dbo.collection('users').findOne({ username: username }, function (err, result) {
            console.log(result);
            callback(err, result);
        })
    }

    module.exports.login = function (username, pwd, callback) {

        dbo.collection('users').findOne({ username: username, pwd:pwd }, function (err, result) {
            console.log(result);
            callback(err, result);
        })
    }

    module.exports.signup = function (obj, callback) {

        dbo.collection('users').insertOne(obj, function (err, result) {
            console.log(result);
            callback(err, result);
        })
    }

    module.exports.avatar = function (obj, callback) {

        dbo.collection('users').update({username:obj.username},{$set:{avatar:obj.avatar}} ,function (err, result) {
           // console.log(result);
            callback(err, result);
        })
    }



});