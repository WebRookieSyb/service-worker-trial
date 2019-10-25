//服务端
const express = require("express");
const bodyParser = require("body-parser");
const webpush = require("web-push");
const path = require("path");
const config = require("./config");

const app = express();
const port = 9547;
const VAPIDKeys = config.VAPIDKeys;
// const VAPIDKeys = webpush.generateVAPIDKeys();
// console.log(VAPIDKeys.publicKey);
// console.log(VAPIDKeys.privateKey);

const GCMAPIkey = config.GCMAPIkey;
//配置webpush
webpush.setVapidDetails(
  "mailto:shuyibin97@163.com",
  VAPIDKeys.publicKey,
  VAPIDKeys.privateKey
);
webpush.setGCMAPIKey(GCMAPIkey);
//存储pushSubscription对象
let pushSubscriptionSet = new Set();
//每隔十秒向服务器发送消息
setInterval(function() {
  // return new Promise(function(resolve, reject) {
  // 	let promiseChain = Promise.resolve();
  // 	for(let i = 0; i<pushSubscriptionSet.size; i++ ){

  // 	}
  // })
  if (pushSubscriptionSet.size > 0) {
    pushSubscriptionSet.forEach(function(pushSubscription) {
      webpush.sendNotification(
        pushSubscription,
        JSON.stringify({
          title: "你好",
          body: "一起来云课堂学习吧",
          icon:
            "https://raw.githubusercontent.com/WebRookieSyb/graph-bed/master/img/icon.png",
          url: "https://study.163.com/"
        })
      );
    });
  }
}, 1000 * 10);
//设置静态文件目录，比如本地文件
app.use(express.static(path.join(__dirname, "../public")));
app.use(bodyParser.json());

// 服务端提供接口接受并存储pushSubscription
app.post("/api/push/subscription", function(req, res) {
  if (req.body) {
    try {
      pushSubscriptionSet.add(req.body);
      res.sendStatus(200);
    } catch (e) {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(403);
  }
});
// app.get("/api/push/getPublicKey", function(req,res) {
// 	res.send(VAPIDKeys.publicKey);
// })

//启动服务器
app.listen(port, function() {
  console.log(`server start on http://127.0.0.1:${port}`);
});

// app.listen(3000);

// app.post('/api/save-subscription/', function(req, res) {
//     if(!isValidSaveRequest(req, res)) {
//         return;
//     }

//     return saveSubscriptionToDataBase(req.body)
//     .then(function(subscriptionId) {
//         res.setHeader('Content-Type', 'application/json');
//         res.send(JSON.stringify({data: {success: true}}));
//     })
//     .catch(function(err) {
//         res.status(500);
//         res.setHeader('Content-Type', 'application/json');
//         res.send(JSON.stringify(
//             error: {
//                 id: 'unable-to-save-subscription',
//                 message:'the subscription was received but we were unable to save it to our dataBase'
//             }
//         ));
//     });
// });
