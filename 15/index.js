if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./sw.js')
    .then(res => {
      console.log('success')
    })
    .catch(err => {
      console.log('fail')
    })
} else {
  console.log('该浏览器版本不支持离线缓存')
}