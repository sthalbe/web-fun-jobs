const mainCanvas = document.getElementById("mainCanvas");
const context = mainCanvas.getContext("2d");
const GAME_WIDTH = 800;
const GAME_HEIGHT = 800;
mainCanvas.width = GAME_WIDTH;
mainCanvas.height = GAME_HEIGHT;

function mapValue(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}
  
function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}
  
function drawLine(context, x1, y1, x2, y2) {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
}

let mouseX = 0;
let mouseY = 0;

function updateMousePosition(event) {
  mouseX = event.clientX;
  mouseY = event.clientY;
}

document.addEventListener("mousemove", updateMousePosition);

function spawnStar()
{
    let star = {};
    star.x = randomRange(-GAME_WIDTH, GAME_WIDTH);
    star.y = randomRange(-GAME_HEIGHT, GAME_HEIGHT);
    star.z = randomRange(0, GAME_WIDTH);

    star.prevZ = star.z;
    star.update = updateStar;
    star.draw = drawStar;

    return star;
}

function updateStar(star)
{
    star.z = star.z - starSpeed;
    if (star.z < 1) {
        star.z = GAME_WIDTH;
        star.x = randomRange(-GAME_WIDTH, GAME_WIDTH);
        star.y = randomRange(-GAME_HEIGHT, GAME_HEIGHT);
        star.prevZ = star.z;
    }
}

function drawStar(context, star)
{
    context.fillStyle = "white";
    context.strokeStyle = "transparent";
    context.beginPath();

    let offsetX = GAME_WIDTH / 2;
    let offsetY = GAME_HEIGHT / 2;

    let scaledX = mapValue(star.x/star.z, 0, 1, 0, GAME_WIDTH);
    let scaledY = mapValue(star.y/star.z, 0, 1, 0, GAME_HEIGHT);
    
    let r = mapValue(star.z, 0, GAME_WIDTH, 1, 0);
    context.ellipse(scaledX + offsetX, scaledY + offsetY, r, r, Math.PI / 2, 0, 2 * Math.PI);
    context.fill();

    let px = mapValue(star.x/star.prevZ, 0, 1, 0, GAME_WIDTH);
    let py = mapValue(star.y/star.prevZ, 0, 1, 0, GAME_HEIGHT);

    star.prevZ = star.z;
    context.strokeStyle = "white";
    drawLine(context, px + offsetX, py + offsetY, scaledX + offsetX, scaledY + offsetY);
}

let stars = [];
function createStars()
{
    for (let index = 0; index < 1000; index++) {       
        stars.push(spawnStar());
    }
}

function setup()
{
    createStars();
}

let starSpeed = 0;
let lastTime = 0;
function gameLoop(timestamp){
    let dt = timestamp - lastTime;
    lastTime = timestamp;
    starSpeed = mapValue(mouseX, 0, GAME_WIDTH, 0, 10);
    context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    context.fillStyle = "black";
    context.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
    for (let index = 0; index < stars.length; index++) {       
        updateStar(stars[index]);
        drawStar(context, stars[index]);
    }

    requestAnimationFrame(gameLoop);
}

mainCanvas.style.position = "absolute";
mainCanvas.style.left = "50%";
mainCanvas.style.top = "50%";
mainCanvas.style.transform = "translate(-50%, -50%)";

setup();
requestAnimationFrame(gameLoop);