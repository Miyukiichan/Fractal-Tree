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

function changeBg() {
  bgColour = bgColourInput.value
  update();
}

function changeFg() {
  fgColour = fgColourInput.value
  update();
}

function changeRotation() {
  rotation = toRadians(rotationInput.value) * -1 //Make rotation go clockwise
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
  // Reset canvas
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle=bgColour;
  ctx.fillRect(0, 0, width, height);

  // Draw first line
  ctx.strokeStyle = fgColour;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  var x = width/2;
  var y = start;
  ctx.moveTo(x, y);
  x = x - (Math.sin(rotation) * linelengthStart);
  y = y - (Math.cos(rotation) * linelengthStart);
  ctx.lineTo(x, y);
  //ctx.lineTo(width/2, start - linelengthStart);
  ctx.stroke();
  // Recursively draw the rest of the lines
  draw(x, y, rotation, linelengthStart, 1);
}

// Value boundaries
const maxDepth = 13;
const maxLineLengthStart = 300;
const minLineWidth = 1;
const maxLineWidth = 10;
const minRotation = 0;
const maxRotation = 360;

// Default values
const defaultLineLengthStart = maxLineLengthStart;
const defaultStart = 1300;
const defaultAngle = toRadians(20);
const defaultAmount = 13;
const defaultBgColour = "#5F9EA0";
const defaultFgColour = "#c16081";
const defaultLineWidth = 2;
const defaultRotation = minRotation;

// Canvas dimensions
const width = 3000;
const height = width * 0.5;

const sliderSubclasses = Array("-webkit-slider-runnable-track", "-moz-range-track", "-ms-fill-lower",  "-ms-fill-upper");
const thumbSubclasses = Array("-webkit-slider-thumb", "-moz-range-thumb")

// Global variables
var angle = defaultAngle;
var amount = defaultAmount;
var linelengthStart = defaultLineLengthStart;
var start = defaultStart;
var bgColour = defaultBgColour;
var fgColour = defaultFgColour;
var lineWidth = defaultLineWidth;
var rotation = defaultRotation;

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

const bgColourInput = document.getElementById("bg-colour")
bgColourInput.addEventListener("change", changeBg);
bgColourInput.value = defaultBgColour;

const fgColourInput = document.getElementById("fg-colour")
fgColourInput.addEventListener("change", changeFg);
fgColourInput.value = defaultFgColour;

const rotationInput = document.getElementById("rotation");
rotationInput.addEventListener("input", changeRotation);
rotationInput.value = toDegrees(defaultRotation);

const sliders = Array(angleInput, lengthInput);

const canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.height = height;
canvas.width = width;
ctx.heoght = height;
ctx.width = width;

update();
