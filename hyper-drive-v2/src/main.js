const mainCanvas = document.getElementById("mainCanvas");
const context = mainCanvas.getContext("2d");
const distortionTime = 2000;
const warpTime = 2000;
const arrivingTime = 500;
let GAME_WIDTH = 0;
let GAME_HEIGHT = 0;
let stars = [];
let starSpeed = 0;
let isDistorting = false;
let isWarping = false;
let currDistortionTime = 0;
let currWarpTime = 0;
let currArrivingTime = 0;
let isArriving = false;
let isArrived = false;

function resizeCanvas() {
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;
    GAME_WIDTH = window.innerWidth;
    GAME_HEIGHT = window.innerHeight
}

function mapValue(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function spawnStar()
{
    let star = {};
    star.x = randomRange(-GAME_WIDTH / 2, GAME_WIDTH / 2);
    star.y = randomRange(-GAME_HEIGHT / 2, GAME_HEIGHT / 2);
    star.z = randomRange(0, GAME_WIDTH);
    star.r = 1;
    star.lastDistortRatio = 0;
    star.lastX = star.x;
    star.lastY = star.y;
    star.lastZ = star.z;
    star.lastR = star.r;
    return star;
}

function updateStar(star){
    star.z = star.z - starSpeed;
    if (star.z < 1) {
        star.x = randomRange(-GAME_WIDTH / 4, GAME_WIDTH / 4);
        star.y = randomRange(-GAME_HEIGHT / 4, GAME_HEIGHT / 4);
        star.z = GAME_WIDTH;
        star.r = 1;
        star.lastDistortRatio = 0;
        star.lastX = star.x;
        star.lastY = star.y;
        star.lastZ = star.z;
        star.lastR = star.r;
    }
}

function showWarpImage() {
    const imgWidth = warpImage.naturalWidth;
    const imgHeight = warpImage.naturalHeight;
    const aspectRatio = imgWidth / imgHeight;
    let targetWidth, targetHeight;

    if (GAME_WIDTH / GAME_HEIGHT > aspectRatio) {
        targetHeight = GAME_HEIGHT;
        targetWidth = targetHeight * aspectRatio;
    } else {
        targetWidth = GAME_WIDTH;
        targetHeight = targetWidth / aspectRatio;
    }

    warpImage.style.width = `${targetWidth}px`;
    warpImage.style.height = `${targetHeight}px`;
    warpImage.style.opacity = "1";
}

function drawStar(context, star, dt)
{
    let offsetX = GAME_WIDTH / 2;
    let offsetY = GAME_HEIGHT / 2
    if (isArrived) {
        currDistortionTime = 0;
        let scaledX = mapValue(star.x/star.z, 0, 1, 0, GAME_WIDTH);
        let scaledY = mapValue(star.y/star.z, 0, 1, 0, GAME_HEIGHT);
        let r = Math.max(mapValue(star.z, 0, GAME_WIDTH, 2, 0), 0.1);
        star.r = r;
        context.fillStyle = "white";
        context.strokeStyle = "transparent";
        context.beginPath();
        context.ellipse(scaledX + offsetX, scaledY + offsetY, r, r, Math.PI / 2, 0, 2 * Math.PI);
        context.fill();
    } else if (isArriving) {
        let fadeRatio = mapValue(currArrivingTime, 0, arrivingTime, star.lastR, 0);
        let scaledX = mapValue(star.x/star.z, 0, 1, 0, GAME_WIDTH);
        let scaledY = mapValue(star.y/star.z, 0, 1, 0, GAME_HEIGHT);
        let farZ = Math.min(GAME_WIDTH, star.z + 1 * 100);
        let endX = mapValue(star.x / farZ, 0, 1, 0, GAME_WIDTH);
        let endY = mapValue(star.y / farZ, 0, 1, 0, GAME_HEIGHT);
        context.strokeStyle = "white";
        context.lineWidth = fadeRatio;
        context.beginPath();
        context.moveTo(offsetX + scaledX, offsetY + scaledY);
        context.lineTo(offsetX + endX, offsetY + endY);
        context.stroke();

        if(currArrivingTime > arrivingTime){
            isArriving = false;
            isArrived = true;
            starSpeed = 0.05;
        }

        if(currArrivingTime > arrivingTime / 2)
        {
            showWarpImage();
            currDistortionTime = 0;
            let scaledX = mapValue(star.x/star.z, 0, 1, 0, GAME_WIDTH);
            let scaledY = mapValue(star.y/star.z, 0, 1, 0, GAME_HEIGHT);
            let r = Math.max(mapValue(star.z, 0, GAME_WIDTH, 2, 0), 0.1);
            star.r = r;
            context.fillStyle = "white";
            context.strokeStyle = "transparent";
            context.beginPath();
            context.ellipse(scaledX + offsetX, scaledY + offsetY, r, r, Math.PI / 2, 0, 2 * Math.PI);
            context.fill();
        }

    } else if (isWarping) {
        let scaledX = mapValue(star.x/star.z, 0, 1, 0, GAME_WIDTH);
        let scaledY = mapValue(star.y/star.z, 0, 1, 0, GAME_HEIGHT);
        let farZ = Math.min(GAME_WIDTH, star.z + 1 * 100);
        let endX = mapValue(star.x / farZ, 0, 1, 0, GAME_WIDTH);
        let endY = mapValue(star.y / farZ, 0, 1, 0, GAME_HEIGHT);
        context.strokeStyle = "white";
        context.lineWidth = star.lastR;
        context.beginPath();
        context.moveTo(offsetX + scaledX, offsetY + scaledY);
        context.lineTo(offsetX + endX, offsetY + endY);
        context.stroke();

        if(currWarpTime > warpTime){
            isWarping = false;
            isArriving = true;
        }
    } else if (isDistorting) {
        if(currDistortionTime > distortionTime){
            isDistorting = false;
            isWarping = true;
            starSpeed = 25;
            star.x = star.lastX;
            star.y = star.lastY;
            star.z = star.lastZ;
            star.r = star.lastR;
        } else {
            let distortRatio = mapValue(currDistortionTime, 0, distortionTime, 0, 1);
            let nearZ = Math.max(0, star.z - distortRatio * 100);
            let farZ = Math.min(GAME_WIDTH, star.z + distortRatio * 100);
            let startX = mapValue(star.x / nearZ, 0, 1, 0, GAME_WIDTH);
            let startY = mapValue(star.y / nearZ, 0, 1, 0, GAME_HEIGHT);
            let endX = mapValue(star.x / farZ, 0, 1, 0, GAME_WIDTH);
            let endY = mapValue(star.y / farZ, 0, 1, 0, GAME_HEIGHT);
            star.lastX = startX;
            star.lastY = startY;
            star.lastZ = nearZ;
            star.lastR = star.r + distortRatio;
            star.lastDistortRatio = distortRatio;
            context.strokeStyle = "white";
            context.lineWidth = star.r + distortRatio;
            context.beginPath();
            context.moveTo(offsetX + startX, offsetY + startY);
            context.lineTo(offsetX + endX, offsetY + endY);
            context.stroke();
        }

    } else {
        currDistortionTime = 0;
        let scaledX = mapValue(star.x/star.z, 0, 1, 0, GAME_WIDTH);
        let scaledY = mapValue(star.y/star.z, 0, 1, 0, GAME_HEIGHT);
        let r = Math.max(mapValue(star.z, 0, GAME_WIDTH, 2, 0), 0.1);
        star.r = r;
        context.fillStyle = "white";
        context.strokeStyle = "transparent";
        context.beginPath();
        context.ellipse(scaledX + offsetX, scaledY + offsetY, r, r, Math.PI / 2, 0, 2 * Math.PI);
        context.fill();
    }
}

function createStars(starCount)
{
    stars = [];
    for (let index = 0; index < starCount; index++) {       
        stars.push(spawnStar());
    }
}

let lastTime = 0;
function gameLoop(timestamp){
    let dt = timestamp - lastTime;
    lastTime = timestamp;
    context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    context.fillStyle = "black";
    context.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

    if(isDistorting){
        currDistortionTime += dt;
    } else {
        currDistortionTime = 0;
    }

    if(isWarping){
        currWarpTime += dt;
    } else {
        currWarpTime = 0;
    }

    if(isArriving){
        currArrivingTime += dt;
    } else {
        currArrivingTime = 0;
    }

    for (let index = 0; index < stars.length; index++) {       
        updateStar(stars[index]);
        drawStar(context, stars[index], dt);
    }

    requestAnimationFrame(gameLoop);
}

function startWarp() {
    if(isWarping == true || isDistorting == true)
    {
        return;
    }

    isDistorting = true;
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("mousedown", startWarp);
resizeCanvas();
createStars(2000);
requestAnimationFrame(gameLoop);