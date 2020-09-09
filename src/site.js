/*jshint esversion: 7*/

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

  copy() {
    var tree = new Tree();
    tree.position = defaultPosition.copy();
    tree.angle = this.angle;
    tree.depth = this.depth;
    tree.length = this.length;
    tree.fgColour = this.fgColour;
    tree.rotation = this.rotation;
    tree.lengthChange = this.lengthChange;
    tree.lineWidth = this.lineWidth;
    tree.angleChange = this.angleChange;
    return tree;
  }

  drawRectangle() {
    const bl = new Point(this.min_x, this.max_y);
    const br = new Point(this.max_x, this.max_y);
    const tl = new Point(this.min_x, this.min_y);
    const tr = new Point(this.max_x, this.min_y);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.setLineDash([30, 15]);
    drawLine(bl, br);
    drawLine(bl, tl);
    drawLine(tl, tr);
    drawLine(tr, br);
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
    const cY = this.min_y + ((this.max_y - this.min_y) / 2);
    const cX = this.min_x + ((this.max_x - this.min_x) / 2);
    return new Point(cX, cY);
  }

  update() {
    // No shape so don't need to do anything
    if (this.depth == 0)
      return;

    // Set pen style
    ctx.strokeStyle = this.fgColour;
    ctx.lineWidth = this.lineWidth;
    ctx.setLineDash([0, 0]);

    //Go through all the lines without drawing to get the centre point
    const drawTree = this.rotation == 0; //Only need to draw the tree if not rotating
    this.resetBoundaries();
    this.branch(this.position, 0, this.modifiedLength(), 0, drawTree);

    const minDistance = 200;
    if (relativeX(this.max_x) - relativeX(this.min_x) < minDistance) {
      this.max_x += minDistance / 2;
      this.min_x -= minDistance / 2;
    }

    if (relativeY(this.max_y) - relativeY(this.min_y) < minDistance) {
      this.max_y += minDistance / 2;
      this.min_y -= minDistance / 2;
    }

    // Calculate centre point from boundaries
    const cY = this.min_y + ((this.max_y - this.min_y) / 2);
    const cX = this.min_x + ((this.max_x - this.min_x) / 2);

    if (drawTree) //Tree already drawn correctly
      return;

    // Rotation based upon right angled triangle "A" adjacent to isosceles triangle "B"
    // Where hypotenuse of A is one of the equal sides of B
    // and the equal sides of B = center point - starting y position when not rotated
    const a = toRadians(90) + this.rotation;
    const l = this.position.y - cY;
    const dx = Math.cos(a) * l;
    const dy = Math.sin(a) * l;
    const x = cX - dx;
    const y = cY + dy;
    const point = new Point(x, y);

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
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(destX, destY);
      ctx.stroke();
    }

    //Checking destination covers all but the starting point
    //so need to check the origin in that case
    if (count == 0)
      this.checkBoundaries(point);
    const destPoint = new Point(destX, destY);
    this.checkBoundaries(destPoint);
    this.draw(destPoint, a, this.modifiedLength(l), count + 1, drawTree);
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
  bgColour = bgColourInput.value;
  update();
}

function changeFg() {
  current.fgColour = fgColourInput.value;
  update();
}

function changeRotation() {
  current.rotation = toRadians(Number(rotationInput.value)) * -1; //Make rotation go clockwise
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
  var foundTree = current;
  trees.forEach(function (tree) {
    if (point.x > tree.min_x && point.x < tree.max_x && point.y > tree.min_y &&
      point.y < tree.max_y) {
      if (pointDistance(tree.centerPoint(), point) <= pointDistance(current.centerPoint(), point)) {
        foundTree = tree;
        foundTarget = true;
      }
    }
  });

  setCurrent(foundTree);
  drawSelectionHint = false;
  if (foundTarget) {
    drawSelectionHint = true;
    dragging = true;
    dragPoint = point;
    pointWhenDragged = current.position.copy();
  }

  update();
}

