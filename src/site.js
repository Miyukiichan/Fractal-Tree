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

// Set the dragging flag and take readings of the original position in case there is an error
// e.g. the user leaves the canvas boundaries
function startDrag(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = width / rect.width;
  const scaleY = height / rect.height;
  const mouse_x = (event.clientX - rect.left) * scaleX;
  const mouse_y = (event.clientY - rect.top) * scaleY;
  if (mouse_x > min_x && mouse_x < max_x && mouse_y > min_y && mouse_y < max_y) {
    dragging = true;
    dragX = mouse_x;
    dragY = mouse_y;
    xWhenDragged = xPos;
    yWhenDragged = yPos;
  }
}

// Subtract the difference in user mouse movement since previous measurement from the position
// Thus moving the fractal
function drag(event) {
  if (!dragging)
    return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = width / rect.width;
  const scaleY = height / rect.height;
  const mouse_x = (event.clientX - rect.left) * scaleX;
  const mouse_y = (event.clientY - rect.top) * scaleY;
  const dx = dragX - mouse_x;
  const dy = dragY - mouse_y;
  xPos -= dx;
  yPos -= dy;
  dragX = mouse_x;
  dragY = mouse_y;
  update();
}

function stopDrag() {
  dragging = false;
}

// Reset the position to where the user started dragging
function interruptDrag() {
  if (!dragging)
    return;
  dragging = false;
  xPos = xWhenDragged;
  yPos = yWhenDragged;
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

// Generic function to set the min/max/default values of a given input id
// Returns an element object representing the input of the given id
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

function checkBoundaries(x, y) {
  if (x < min_x || min_x == -1)
    min_x = x;
  if (x > max_x || max_x == -1)
    max_x = x;
  if (y < min_y || min_y == -1)
    min_y = y;
  if (y > max_y || max_y == -1)
    max_y = y;
}

function resetBoundaries() {
  min_x = -1;
  max_x = -1;
  min_y = -1;
  max_y = -1;
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
  //Checking destination covers all but the starting point so need to check the origin in that case
  if (count == 0)
    checkBoundaries(x, y);
  checkBoundaries(destX, destY);
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
  const drawTree = rotation == 0; //Only need to draw the tree if not rotating
  resetBoundaries();
  branch(xPos, yPos, 0, length * lengthChange / lengthChangeInputModifier, 0, drawTree)

  // Calculate centre point from boundaries
  const c_y = min_y + ((max_y - min_y) / 2);
  const c_x = min_x + ((max_x - min_x) / 2);

  if(drawTree) //Tree already drawn correctly
    return;

  // Rotation based upon right angled triangle "A" adjacent to isosceles triangle "B"
  // Where hypotenuse of A is one of the equal sides of B
  // and the equal sides of B = center point - starting y position when not rotated
  const a = toRadians(90) + rotation;
  const l = yPos - c_y;
  const dx = Math.cos(a) * l;
  const dy = Math.sin(a) * l;
  const x = c_x - dx;
  const y = c_y + dy;

  resetBoundaries();
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

// Boundary trackers
var max_x = -1;
var max_y = -1;
var min_x = -1;
var min_y = -1;

// Position of the tree
var xPos = defaultX;
var yPos = defaultY;

var dragging = false;
//Point user clicks when dragging starts
var dragX = 0;
var dragY = 0;
//Original position when dragging starts so that it can be reverted if needed
var xWhenDragged = 0;
var yWhenDragged = 0;

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

// Dragging events for the canvas
const canvas = document.getElementById("canvas");
canvas.addEventListener("mousedown", startDrag);
canvas.addEventListener("mousemove", drag);
canvas.addEventListener("mouseup", stopDrag);
canvas.addEventListener("mouseout", interruptDrag);


/*Initialize canvas and draw the tree*/

var ctx = canvas.getContext("2d");
canvas.height = height;
canvas.width = width;
ctx.heoght = height;
ctx.width = width;
update();
