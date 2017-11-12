// Pong game in JavaScript using the HTML Canvas

var canvas = document.getElementById('gameCanvas');
var canvasContext = canvas.getContext('2d');
var paddleThickness = 10;
const WIN_SCORE = 3;
var onGameOverScreen = false;
var onStartScreen = false;
var paused = false;

var score = {
    player1: 0,
    player2: 0,
    color: 'green',
    draw: function() {
        canvasContext.fillStyle = this.color;
        canvasContext.fillText(this.player1, 100, 100);
        canvasContext.fillText(this.player2, canvas.width-100, 100);
    }
}

var ball = {
    x: 50,
    y: 50,
    radius: 10,
    speedX: -10,
    speedY: 10,
    color: 'purple',
    move: function() {
        var buffer = (this.radius+playerPaddle.width)/2;
        var angle = 0.2;
        if(this.x < buffer) {
            this.speedX = -this.speedX;
            var deltaY = this.y - (playerPaddle.y+playerPaddle.height/2);
            this.speedY = deltaY * angle;
            if (playerPaddle.isCollision(this.y) === false) {
                console.log('Opponent Scores');
                score.player2++;
                checkEnd();
                this.reset();
            }
        }
        if(this.x > canvas.width - buffer) {
            this.speedX = -this.speedX;
            var deltaY = this.y - (nonPlayerPaddle.y+nonPlayerPaddle.height/2);
            this.speedY = deltaY * angle;
            if(nonPlayerPaddle.isCollision(this.y) === false) {
                console.log('Player Scores');
                score.player1++;
                checkEnd();
                this.reset();
            }
        }
        if(this.y > canvas.height || this.y < 0) {
            this.speedY = -this.speedY;
        }
        this.x += this.speedX;
        this.y += this.speedY;
    },
    draw: function() {
        colorCircle(this.x, this.y, this.radius, this.color);
    },
    reset: function() {
        this.x = canvas.width/2;
        this.y = canvas.height/2;
        this.speedY = Math.floor(Math.random()*20)-10;
    }
};

class Paddle {
    constructor() {
        this.y = canvas.height/2;
        this.width = paddleThickness;
        this.height = 100;
        this.speedY = 10;
        this.color = 'yellow';
    }

    draw() {
        colorRect(this.x,this.y,this.width,this.height,this.color);
    }

    isCollision(y) {
        var top = this.y;
        var bottom = this.y + this.height;
        if (y>top&&y<bottom) {
            return true;
        }
        return false;
    }
}

class PlayerPaddle extends Paddle {
    constructor() {
        super();
        this.x = 0;
    }
}

class NonPlayerPaddle extends Paddle {
    constructor() {
        super();
        this.x = canvas.width - paddleThickness;
    }

    move() {
        var offset = this.height/2;
        var center = this.y + offset
        var buffer = ball.radius; // reduce movement
        // if ball lower, move down
        if(center + buffer < ball.y) {
            this.y += this.speedY;
        }
        // if ball is at same height, don't move
        // if ball is higher move up
        if(center - buffer > ball.y) {
            this.y -= this.speedY;
        }
    }
}
var playerPaddle = new PlayerPaddle();
var nonPlayerPaddle = new NonPlayerPaddle();


window.onload = function() {
    const FPS = 30;
    setInterval(function() {
            moveScene();
            drawScene();   
        }, 1000/FPS);
    // Reset gamee to set up scene
    resetGame();
    onStartScreen = true;
    // Player paddle follows mouse
    canvas.addEventListener('mousemove', function(evt) {
        var mousePos = calculateMousePos(evt);
        playerPaddle.y = mousePos.y - playerPaddle.height/2;
    });
    // Click to restart game
    canvas.addEventListener('mousedown', handleMouseClick);
}

function handleMouseClick(evt) {
    if(onStartScreen) {
        onStartScreen = false;
    } else if(onGameOverScreen) {
        resetGame();
    } else if(paused) {
        paused = false;
    } else {
        paused = true;
    }

}

function moveScene() {
    if(paused){
        return;
    }
    if(onStartScreen){
        return;
    }
    if(onGameOverScreen){
        return;
    } 
    ball.move();
    nonPlayerPaddle.move();
}

function drawScene() {
    // Clear screen with black rectangle
    colorRect(0,0,canvas.width,canvas.height,'black');
    if(onStartScreen){
        drawStartScreen();
        return;
    }
    // Draw game objects
    score.draw();
    if(onGameOverScreen){
        drawEndScreen();
        return;
    } 
    drawNet();
    playerPaddle.draw();
    nonPlayerPaddle.draw();
    ball.draw();
    if(paused){
        drawPauseScreen();
    }
}

function drawNet() {
    var lineLength = 20;
    var offset = 20;
    var netX = canvas.width/2-1;
    var dashes = Math.floor(canvas.height/(lineLength+offset));
    for(var i=0;i<dashes;i++) {
        var netY = i * (lineLength+offset) + offset/2;
        colorRect(netX,netY,2,lineLength,'white');
    }
}

function checkEnd() {
    if(score.player1 >= WIN_SCORE || score.player2 >= WIN_SCORE) {
        onGameOverScreen = true;
    }
}

function drawStartScreen() {
    var title = "Pong";
    var startText = "Click to start";
    canvasContext.fillStyle = 'white';
    canvasContext.fillText(title, canvas.width/2-18, 250);
    canvasContext.fillText(startText, canvas.width/2-35, 300);
}

function drawPauseScreen() {
    var pauseText = "Paused";
    var resetText = "Click to continue";
    canvasContext.fillStyle = 'white';
    canvasContext.fillText(pauseText, canvas.width/2-16, 250);
    canvasContext.fillText(resetText, canvas.width/2-35, 300);
}

function drawEndScreen() {
    var endMessage = "You Lose";
    var resetText = "Click to continue";
    if(score.player1 >= WIN_SCORE) {
        endMessage = "You Win!";
    }
    canvasContext.fillStyle = 'white';
    canvasContext.fillText(endMessage, canvas.width/2-20, 250);
    canvasContext.fillText(resetText, canvas.width/2-35, 300);
}

function resetGame() {
    score.player1 = 0;
    score.player2 = 0;
    onGameOverScreen = false;
    ball.reset();
}

//
// Helper Functions
//
function calculateMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;
    var mouseX = evt.clientX - rect.left - root.scrollLeft;
    var mouseY = evt.clientY - rect.top - root.scrollTop;
    return {
        x: mouseX,
        y: mouseY
    };
}

function colorCircle(centerX, centerY, radius, drawColor) {
    canvasContext.fillStyle = drawColor;
    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, radius, 0,Math.PI*2,true);
    canvasContext.fill();
}

function colorRect(leftX,topY, width,height, drawColor) {
    canvasContext.fillStyle = drawColor;
    canvasContext.fillRect(leftX,topY, width,height);
}