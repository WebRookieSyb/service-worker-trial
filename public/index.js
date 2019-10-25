// const webpush = require("web-push");
// import webpush from 'web-push'
// const VAPIDKeys = webpush.generateVAPIDKeys();
// const VAPIDPublicKey = VAPIDKeys.publicKey;
const VAPIDPublicKey =
  "BIfZF4njGfhK4BR1iEuQRNtoG5ETxh4tkptKARnekitx8Phphr31yJw9G-xqvvrUOi_QA3dlexlaoNzv_sht7yQ";
// let VAPIDPublicKey;
let registration;
//注册service worker
function registerServiceWorker() {
  // 检查是否支持serviceworker
  // if (!("serviceWorker" in navigator)) {
  // 此浏览器不支持serviceworker
  // console.log("此浏览器不支持serviceworker");
  // return;
  // }
  if (!navigator.serviceWorker) {
    return Promise.reject("not support service worker");
  }
  return navigator.serviceWorker
    .register("./sw.js")
    .then(function(reg) {
      console.log("service work successfully registered");
      registration = reg;
      // return registration;
    })
    .catch(function(error) {
      console.error("unable to register service worker", error);
    });
}

//获取通知权限
function askPermission() {
  // 是否支持桌面通知
  if (!window.Notification) {
    return Promise.reject("not support web notification");
  }
  // 兼容Notification.requestPermission返回为一个回调函数的情况
  // return new Promise(function(resolve, reject) {
  //   //获取用户权限
  //   const permissonResult = Notification.requestPermission(function(result) {
  //     resolve(result);
  //   });
  //   if (permissonResult) {
  //     permissonResult.then(resolve, reject);
  //   }
  // }).then(function(permissonResult) {
  //   if (permissonResult !== "granted") {
  //     throw new ErrorEvent("we are not granted permisson");
  //   }
  // });

  // 获取用户权限
  return Notification.requestPermission().then(function(permission) {
    if (permission === "granted") {
      return Promise.resolve();
    }
    // 用户禁止桌面通知权限
    return Promise.reject("we are not granted permission");
  });
}
// 订阅推送并将订阅结果发送给后端
function subscribeUserToPush(registration) {
  if (!window.PushManager) {
    return Promise.reject("not support web push");
  }
  //检查是否已经订阅
  // return navigator.serviceWorker
  //   .register("sw.js")
  //   .then(function(registration) {
  //     const subscribeOptions = {
  //       userVisibleOnly: true,
  //       applicationServerKey: urlBase64ToUint8Array(
  //         "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U"
  //       )
  //     };
  //     return registration.pushManager.subscribe(subscribeOptions);
  //   })
  //   .then(function(pushSubscription) {
  //     console.log(
  //       "received pushSubscription: ",
  //       JSON.stringify(pushSubscription)
  //     );
  //     return pushSubscription;
  //   });
  return registration.pushManager
    .getSubscription()
    .then(function(subscription) {
      //已经订阅过的就不再订阅
      if (subscription) {
        return;
      }
      // fetch('/api/push/getPublicKey', {
      //   method: "GET"
      // }).then(function(res){
      //   VAPIDPublicKey = res.text();
      //   console(VAPIDPublicKey)
      // })
      //没订阅就发起订阅
      return registration.pushManager
        .subscribe({
          //用户可见，无法显示静默通知
          userVisibleOnly: true,
          //公匙，鉴别订阅用户的服务应用
          applicationServerKey: base64ToUint8Array(VAPIDPublicKey)
        })
        .then(function(subscription) {
          sendSubscriptionToBackEnd(subscription);
        });
    });
}

function sendSubscriptionToBackEnd(subscription) {
  return fetch("/api/push/subscription", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(subscription)
    // body: JSON.stringify({
    // 	// 推送服务器生成包含唯一标识符的 URL，推送服务器通过它判断将消息发送到哪个客户端
    // 	endpoint: subscription.endpoint,
    // 	key: {
    // 		//getKey获取的值为ArrayBuffer，需要转码未base64字符串方便传输
    // 		//密钥
    // 		p256dh: uint8ArrayToBase64(subscription.getKey('p256th')),
    // 		// 校验码信息
    // 		auth: uint8ArrayToBase64(subscription.getKey('auth'))
    // 	}
    // })
  });
  // .then(function(res) {
  //   if(!res.ok) {
  //     throw new Error('bad status code from server.')
  //   }
  //   return res.json();
  // })
  //     .then(function(response) {
  //       if (!response.ok) {
  //         throw new Error("bad status code from server");
  //       }
  //       return response.json();
  //     })
  //     .then(function(responseData) {
  //       if (!(responseData.data && responseData.data.success)) {
  //         throw new Error("bad response from server.");
  //       }
  //     });
}
// function uint8ArrayToBase64(arr) {
//   //btoa返回base64编码字符串
//   //fromCharCode返回一个utf-16的字符串
//   return btoa(String.fromCharCode.apply(null, new Uint8Array(arr)));
// }
// 见https://github.com/web-push-libs/web-push
function base64ToUint8Array(base64String) {
  let padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  let base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  let rawData = atob(base64);
  let outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

//注册service-worker
registerServiceWorker()
  //申请桌面通知权限
  .then(function() {
    askPermission();
  })
  //订阅推送
  .then(function() {
    subscribeUserToPush(registration);
  });
