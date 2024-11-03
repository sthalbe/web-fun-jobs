const mainCanvas = document.getElementById("mainCanvas");
const context = mainCanvas.getContext("2d");
let GAME_WIDTH = 0;
let GAME_HEIGHT = 0;
function resizeCanvas() {
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;
    GAME_WIDTH = window.innerWidth;
    GAME_HEIGHT = window.innerHeight
}

resizeCanvas(); // 초기 크기 설정
window.addEventListener("resize", resizeCanvas); // 창 크기 변경 시 업데이트
function mapValue(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

const slider = document.querySelector('.speed-slider');
slider.addEventListener('input', function(event) {
    starSpeed = parseFloat(event.target.value);
    starSpeed = mapValue(starSpeed, 0, GAME_WIDTH, 0.1, GAME_WIDTH / 2);
});

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function spawnStar()
{
    let star = {};
    star.x = randomRange(-GAME_WIDTH, GAME_WIDTH);
    star.y = randomRange(-GAME_HEIGHT, GAME_HEIGHT);
    star.z = randomRange(0, GAME_WIDTH);
    star.prevZ = star.z;
    star.prevPrevZ = star.z;
    star.prevCounting = 0;
    star.isBlinking = false;
    star.brightness = 0;
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

function drawLine(context, x1, y1, x2, y2) {
    context.beginPath();
    let alpha = mapValue(starSpeed, 0, GAME_WIDTH / 2, 0.1, 0.9);
    let lineWidth = mapValue(starSpeed, 0, GAME_WIDTH / 2, 0.1, 2);
    context.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    context.lineWidth = lineWidth;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
}

let brightnessSign = 1;
function drawStar(context, star, dtBlink)
{
    let offsetX = GAME_WIDTH / 2;
    let offsetY = GAME_HEIGHT / 2;

    let scaledX = mapValue(star.x/star.z, 0, 1, 0, GAME_WIDTH);
    let scaledY = mapValue(star.y/star.z, 0, 1, 0, GAME_HEIGHT);
    
    let r = Math.max(mapValue(star.z, 0, GAME_WIDTH, 2, 0), 0.1);
    
    context.fillStyle = "white";
    context.strokeStyle = "transparent";
    context.beginPath();
    context.ellipse(scaledX + offsetX, scaledY + offsetY, r, r, Math.PI / 2, 0, 2 * Math.PI);
    context.fill();

    if (star.isBlinking) {
        if(starSpeed >= 5)
        {
            star.isBlinking = false;
        }

        if(dtBlink > starBlinkInterval * 0.5){
            brightnessSign = -1;
        }
        else{
            brightnessSign = 1;
        }
        star.brightness += 2 * brightnessSign;
        drawGlowEffect(context, scaledX + offsetX, scaledY + offsetY, r, star.brightness);
    }

    let px = mapValue(star.x/star.prevZ, 0, 1, 0, GAME_WIDTH);
    let py = mapValue(star.y/star.prevZ, 0, 1, 0, GAME_HEIGHT);

    star.prevZ = star.z;
    context.fillStyle = "white";
    drawLine(context, px + offsetX, py + offsetY, scaledX + offsetX, scaledY + offsetY);
}

// 빛무리와 십자가 효과 그리기
function drawGlowEffect(context, scaledX, scaledY, r, brightness) {
    
    var a = mapValue(brightness, 0, 100, 0, 0.2);
    // 빛무리 추가
    context.beginPath();
    context.fillStyle = `rgba(255, 215, 100, ${a})`;
    context.ellipse(scaledX, scaledY, r * 4, r * 4, Math.PI / 2, 0, 2 * Math.PI);
    context.fill();
    a = mapValue(brightness, 0, 100, 0, 0.5);
    // 십자가형 반짝임 추가
    context.strokeStyle = `rgba(255, 255, 200, ${a})`;
    context.lineWidth = 0.5;
    context.beginPath();
    context.moveTo(scaledX, scaledY - r * 4);
    context.lineTo(scaledX, scaledY + r * 4);
    context.moveTo(scaledX - r * 4, scaledY);
    context.lineTo(scaledX + r * 4, scaledY);
    context.stroke();
}


let blinkStars = [];
let minBlinkCount = 300;
function setRandomBlinkIndexes(lowZStars){
    const indexes = Array.from({ length: lowZStars.length }, (_, index) => index);
    
    for (let i = indexes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
    }
    return indexes;
}

function blinkRandomStars() {
    blinkStars.forEach(prevStar => {
        prevStar.isBlinking = false;
    });
    blinkStars = []; // 이전 반짝임 초기화

    let targetZValue = GAME_WIDTH * 0.33;
    const lowZStars = stars.filter(star => star.z < targetZValue);
    let blinkCount = Math.min(minBlinkCount, lowZStars.length);
    let randomIndexes = setRandomBlinkIndexes(lowZStars);

    for (let i = 0; i < blinkCount; i++) {
        const star = lowZStars[randomIndexes[i]];
        star.isBlinking = true;
        star.brightness = 0;
        brightnessSign = 1;
        blinkStars.push(star);
    }
}

let starBlinkInterval = 3000;
let lastBlinkTime = 0;
let lastTime = 0;
let starSpeed = 0;
let dtBlink = 0;
function gameLoop(timestamp){
    let dt = timestamp - lastTime;
    lastTime = timestamp;
    dtBlink = timestamp - lastBlinkTime
    if (starSpeed < 5) {
        if (dtBlink > starBlinkInterval) {
            blinkRandomStars();
            lastBlinkTime = timestamp;
        }
    }

    context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    context.fillStyle = "black";
    context.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
    for (let index = 0; index < stars.length; index++) {       
        updateStar(stars[index]);
        drawStar(context, stars[index], dtBlink);
    }

    requestAnimationFrame(gameLoop);
}

let stars = [];
function createStars(starCount)
{
    stars = [];
    for (let index = 0; index < starCount; index++) {       
        stars.push(spawnStar());
    }
}

createStars(2000);
requestAnimationFrame(gameLoop);

