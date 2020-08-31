/*Event handlers*/

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

function changeLengthChange() {
  lengthChange = lengthChangeInput.value / lengthChangeInputModifier;
  update();
}


/*Functions*/

function toDegrees(rad) {
  return rad * (180/Math.PI);
}

function toRadians(deg) {
  return deg * (Math.PI/180);
}

// Draw a branch and then draw two more
function branch(x, y, a, l, count) {
  ctx.beginPath();
  ctx.moveTo(x,y);
  const destX = x - (Math.sin(a) * l);
  const destY = y - (Math.cos(a) * l);
  ctx.lineTo(destX, destY);
  ctx.stroke();
  draw(destX, destY, a, l * lengthChange, count + 1)
}

// Draw two branches mirrored along y axis
function draw(x, y, addAngle, length, count) {
  if (count >= amount)
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
  ctx.strokeStyle = fgColour;
  ctx.lineWidth = lineWidth;

  // Draw first line and recursively draw the rest
  branch(width/2, start, rotation, linelengthStart * lengthChange, 0)
}


/*Value boundaries*/

const maxDepth = 13;
const maxLineLengthStart = 550;
const minLineLengthStart = 20;
const minLineWidth = 1;
const maxLineWidth = 10;
const minRotation = 0;
const maxRotation = 360;
const maxLengthChange = 1;
const minLengthChange = 0;


/*Default values*/

const defaultLineLengthStart = maxLineLengthStart;
const defaultStart = 1300;
const defaultAngle = toRadians(20);
const defaultAmount = 13;
const defaultBgColour = "#5F9EA0";
const defaultFgColour = "#c16081";
const defaultLineWidth = 2;
const defaultRotation = minRotation;
const defaultLengthChange = 0.67;


/*Canvas dimensions*/

const width = 3000;
const height = width * 0.5;
const lengthChangeInputModifier = 100;


/*Global variables*/

var angle = defaultAngle;
var amount = defaultAmount;
var linelengthStart = defaultLineLengthStart;
var start = defaultStart;
var bgColour = defaultBgColour;
var fgColour = defaultFgColour;
var lineWidth = defaultLineWidth;
var rotation = defaultRotation;
var lengthChange = defaultLengthChange;


/*Get input elements and set default values*/

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

const lengthChangeInput = document.getElementById("length-change");
lengthChangeInput.addEventListener("input", changeLengthChange);
lengthChangeInput.value = defaultLengthChange * lengthChangeInputModifier;


/*Initialize canvas and draw the tree*/

const canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.height = height;
canvas.width = width;
ctx.heoght = height;
ctx.width = width;
update();
