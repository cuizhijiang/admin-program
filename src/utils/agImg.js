export function photoCompress(file) { // 读取图片base64
  var ready = new FileReader()
  ready.readAsDataURL(file)
  return new Promise((res, rej) => {
    ready.onload = function() {
      res(this.result)
    }
  })
}

export function canvasDataURL(base64, callback) { // canvas重新绘制图片大小
  var img = new Image()
  img.src = base64
  img.onload = function() {
    var that = this
    var canvas = document.createElement('canvas')
    var ctx = canvas.getContext('2d')
    var anw = document.createAttribute('width')
    anw.nodeValue = 180
    var anh = document.createAttribute('height')
    anh.nodeValue = 180
    canvas.setAttributeNode(anw)
    canvas.setAttributeNode(anh)
    ctx.drawImage(that, 0, 0, 180, 180)
    var base64 = canvas.toDataURL('image/jpeg')
    callback(base64)
  }
}

export function base64UrlToBlob(urlData) { // 讲base64转化为blob对象进行上传
  var arr = urlData.split(',')
  var mime = arr[0].match(/:(.*?);/)[1]
  var bstr = atob(arr[1])
  var n = bstr.length
  var u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}
