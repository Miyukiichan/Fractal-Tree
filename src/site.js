class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  copy() {
    return new Point(this.x, this.y);
  }
}
/*Represents a fractal tree with all of its properties and drawing methods*/

class Tree {
  //Set all values to their defaults
  constructor() {
    this.position = defaultPosition.copy();
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
  checkBoundaries(point) {
    if (point.x < this.min_x || this.min_x == -1)
      this.min_x = point.x;
    if (point.x > this.max_x || this.max_x == -1)
      this.max_x = point.x;
    if (point.y < this.min_y || this.min_y == -1)
      this.min_y = point.y;
    if (point.y > this.max_y || this.max_y == -1)
      this.max_y = point.y;
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
    this.branch(this.position, 0, this.modifiedLength(), 0, drawTree)

    // Calculate centre point from boundaries
    const c_y = this.min_y + ((this.max_y - this.min_y) / 2);
    const c_x = this.min_x + ((this.max_x - this.min_x) / 2);

    if(drawTree) //Tree already drawn correctly
      return;

    // Rotation based upon right angled triangle "A" adjacent to isosceles triangle "B"
    // Where hypotenuse of A is one of the equal sides of B
    // and the equal sides of B = center point - starting y position when not rotated
    const a = toRadians(90) + this.rotation;
    const l = this.position.y - c_y;
    const dx = Math.cos(a) * l;
    const dy = Math.sin(a) * l;
    const x = c_x - dx;
    const y = c_y + dy;
    const point = new Point(x,y);

    this.resetBoundaries();
    this.branch(point, this.rotation, this.modifiedLength(), 0, true);
  }
  // Draw a branch and then draw two more
  // Only do this if drawTree flag is true
  branch(point, a, l, count, drawTree) {
    const destX = point.x - (Math.sin(a) * l);
    const destY = point.y - (Math.cos(a) * l);
    if (drawTree) {
      ctx.beginPath();
      ctx.moveTo(point.x,point.y);
      ctx.lineTo(destX, destY);
      ctx.stroke();
    }
    //Checking destination covers all but the starting point so need to check the origin in that case
    if (count == 0)
      this.checkBoundaries(point);
    const destPoint = new Point(destX, destY);
    this.checkBoundaries(destPoint);
    this.draw(destPoint, a, this.modifiedLength(l), count + 1, drawTree)
  }
  // Draw two branches mirrored along y axis
  // Pass given drawTree flag to prevent/enable drawing
  draw(point, addAngle, l, count, drawTree) {
    if (count >= this.depth)
      return;
    //Additional rotation based on rate of change and how many iterations there have been
    const modifier = count * this.angleChange / 100;
    //Left
    var trueAngle = (addAngle + this.angle) + modifier;
    this.branch(point, trueAngle, l, count, drawTree);
    //Right
    trueAngle = (addAngle - this.angle) - modifier;
    this.branch(point, trueAngle, l, count, drawTree);
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
  const point = relativePoint(event);
  var foundTarget = false;
  trees.forEach(function(tree) {
    if (point.x > tree.min_x && point.x < tree.max_x && point.y > tree.min_y && point.y < tree.max_y) {
      if (pointDistance(tree.centerPoint(), point) <= pointDistance(current.centerPoint(), point)) {
        current = tree;
        foundTarget = true;
      }
    }
  });
  if (foundTarget) {
    dragging = true;
    dragPoint = point;
    pointWhenDragged = current.position.copy();
  }
}

// Subtract the difference in user mouse movement since previous measurement from the position
// Thus moving the fractal
function drag(event) {
  if (!dragging)
    return;
  const point = relativePoint(event);
  const dx = dragPoint.x - point.x;
  const dy = dragPoint.y - point.y;
  //Temporary bug fix for when position point goes outside the range (particularly if it exceeds the height)
  if (current.max_y - dy <= height && current.min_y - dy >= 0)
    current.position.y -= dy;
  if (current.max_x - dx <= width && current.min_x - dx >= 0)
    current.position.x -= dx;
  dragPoint = point;
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
  current.position = pointWhenDragged.copy();
  update();
}


/*Functions*/

// Return the true relative point of a given canvas click event
function relativePoint(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = width / rect.width;
  const scaleY = height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y =(event.clientY - rect.top) * scaleY;
  return new Point(x,y);
}

// Return the "as the crow flies" distance between two points
function pointDistance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
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

const defaultPosition = new Point(width / 2, 1300);
const defaultBgColour = "#5F9EA0";
const defaultFgColour = "#c16081";

var bgColour = defaultBgColour;

var dragging = false;
//Point user clicks when dragging starts
var dragPoint = new Point(0,0);
//Original position when dragging starts so that it can be reverted if needed
var pointWhenDragged = new Point(0,0);

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
