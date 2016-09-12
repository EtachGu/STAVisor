var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
var isLogin = false;
router.get('/', function(req, res,next) {
//    res.sendFile("E:\\WorkSpace\\JavaScriptProgram\\STAVisor\\app\\indexHome.html");
    if(isLogin){
        res.sendFile(path.resolve('app/indexHome.html'));
    }else{
        res.sendFile(path.resolve('app/login.html'));
    }


});

router.post('/login',function(req,res,next){

    var data = req.body;
    if(data.userName=="gdp12315@163.com" && data.password=="123456"){
        isLogin = true;
        res.send({success:true,info:"success ! "});
    }
    else{
        res.send({success:false,info:"userName or password is not right ! "});
    }
});

router.post('/signout',function(req,res,next){
    isLogin = false;
    res.redirect('/');
});

module.exports = router;
