const height = 700;
const width = 1000;
const defaultLineLengthStart = 150;
const defaultStart = 610;
const defaultAngle = toRadians(20);
const defaultAmount = 13;

var angle = defaultAngle;
var amount = defaultAmount;
var linelengthStart = 150;
var start = 610;

const angleInput = document.getElementById("angle");
angleInput.addEventListener("input", changeAngle);
angleInput.value = toDegrees(defaultAngle);

const depthInput = document.getElementById("depth");
depthInput.addEventListener("input", changeDepth);
depthInput.value = defaultAmount;

const lengthInput = document.getElementById("length");
lengthInput.addEventListener("input", changeLength);
lengthInput.value = defaultLineLengthStart;

const canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
ctx.strokeStyle = "DarkSalmon";
canvas.height = height;
canvas.width = 1000;
ctx.heoght = height;
ctx.width = 1000;

function toDegrees(rad) {
  return rad * (180/Math.PI);
}

function toRadians(deg) {
  return deg * (Math.PI/180);
}

function changeAngle() {
  angle = toRadians(Number(angleInput.value));
  main();
}

function changeDepth() {
  var value = Number(depthInput.value);
  if (value > 15 || value < 1) {
    return;
  }
  amount = value;
  main();
}

function changeLength() {
  linelengthStart = Number(lengthInput.value);
  main();
}

function draw(x, y, addAngle, length, count) {
  if (count == amount)
    return;
  //Left
  var trueAngle = angle + addAngle
  ctx.beginPath();
  ctx.moveTo(x,y);
  var destX = x - (Math.sin(trueAngle) * length);
  var destY = y - (Math.cos(trueAngle) * length);
  ctx.lineTo(destX, destY);
  ctx.stroke();
  draw(destX, destY, trueAngle, length * 0.67, count + 1) 
  //Right
  trueAngle = addAngle - angle
  ctx.beginPath();
  ctx.moveTo(x,y);
  destX = x - (Math.sin(trueAngle) * length);
  destY = y - (Math.cos(trueAngle) * length);
  ctx.lineTo(destX, destY);
  ctx.stroke();
  draw(destX, destY, trueAngle, length * 0.67, count + 1) 
}

function main() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle="CadetBlue";
  ctx.fillRect(0, 0, width, height);
  ctx.beginPath();
  ctx.moveTo(width/2,start);
  ctx.lineTo(width/2, start - linelengthStart);
  ctx.stroke();

  draw(width/2, start - linelengthStart, 0, linelengthStart, 1);
}

main();
