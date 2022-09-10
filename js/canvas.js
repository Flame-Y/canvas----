const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
const img = new Image();
img.src = "../image/队徽_black.png";
// img.src = "../image/test.png";

// 储存图片像素信息
let imgData = null;
let imgW = 600;
let imgH = null;
let flag = true;
let pointArr = [];
initRoundPopulation = 80;

// 鼠标 xy
var mx = 0, my = 0;
// 吸附 / 排斥模式标记
var adsorbentMode = false
// 鼠标圆影响范围 , 像素作为单位
const THICKNESS = Math.pow(60, 2)
const DRAG = 0.9
const EASE = 0.4

class Point {
  constructor(size, w, h) {
    // 保留图像初始位置
    this.orw = w;
    this.orh = h;
    // 随机位置
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = size;
    this.w = w;
    this.h = h;
    this.opacity = 0;
  }
  // 圆点每次位置变化
  update() {
    //移动速度
    this.spx = (this.w - this.x) / 20 / 20;
    this.spy = (this.h - this.y) / 20 / 20;

    // 粒子原始位置距离判断
    let dx = mx - this.orw,
      dy = my - this.orh,
      curDx = mx - this.x,
      curDy = my - this.y;


    // 鼠标相对点原始位置的直线距离的平方
    let d = dx * dx + dy * dy;

    // 鼠标相对点原始位置的距离比例, 小于 1 为在边界外, 等于 1 为刚好在边界上, 大于 1 为在边界内
    let f = THICKNESS / d;

    // 吸附模式
    if (adsorbentMode) {
      // 防止圆点飞太远
      if (d < THICKNESS) {
        if (f > 2.5) f = 2.5;
      }
    }
    // 排斥模式
    else {
      // 防止圆点飞太远
      f = f > 7 ? 7 : f;
    }

    let t = Math.atan2(curDy, curDx);
    let vx = f * Math.cos(t),
      vy = f * Math.sin(t);

    this.spx += (adsorbentMode ? vx : -vx) * DRAG + (this.orw - this.x) * EASE
    this.spy += (adsorbentMode ? vy : -vy) * DRAG + (this.orh - this.y) * EASE


    // 最终计算
    if (!flag && this.opacity > 0) {
      this.x -= this.spx;
      this.opacity -= 0.01;
    } else {
      this.x += this.spx;
      this.opacity += 0.01;
    }
    if (!flag && this.opacity > 0) {
      this.y -= this.spy;
    } else {
      this.y += this.spy;
    }
  }
  // 渲染圆点
  render() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255," + this.opacity + ")";
    ctx.fill();
    ctx.closePath();
    // ctx.shadowBlur = this.size * 2;
    // ctx.shadowColor = "red";
  }
}

function move() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pointArr.forEach((point) => {
    point.update();
    point.render();
  });
  window.requestAnimationFrame(move);
}

// 散开聚合
function changePic() {
  flag = !flag;
  pointArr.forEach((point) => {
    point.w = flag ? point.orw : Math.random() * canvas.width;
    point.h = flag ? point.orh : Math.random() * canvas.height;
    point.opacity -= 0.01;
  });
}

function pointInit(imgData) {
  const gap = 4;
  for (var h = 0; h < imgH; h += gap) {
    for (var w = 0; w < imgW; w += gap) {
      var position = (imgW * h + w) * 4;
      var r = imgData[position],
        g = imgData[position + 1],
        b = imgData[position + 2];
      // 当rgb都为0时，说明颜色值为黑色
      if (r + g + b === 0) {
        pointArr.push(new Point(1, w, h));
      }
    }
  }
}

img.onload = function () {
  imgH = imgW * (img.height / img.width);
  ctx.drawImage(img, 0, 0, imgW, imgH);
  imgData = ctx.getImageData(0, 0, imgW, imgH).data;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pointInit(imgData);
  move();
};

canvas.addEventListener('mousemove', (e) => {
  let rect = canvas.getBoundingClientRect()
  mx = e.clientX - rect.left;
  my = e.clientY - rect.top;
  console.log(mx, my);
}) 