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