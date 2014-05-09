function createEmptyData (width, height) {
  return new Uint8ClampedArray(width*height*4);
}

function setPixel(width, data, x, y, r, g, b, a) {
  var index = (x + y * width) * 4;
  data[index+0] = r;
  data[index+1] = g;
  data[index+2] = b;
  data[index+3] = a;
}

function getPixel(width, data, x, y) {
  var index = (x + y * width) * 4;
  return {
    r: data[index],
    g: data[index + 1],
    b: data[index + 2],
    a: data[index + 3]
  };
}

function normalize (value, max) {
  if (value < 0) {
    return 0
  } else if (value > max) {
    return max;
  } else {
    return value;
  }
}

function median (arr) {
  arr.sort(function(a, b){return a-b});
  return arr[Math.floor(arr.length/2)];
}

function getMedianPixel (imageData, radius, x, y) {
  var medianPixel = {r: 0, g: 0, b: 0, a: 0},
      r = [],
      g = [],
      b = [],
      a = [];
  var diameter = radius*2,
      i, j, currentPixel;
  for (i = 0; i < diameter; i += 1) {
    for (j = 0; j < diameter; j += 1) {
      currentPixel = getPixel(imageData.width, imageData.data, normalize(x + i - radius, imageData.width - 1), normalize(y + j - radius, imageData.height - 1));
      r.push(currentPixel.r);
      g.push(currentPixel.g);
      b.push(currentPixel.b);
      a.push(currentPixel.a);
    }
  }
  medianPixel.r = median(r);
  medianPixel.g = median(g);
  medianPixel.b = median(b);
  medianPixel.a = median(a);
  return medianPixel;
}

function medianFilter (imageData, intensity) {
  var cleanData = createEmptyData(imageData.width, imageData.height);
  var i,j, medianPixel;
  for (i = 0; i < imageData.height; i += 1) {
    for (j = 0; j < imageData.width; j += 1) {
      medianPixel = getMedianPixel(imageData, intensity, j, i);
      setPixel(imageData.width, cleanData, j, i, medianPixel.r, medianPixel.g, medianPixel.b, medianPixel.a);
    }
  }
  imageData.data.set(cleanData);
  return imageData;
}

self.addEventListener('message', function(e) {
  var imageData = e.data.imageData,
      intensity = e.data.intensity;
  self.postMessage(medianFilter(imageData, intensity));
}, false);
