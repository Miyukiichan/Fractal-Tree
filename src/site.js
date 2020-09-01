/*Event handlers*/

function changeAngle() {
  angle = toRadians(Number(angleInput.value));
  update();
}

function changeDepth() {
  var d = Number(depthInput.value);
  if (d > maxDepth)
    d = maxDepth
  else if (d < minDepth)
    d = minDepth;
  depth = d;
  depthInput.value = d;
  update();
}

function changeLength() {
  length = Number(lengthInput.value);
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
  lengthChange = lengthChangeInput.value;
  update();
}


/*Functions*/

function toDegrees(rad) {
  return rad * (180/Math.PI);
}

function toRadians(deg) {
  return deg * (Math.PI/180);
}

function setupInput(id, handler, defaultValue, minValue = null, maxValue = null) {
  const input = document.getElementById(id);
  input.addEventListener("input", handler);
  if (minValue != null)
    input.min = minValue;
  if (maxValue != null)
    input.max = maxValue;
  input.value = defaultValue;
  return input;
}

// Draw a branch and then draw two more
function branch(x, y, a, l, count) {
  ctx.beginPath();
  ctx.moveTo(x,y);
  const destX = x - (Math.sin(a) * l);
  const destY = y - (Math.cos(a) * l);
  ctx.lineTo(destX, destY);
  ctx.stroke();
  draw(destX, destY, a, l * (lengthChange / lengthChangeInputModifier), count + 1)
}

// Draw two branches mirrored along y axis
function draw(x, y, addAngle, l, count) {
  if (count >= depth)
    return;
  //Left
  var trueAngle = angle + addAngle
  branch(x, y, trueAngle, l, count);
  //Right
  trueAngle = addAngle - angle
  branch(x, y, trueAngle, l, count);
}

function update() {
  // Reset canvas
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle=bgColour;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = fgColour;
  ctx.lineWidth = lineWidth;

  // Draw first line and recursively draw the rest
  if (depth > 0)
    branch(width/2, start, rotation, length * lengthChange / lengthChangeInputModifier, 0)
}


/*Value boundaries*/

const minAngle = 0;
const maxAngle = 180;
const minDepth = 0;
const maxDepth = 13;
const maxLength = 550;
const minLength = 20;
const minLineWidth = 1;
const maxLineWidth = 10;
const minRotation = 0;
const maxRotation = 360;
const maxLengthChange = 100;
const minLengthChange = 0;


/*Default values*/

const defaultAngle = 20;
const defaultDepth = 13;
const defaultLength = maxLength;
const defaultLineWidth = 2;
const defaultRotation = minRotation;
const defaultLengthChange = 67;

const defaultStart = 1300;
const defaultBgColour = "#5F9EA0";
const defaultFgColour = "#c16081";


/*Canvas dimensions*/

const width = 3000;
const height = width * 0.5;
const lengthChangeInputModifier = 100;


/*Global variables*/

var angle = toRadians(defaultAngle);
var depth = defaultDepth;
var length = defaultLength;
var start = defaultStart;
var bgColour = defaultBgColour;
var fgColour = defaultFgColour;
var lineWidth = defaultLineWidth;
var rotation = defaultRotation;
var lengthChange = defaultLengthChange;


/*Get input elements and set default values*/

const angleInput = setupInput("angle", changeAngle, defaultAngle, minAngle, maxAngle);
const depthInput = setupInput("depth", changeDepth, defaultDepth, minDepth, maxDepth)
const lengthInput = setupInput("length", changeLength, defaultLength, minLength, maxLength);
const rotationInput = setupInput("rotation", changeRotation, defaultRotation, minRotation, maxRotation);
const lengthChangeInput = setupInput("length-change", changeLengthChange, defaultLengthChange, minLengthChange, maxLengthChange);
const bgColourInput = setupInput("bg-colour", changeBg, defaultBgColour);
const fgColourInput = setupInput("fg-colour", changeFg, defaultFgColour);


/*Initialize canvas and draw the tree*/

const canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.height = height;
canvas.width = width;
ctx.heoght = height;
ctx.width = width;
update();
