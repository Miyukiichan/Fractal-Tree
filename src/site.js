/*Event handlers*/

function changeAngle() {
  angle = toRadians(Number(angleInput.value));
  update();
}

function changeDepth() {
  depth = setNumberInput(depthInput, minDepth, maxDepth);
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
  rotation = toRadians(Number(rotationInput.value)) * -1 //Make rotation go clockwise
  update();
}

function changeLengthChange() {
  lengthChange = lengthChangeInput.value;
  update();
}

function changeLineWidth() {
  lineWidth = setNumberInput(lineWidthInput, minLineWidth, maxLineWidth);
  update();
}

function changeAngleChange() {
  angleChange = angleChangeInput.value;
  update();
}


/*Functions*/

// Limit the input of a number input using the min and max values
// Returns the value set accordingly
function setNumberInput(input, min, max) {
  var value = Number(input.value);
  if (value > max)
    value = max
  else if (value < min)
    value = min;
  input.value = value;
  return value;
}

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
// Only do this if drawTree flag is true
function branch(x, y, a, l, count, drawTree) {
  const destX = x - (Math.sin(a) * l);
  const destY = y - (Math.cos(a) * l);
  if (drawTree) {
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(destX, destY);
    ctx.stroke();
  }
    //Check for new boundaries
  if (destX < min_x || min_x == -1)
    min_x = destX;
  if (destX > max_x || max_x == -1)
    max_x = destX;
  if (destY < min_y || min_y == -1)
    min_y = destY;
  if (destY > max_y || max_y == -1)
    max_y = destY;
  draw(destX, destY, a, l * (lengthChange / lengthChangeInputModifier), count + 1, drawTree)
}

// Draw two branches mirrored along y axis
// Pass given drawTree flag to prevent/enable drawing
function draw(x, y, addAngle, l, count, drawTree) {
  if (count >= depth)
    return;
  //Additional rotation based on rate of change and how many iterations there have been
  const modifier = count * angleChange / 100;
  //Left
  var trueAngle = (addAngle + angle) + modifier;
  branch(x, y, trueAngle, l, count, drawTree);
  //Right
  trueAngle = (addAngle - angle) - modifier;
  branch(x, y, trueAngle, l, count, drawTree);
}

function update() {
  // Reset boundary trackers
  max_x = -1;
  max_y = -1;
  min_x = -1;
  min_y = -1;

  // Reset canvas
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle=bgColour;
  ctx.fillRect(0, 0, width, height);

  // No shape so don't need to do anything
  if (depth == 0)
    return

  // Set pen style
  ctx.strokeStyle = fgColour;
  ctx.lineWidth = lineWidth;

  //Go through all the lines without drawing to get the centre point
  const drawTree = rotation == 0;
  branch(xPos, yPos, 0, length * lengthChange / lengthChangeInputModifier, 0, drawTree)

  // Calculate centre point from boundaries
  const c_y = min_y + ((max_y - min_y) / 2);
  const c_x = min_x + ((max_x - min_x) / 2);

  if(drawTree)
    return;

  const a = toRadians(90) + rotation;
  const l = yPos - c_y;
  const adjacent = Math.cos(a) * l;
  const opposite = Math.sin(a) * l;
  const x = c_x - adjacent;
  const y = c_y + opposite;

  branch(x, y, rotation, length * lengthChange / lengthChangeInputModifier, 0, true);
}

/*Canvas dimensions*/

const width = 3000;
const height = width * 0.5;
const lengthChangeInputModifier = 100;


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
const minAngleChange = 0;
const maxAngleChange = 629;


/*Default values*/

const defaultAngle = 20;
const defaultDepth = 13;
const defaultLength = maxLength;
const defaultLineWidth = 2;
const defaultRotation = minRotation;
const defaultLengthChange = 67;
const defaultAngleChange = minAngleChange;

const defaultX = width / 2;
const defaultY = 1300;
const defaultBgColour = "#5F9EA0";
const defaultFgColour = "#c16081";


/*Global variables*/

var angle = toRadians(defaultAngle);
var depth = defaultDepth;
var length = defaultLength;
var bgColour = defaultBgColour;
var fgColour = defaultFgColour;
var rotation = toRadians(defaultRotation);
var lengthChange = defaultLengthChange;
var lineWidth = defaultLineWidth;
var angleChange = defaultAngleChange;


var max_x = -1;
var max_y = -1;
var min_x = -1;
var min_y = -1;
var xPos = defaultX;
var yPos = defaultY;


/*Get input elements and set default values*/

const angleInput = setupInput("angle", changeAngle, defaultAngle, minAngle, maxAngle);
const depthInput = setupInput("depth", changeDepth, defaultDepth, minDepth, maxDepth)
const lengthInput = setupInput("length", changeLength, defaultLength, minLength, maxLength);
const bgColourInput = setupInput("bg-colour", changeBg, defaultBgColour);
const fgColourInput = setupInput("fg-colour", changeFg, defaultFgColour);
const rotationInput = setupInput("rotation", changeRotation, defaultRotation, minRotation, maxRotation);
const lengthChangeInput = setupInput("length-change", changeLengthChange, defaultLengthChange, minLengthChange, maxLengthChange);
const lineWidthInput = setupInput("line-width", changeLineWidth, defaultLineWidth, minLineWidth, maxLineWidth);
const angleChangeInput = setupInput("angle-change", changeAngleChange, defaultAngleChange, minAngleChange, maxAngleChange);


/*Initialize canvas and draw the tree*/

const canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.height = height;
canvas.width = width;
ctx.heoght = height;
ctx.width = width;
update();
