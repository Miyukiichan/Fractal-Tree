function changeAngle() {
  angle = toRadians(Number(angleInput.value));
  update();
}

function changeDepth() {
  var value = Number(depthInput.value);
  if (value > maxDepth || value < 1) {
    return;
  }
  amount = value;
  update();
}

function changeLength() {
  linelengthStart = Number(lengthInput.value);
  update();
}

function toDegrees(rad) {
  return rad * (180/Math.PI);
}

function toRadians(deg) {
  return deg * (Math.PI/180);
}

function branch(x, y, a, l, count) {
  ctx.beginPath();
  ctx.moveTo(x,y);
  const destX = x - (Math.sin(a) * l);
  const destY = y - (Math.cos(a) * l);
  ctx.lineTo(destX, destY);
  ctx.stroke();
  draw(destX, destY, a, l * 0.67, count + 1)
}

function draw(x, y, addAngle, length, count) {
  if (count == amount)
    return;
  //Left
  var trueAngle = angle + addAngle
  branch(x, y, trueAngle, length, count);
  //Right
  trueAngle = addAngle - angle
  branch(x, y, trueAngle, length, count);
}

function update() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle=primaryColour;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = secondaryColour;
  ctx.beginPath();
  ctx.moveTo(width/2,start);
  ctx.lineTo(width/2, start - linelengthStart);
  ctx.stroke();
  draw(width/2, start - linelengthStart, 0, linelengthStart, 1);
}

// Default values
const defaultLineLengthStart = 150;
const defaultStart = 700;
const defaultAngle = toRadians(20);
const defaultAmount = 13;
const primaryColour = "#5F9EA0";
const secondaryColour = "#c16081";

// Value boundaries
const maxDepth = 13;
const maxLineLengthStart = 150;

// Starting position
const height = 800;
const width = 1000;

// Global variables
var angle = defaultAngle;
var amount = defaultAmount;
var linelengthStart = defaultLineLengthStart;
var start = defaultStart;

// Get input elements and set default values
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
canvas.height = height;
canvas.width = 1000;
ctx.heoght = height;
ctx.width = 1000;


update();