// Subtract the difference in user mouse movement since previous measurement from the position
// Thus moving the fractal
function drag(event) {
  if (!dragging)
    return;
  const point = relativePoint(event);
  const dx = dragPoint.x - point.x;
  const dy = dragPoint.y - point.y;

  //Temporary bug fix for when position point goes outside the range
  //(particularly if it exceeds the height)
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

function newTree() {
  trees.push(new Tree());
  setCurrent(lastElement(trees));
  update();
}

function copyTree() {
  if (trees.length == 0)
    return;
  trees.push(current.copy());
  setCurrent(lastElement(trees));
  update();
}

function deleteTree() {
  removeFromArray(trees, current);
  setCurrent(lastElement(trees));
  update();
}

/*Functions*/

function drawLine(a, b) {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function setCurrent(tree) {
  if (current === tree)
    return;
  current = tree;
  if (tree == null)
    return;
  angleInput.value = toDegrees(current.angle);
  depthInput.value = current.depth;
  lengthInput.value = current.length;
  fgColourInput.value = current.fgColour;
  rotationInput.value = current.rotation;
  lengthChangeInput.value = current.lengthChange;
  lineWidthInput.value = current.lineWidth;
  angleChangeInput.value = current.angleChange;
}

function removeFromArray(array, element) {
  const index = array.indexOf(element);
  if (index < 0)
    return false;
  array.splice(index, 1);
  return true;
}

function lastElement(array) {
  if (array.length > 0)
    return array[array.length - 1];
}

function relativeX(x) {
  const rect = canvas.getBoundingClientRect();
  const scale = width / rect.width;
  return (x - rect.left) * scale;
}

function relativeY(y) {
  const rect = canvas.getBoundingClientRect();
  const scale = height / rect.height;
  return (y - rect.top) * scale;
}

// Return the true relative point of a given canvas click event
function relativePoint(event) {
  const x = relativeX(event.clientX);
  const y = relativeY(event.clientY);
  return new Point(x, y);
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
    value = max;
  else if (value < min)
    value = min;
  input.value = value;
  return value;
}

function toDegrees(rad) {
  return rad * (180 / Math.PI);
}

function toRadians(deg) {
  return deg * (Math.PI / 180);
}

// Generic function to set the min/max/default values of a given input id
// Returns an element object representing the input of the given id
function setupInput(id, handler, defaultValue, minValue = null, maxValue = null) {
  const input = document.getElementById(id);
  input.addEventListener('input', handler);
  if (minValue != null)
    input.min = minValue;
  if (maxValue != null)
    input.max = maxValue;
  input.value = defaultValue;
  return input;
}

function setupButton(id, handler) {
  const button = document.getElementById(id);
  button.addEventListener('click', handler);
  return button;
}

function update() {
  // Reset canvas
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = bgColour;
  ctx.fillRect(0, 0, width, height);
  trees.forEach(function (tree) {
    tree.update();
  });

  if (current != null && drawSelectionHint)
    current.drawRectangle();
}

/*Canvas dimensions*/

const width = 3000;
const height = width * 0.58;
const lengthChangeInputModifier = 100;

/*Value boundaries*/

const minAngle = 0;
const maxAngle = 180;
const minDepth = 0;
const maxDepth = 11;
const maxLength = 700;
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
const defaultDepth = maxDepth;
const defaultLength = maxLength;
const defaultLineWidth = 2;
const defaultRotation = minRotation;
const defaultLengthChange = 67;
const defaultAngleChange = minAngleChange;

const defaultPosition = new Point(width / 2, 1550);
const defaultBgColour = '#5F9EA0';
const defaultFgColour = '#c16081';

var bgColour = defaultBgColour;

var dragging = false;

//Point user clicks when dragging starts
var dragPoint = new Point(0, 0);

//Original position when dragging starts so that it can be reverted if needed
var pointWhenDragged = new Point(0, 0);

var current;
var trees = [];
var drawSelectionHint = true;

/*Get input elements and set default values*/

const angleInput = setupInput(
  'angle', changeAngle, defaultAngle, minAngle, maxAngle);
const depthInput = setupInput(
  'depth', changeDepth, defaultDepth, minDepth, maxDepth);
const lengthInput = setupInput(
  'length', changeLength, defaultLength, minLength, maxLength);
const bgColourInput = setupInput(
  'bg-colour', changeBg, defaultBgColour);
const fgColourInput = setupInput(
  'fg-colour', changeFg, defaultFgColour);
const rotationInput = setupInput(
  'rotation', changeRotation, defaultRotation, minRotation, maxRotation);
const lengthChangeInput = setupInput(
  'length-change', changeLengthChange, defaultLengthChange, minLengthChange, maxLengthChange);
const lineWidthInput = setupInput(
  'line-width', changeLineWidth, defaultLineWidth, minLineWidth, maxLineWidth);
const angleChangeInput = setupInput(
  'angle-change', changeAngleChange, defaultAngleChange, minAngleChange, maxAngleChange);

/*Setup control buttons*/

const newTreeButton = setupButton('new-tree', newTree);
const copyTreeButton = setupButton('copy-tree', copyTree);
const deleteTreeButton = setupButton('delete-tree', deleteTree);

// Dragging events for the canvas
const canvas = document.getElementById('canvas');
canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mousemove', drag);
canvas.addEventListener('mouseup', stopDrag);
canvas.addEventListener('mouseout', interruptDrag);

/*Initialize canvas and draw the tree*/

var ctx = canvas.getContext('2d');
canvas.height = height;
canvas.width = width;
ctx.heoght = height;
ctx.width = width;
newTree();
