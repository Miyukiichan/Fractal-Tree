class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
/*Represents a fractal tree with all of its properties and drawing methods*/

class Tree {
  //Set all values to their defaults
  constructor() {
    this.xPos = defaultX;
    this.yPos = defaultY;
    this.angle = toRadians(defaultAngle);
    this.depth = defaultDepth;
    this.length = defaultLength;
    this.fgColour = defaultFgColour;
    this.rotation = toRadians(defaultRotation);
    this.lengthChange = defaultLengthChange;
    this.lineWidth = defaultLineWidth;
    this.angleChange = defaultAngleChange;
    this.resetBoundaries();
  }
  modifiedLength(length = this.length) {
    return length * this.lengthChange / lengthChangeInputModifier;
  }
  checkBoundaries(x, y) {
    if (x < this.min_x || this.min_x == -1)
      this.min_x = x;
    if (x > this.max_x || this.max_x == -1)
      this.max_x = x;
    if (y < this.min_y || this.min_y == -1)
      this.min_y = y;
    if (y > this.max_y || this.max_y == -1)
      this.max_y = y;
  }
  resetBoundaries() {
    this.min_x = -1;
    this.max_x = -1;
    this.min_y = -1;
    this.max_y = -1;
  }
  centerPoint() {
    const c_y = this.min_y + ((this.max_y - this.min_y) / 2);
    const c_x = this.min_x + ((this.max_x - this.min_x) / 2);
    return new Point(c_x, c_y);
  }
  position() {
    return new Point(this.xPos, this.yPos);
  }
  update() {
    // No shape so don't need to do anything
    if (this.depth == 0)
      return

    // Set pen style
    ctx.strokeStyle = this.fgColour;
    ctx.lineWidth = this.lineWidth;

    //Go through all the lines without drawing to get the centre point
    const drawTree = this.rotation == 0; //Only need to draw the tree if not rotating
    this.resetBoundaries();
    this.branch(this.xPos, this.yPos, 0, this.modifiedLength(), 0, drawTree)

    // Calculate centre point from boundaries
    const c_y = this.min_y + ((this.max_y - this.min_y) / 2);
    const c_x = this.min_x + ((this.max_x - this.min_x) / 2);

    if(drawTree) //Tree already drawn correctly
      return;

    // Rotation based upon right angled triangle "A" adjacent to isosceles triangle "B"
    // Where hypotenuse of A is one of the equal sides of B
    // and the equal sides of B = center point - starting y position when not rotated
    const a = toRadians(90) + this.rotation;
    const l = this.yPos - c_y;
    const dx = Math.cos(a) * l;
    const dy = Math.sin(a) * l;
    const x = c_x - dx;
    const y = c_y + dy;

    this.resetBoundaries();
    this.branch(x, y, this.rotation, this.modifiedLength(), 0, true);
  }
  // Draw a branch and then draw two more
  // Only do this if drawTree flag is true
  branch(x, y, a, l, count, drawTree) {
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
      this.checkBoundaries(x, y);
    this.checkBoundaries(destX, destY);
    this.draw(destX, destY, a, this.modifiedLength(l), count + 1, drawTree)
  }
  // Draw two branches mirrored along y axis
  // Pass given drawTree flag to prevent/enable drawing
  draw(x, y, addAngle, l, count, drawTree) {
    if (count >= this.depth)
      return;
    //Additional rotation based on rate of change and how many iterations there have been
    const modifier = count * this.angleChange / 100;
    //Left
    var trueAngle = (addAngle + this.angle) + modifier;
    this.branch(x, y, trueAngle, l, count, drawTree);
    //Right
    trueAngle = (addAngle - this.angle) - modifier;
    this.branch(x, y, trueAngle, l, count, drawTree);
  }
}


/*Event handlers*/

function changeAngle() {
  current.angle = toRadians(Number(angleInput.value));
  update();
}

function changeDepth() {
  current.depth = setNumberInput(depthInput, minDepth, maxDepth);
  update();
}

function changeLength() {
  current.length = Number(lengthInput.value);
  update();
}

function changeBg() {
  bgColour = bgColourInput.value
  update();
}

function changeFg() {
  current.fgColour = fgColourInput.value
  update();
}

function changeRotation() {
  current.rotation = toRadians(Number(rotationInput.value)) * -1 //Make rotation go clockwise
  update();
}

function changeLengthChange() {
  current.lengthChange = lengthChangeInput.value;
  update();
}

function changeLineWidth() {
  current.lineWidth = setNumberInput(lineWidthInput, minLineWidth, maxLineWidth);
  update();
}

function changeAngleChange() {
  current.angleChange = angleChangeInput.value;
  update();
}

function startDrag(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = width / rect.width;
  const scaleY = height / rect.height;
  const mouse_x = (event.clientX - rect.left) * scaleX;
  const mouse_y = (event.clientY - rect.top) * scaleY;
  const mouse_point = new Point(mouse_x, mouse_y);
  var foundTarget = false;
  trees.forEach(function(tree) {
    if (mouse_x > tree.min_x && mouse_x < tree.max_x && mouse_y > tree.min_y && mouse_y < tree.max_y) {
      if (pointDistance(tree.centerPoint(), mouse_point) <= pointDistance(current.centerPoint(), mouse_point)) {
        current = tree;
        foundTarget = true;
      }
    }
    if (foundTarget) {
      dragging = true;
      dragX = mouse_x;
      dragY = mouse_y;
      xWhenDragged = current.xPos;
      yWhenDragged = current.yPos;
    }
  });
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
  //Temporary bug fix for when position point goes outside the range (particularly if it exceeds the height)
  if (current.max_y - dy <= height && current.min_y - dy >= 0)
    current.yPos -= dy;
  if (current.max_x - dx <= width && current.min_x - dx >= 0)
    current.xPos -= dx;
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
  current.xPos = xWhenDragged;
  current.yPos = yWhenDragged;
  update();
}


/*Functions*/

function pointDistance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y + b.y) ** 2);
}

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

function update() {
  // Reset canvas
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle=bgColour;
  ctx.fillRect(0, 0, width, height);
  trees.forEach(function(tree) {
    tree.update();
  });
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

var bgColour = defaultBgColour;

var dragging = false;
//Point user clicks when dragging starts
var dragX = 0;
var dragY = 0;
//Original position when dragging starts so that it can be reverted if needed
var xWhenDragged = 0;
var yWhenDragged = 0;

var current = new Tree();
var trees = new Array();
trees.push(current);


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
