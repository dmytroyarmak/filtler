function setPixel(imageData, x, y, r, g, b, a) {
  index = (x + y * imageData.width) * 4;
  imageData.data[index+0] = r;
  imageData.data[index+1] = g;
  imageData.data[index+2] = b;
  imageData.data[index+3] = a;
}

function addNoiceToImageData (imageData, intensity) {
  var i, x, y, r, g, b;
  for (i = 0; i < 10000*intensity; i++) {
    x = Math.random() * imageData.width | 0; // |0 to truncate to Int32
    y = Math.random() * imageData.height | 0;
    r = Math.random() * 256 | 0;
    g = Math.random() * 256 | 0;
    b = Math.random() * 256 | 0;
    setPixel(imageData, x, y, r, g, b, 255); // 255 opaque
  }
  return imageData;
}

self.addEventListener('message', function(e) {
  var data = e.data;
  self.postMessage(addNoiceToImageData(data.imageData, data.intensity));
}, false);
