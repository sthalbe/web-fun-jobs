import { Game } from "./game.js";

const mainCanvas = document.getElementById("mainCanvas");
const context = mainCanvas.getContext("2d");
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
mainCanvas.width = GAME_WIDTH;
mainCanvas.height = GAME_HEIGHT;

function spawnStar()
{
    let star = {};
    star.x = Math.random() * GAME_WIDTH;
    star.y = Math.random() * GAME_HEIGHT;
    star.z = Math.random() * GAME_WIDTH;

    star.update = updateStar;
    star.draw = drawStar;
}

function updateStar(star)
{

}

function drawStar(star)
{

}

let stars = [];
function createStars()
{
    for (let index = 0; index < 100; index++) {       
        stars.push(spawnStar());
    }
}

function setup()
{
    createStars();
}

let lastTime = 0;
function gameLoop(timestamp){
    let dt = timestamp - lastTime;
    lastTime = timestamp;
    context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    for (let index = 0; index < stars.length; index++) {       
        
    }

    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);