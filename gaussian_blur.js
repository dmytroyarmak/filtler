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

function gFactory(o) {
    return function(x){
        var o2 = Math.pow(o, 2),
            x2 = Math.pow(x, 2);
        return Math.pow(Math.E,-0.5*(x2/o2))/Math.sqrt(2*Math.PI*o2);
    };
}

function createGuassianKernel(radius) {
    var kernel = new Array(radius*2 - 1),
        g = gFactory(radius/3),
        i;
    kernel[radius - 1] = g(0);
    for(i = 1; i < radius; i += 1){
        kernel[radius - 1 - i] = kernel[radius - 1 + i] = g(i);
    }
    return normalizeKernerl(kernel);
}

function normalizeKernerl(kernel) {
    var sum = kernel.reduce(function(mem, v){ return mem + v;}, 0);
    return kernel.map(function(el){
        return el/sum;
    });
}

function getBluerdPixel (kernel, imageData, x, y, direction) {
  var bluredPixel = {r: 0, g: 0, b: 0, a: 0};
  var i;
  var radius = (kernel.length + 1)/2;
  var base = direction === 'horizontal' ? x : y;
  var maxBase = (direction === 'horizontal' ? imageData.width : imageData.height) - 1;
  var from = base - (radius - 1);
  var current;
  var normalizedCurrent;
  var currentPixel;
  for (current = from, i = 0; i < kernel.length; i += 1, current += 1) {
    normalizedCurrent = (current < 0 ? 0 : (current > maxBase ? maxBase : current));
    if (direction === 'horizontal') {
      currentPixel = getPixel(imageData.width, imageData.data, normalizedCurrent, y);
    } else {
      currentPixel = getPixel(imageData.width, imageData.data, x, normalizedCurrent);
    }
    bluredPixel.r += currentPixel.r * kernel[i];
    bluredPixel.g += currentPixel.g * kernel[i];
    bluredPixel.b += currentPixel.b * kernel[i];
    bluredPixel.a += currentPixel.a * kernel[i];
  }
  return bluredPixel;
}

function addBlur (imageData, kernel, direction) {
  var cleanData = createEmptyData(imageData.width, imageData.height);
  var i,j, bluredPixel;
  for (i = 0; i < imageData.height; i += 1) {
    for (j = 0; j < imageData.width; j += 1) {
      bluredPixel = getBluerdPixel(kernel, imageData, j, i, direction);
      setPixel(imageData.width, cleanData, j, i, bluredPixel.r, bluredPixel.g, bluredPixel.b, bluredPixel.a);
    }
  }
  imageData.data.set(cleanData);
}

function addGaussianBlur (imageData, intensity) {
  var kernel = createGuassianKernel(intensity);
  addBlur(imageData, kernel, 'horizontal');
  addBlur(imageData, kernel, 'vertical');
  return imageData;
}

self.addEventListener('message', function(e) {
  var imageData = e.data.imageData,
      intensity = e.data.intensity;
  self.postMessage(addGaussianBlur(imageData, intensity));
}, false);
