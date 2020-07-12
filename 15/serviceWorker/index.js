if ('serviceWorker' in window.navigator) {
  window.navigator.serviceWorker
    .register('./sw.js')
    .then(() => console.log('success'))
    .catch(console.error)
} else {
  console.warn('浏览器不支持 ServiceWorker!')
}
var style = document.createElement('style')
document.head.appendChild(style)
function get() {
  var request = new XMLHttpRequest()
  request.open('GET', './index.css')
  request.onreadystatechange = function (e) {
    style.innerHTML = request.responseText
  }
  request.send()
}