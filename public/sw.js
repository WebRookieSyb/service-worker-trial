this.addEventListener("install", function(event) {
  console.log("Service worker install");
  // event.waitUtil()
  // 安装成功跳过等待阶段
  self.skipWaiting();
});

this.addEventListener("activate", function() {
  console.log("Service worker activate");
});

// 接受到消息后，浏览器会将推送事件dispatch到service worker中
// 监听push事件
self.addEventListener("push", function(event) {
  if (!event.data) {
    console.log("this push event has no data");
    return;
  }
  // 解析获取推送消息
  let payload = event.data.json();
  // 执行 self.registration.showNotification() 方法会向用户显示一个通知并且返回一个 promise 对象，这个 promise 对象会在通知显示之后被 resolve
  let promise = self.registration.showNotification(payload.title, {
    body: payload.body,
    icon: payload.icon,
    data: {
      url: payload.url
    }
  });
  // 在服务工作线程中，waitUntil延长事件的寿命从而阻止浏览器在事件中的异步操作完成之前终止服务工作线程
  event.waitUntil(promise);
});

//监听通知点击事件
self.addEventListener("notificationclick", function(event) {
  // 关闭通知
  event.notification.close();
  // 打开指定地址的窗口／标签页
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
