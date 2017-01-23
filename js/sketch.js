// ===== Game Constants =====
var shipWidth = 60;
var shipHeight = 30;

// ===== Game Variables =====
var s;
var bullets = new BulletSystem();
var targets = new TargetSystem();
var life;
var score;
var timer;
var diff;
var playing = true;
var loss = false;
var highScore = 0;

// ===== Canvas Elements =====
var canvas;

function setup() {
    var body = select("#body");
    canvas = createCanvas(body.width, body.height);
    canvas.parent(body);

    s = new Ship(50, height / 2);
    life = 5;
    score = 0;
    timer = 0;
    diff = .1;

    noStroke();
    background('#000000');

    e = new Enemy(width - 50 - shipWidth, height / 2);
    targets.add(e);
}

function draw() {
    background('#000000');

    s.display();
    bullets.display();
    targets.display();

    if (playing && !loss) {
        s.move();
        bullets.update();
        targets.update();

        gameOver();
        addEnemy();
        timer += diff;

        diff = map(score, 0, 1000000, .01, .5);

        fill('#fafafa');
        textSize(20);
        textAlign(CENTER);
        textFont('Courier New');
        text("Score: " + score, width / 4, 50);
        text("Lives: " + life, 3 * width / 4, 50);
    } else if (loss) {
        displayEnd();
    }

}

/**
 * === Key Pressed ===
 * Method which allows the user to do two actions:
 *  1   ->  If spacebar is pressed, and the game is playing, then the user fires a bullet
 *  2   ->  If the enter key is pressed, the game toggles between playing and paused
 */
function keyPressed() {
    if (keyCode === 32 && playing) {
        var b1 = new Bullet(s.xPos + s.width, s.yPos + s.height / 2);
        bullets.add(b1);
    } else if (keyCode === RETURN) {
        playing = !playing;
    }
}

/**
 * === Add Enemy ===
 * Method which adds an enemy based on a time interval
 * Each time 100 enemies are destroyed, the number of enemies added each time increases
 */
function addEnemy() {
    if (timer >= 1) {
        var y = random(0, height - shipHeight);
        targets.add(new Enemy(width, y));
        timer = 0;
    }
}

/**
 * === Game Over ===
 * Method which checks if life is less than or equal to 0
 * If it is, sets loss equal to true
 */
function gameOver() {
    if (life <= 0) {
        loss = true;
        if (score > highScore) {
            highScore = score;
        }
    }
}

/**
 * === Display End ===
 * Method which only appears at the end of the game and displays the final score and user's highest score
 */
function displayEnd() {
    fill('#fafafa');
    textSize(30);
    textAlign(CENTER);
    textFont('Courier');
    text("GAME OVER", width / 2, height / 2 - 30);
    textSize(20);
    text("Final Score: " + score, width / 2, height / 2 + 20);
    text("Your High Score: " + highScore, width / 2, height / 2 + 50);
    textSize(25);
    text("Play Again", width / 2, height / 2 + 100);

    if (mouseIsPressed &&
        (mouseX > width / 2 - 50 && mouseX < width / 2 + 50) &&
        (mouseY > height / 2 + 85 && mouseY < height / 2 + 115)) {
        resetGame();
    }
}

/**
 * === Reset Game ===
 * Method which resets game variables and allows the user to begin a new round
 */
function resetGame() {
    s = new Ship(50, height / 2);
    life = 5;
    score = 0;
    timer = 0;
    targets.system = [];
    bullets.system = [];
    loss = false;
    playing = true;
}


/**
 * ===== Ship Object =====
 * Object which is the player controlled ship used to play the game
 * Ship has several variables which determine the properties and aid in movement
 * 
 * xPos     ->      upper-left x coordinate where the ship's drawing begins
 * yPos     ->      upper-left y coordinate where the ship's drawing begins
 * width    ->      the width of the ship
 * height   ->      the height of the ship
 * color1   ->      the color of the ship
 * xSpeed   ->      how many pixels the ship will move horizontally
 * ySpeed   ->      how many pixels the ship will move vertically
 */
function Ship(xPos, yPos) {
    this.xPos = xPos;
    this.yPos = yPos;

    // === Constants === 
    this.width = shipWidth;
    this.height = shipHeight;
    this.xSpeed = 0;
    this.ySpeed = 5;

    this.color1 = '#ECEFF1';
    this.color2 = '#CFD8DC';

    /**
     * === Display ===
     * This method draws the ship as two triangles starting at xPos and yPos
     */
    this.display = function() {
        fill(this.color1);
        triangle(
            this.xPos, this.yPos,
            this.xPos + this.width, this.yPos + this.height / 2,
            this.xPos, this.yPos + this.height
        );
        fill(this.color2);
        triangle(
            this.xPos, this.yPos + this.height / 2,
            this.xPos + this.width, this.yPos + this.height / 2,
            this.xPos, this.yPos + this.height
        );

    }

    /**
     * === Move ===
     * This method controls the movement of the ship based on the following keyboard inputs
     * 
     * UP_ARROW     ->      Ship moves up by ySpeed pixels
     * DOWN_ARROW   ->      Ship moves down by ySpeed pixels
     * 
     * The method also checks for if the ship is at the top or bottom of the screen and
     * disables movement if it is
     */
    this.move = function() {
        var bottom = this.yPos + this.height >= height;
        var top = this.yPos <= 0;

        if (keyIsDown(UP_ARROW) && !top) {
            this.yPos -= this.ySpeed;
        } else if (keyIsDown(DOWN_ARROW) && !bottom) {
            this.yPos += this.ySpeed;
        }
    }

    /**
     * === To Array ===
     * This method returns the ship base triangle defined in display as an array of Vectors
     */
    this.toArray = function() {
        var triPoly = [
            createVector(this.xPos, this.yPos),
            createVector(this.xPos + this.width, this.yPos + this.height / 2),
            createVector(this.xPos, this.yPos + this.height)
        ];
        return triPoly;
    }
}

/**
 * ===== Bullet System =====
 * Object which is a system to manage the bullets fired from the player 
 * controlled ship during the game
 */
function BulletSystem() {
    this.system = new Array();

    /**
     * === Add ===
     * This method adds Bullet newBullet to the end of the Bullet System's Array
     */
    this.add = function(newBullet) {
        this.system.push(newBullet);
    }

    /**
     * === Get ===
     * This method returns the Bullet at index 'index' in the Bullet System's Array
     */
    this.get = function(index) {
        return this.system[index];
    }

    /**
     * === Remove ===
     * This method removes the Bullet at index 'index' in the Bullet System's Array
     */
    this.remove = function(index) {
        this.system.splice(index, 1);
    }

    /** 
     * === isEmpty ===
     * This method returns true if the Bullet System is empty
     */
    this.isEmpty = function() {
        return this.system.length < 1;
    }

    /**
     * === length ===
     * This method returns the length of the Bullet System
     */
    this.length = function() {
        return this.system.length;
    }

    /**
     * === Display ===
     * This method iterates through each Bullet in the Array and displays it
     */
    this.display = function() {
        for (var i = 0; i < this.system.length; i++) {
            this.system[i].display();
        }
    }

    /**
     * === Update ===
     * This method iterates through each Bullet in the Array and performs several actions
     * 
     *  1   Moves the bullet
     *  2   Checks if the bullet has exited the canvas
     *          If so, the bullet is removed from the array
     *  3   Checks if the bullet has hit an Enemy
     *          If so, the Enemy is removed from the Target System
     *          and the Bullet is removed from the Bullet System
     *          and increases the player's score
     */
    this.update = function() {
        for (var i = 0; i < this.system.length; i++) {
            var b = this.system[i];
            b.move();
            if (b.xPos > width) {
                this.remove(i);
            } else {
                for (var j = 0; j < targets.system.length; j++) {
                    var t = targets.get(j);
                    if (collideRectPoly(b.xPos, b.yPos, b.width, b.height, t.toArray())) {
                        this.remove(i);
                        targets.remove(j);
                        score += 5;
                    }
                }
            }
        }
    }
}

/**
 * ===== Bullet Object =====
 * Object which is a bullet fired from the player controlled ship
 * Object has several variables which determine the properties and aid in movement
 * 
 * xPos     ->      upper-left x coordinate where the bullet's drawing begins
 * yPos     ->      upper-left y coordinate where the bullet's drawing begins
 * width    ->      the width of the bullet
 * height   ->      the height of the bullet
 * color1   ->      the color of the bullet
 * xSpeed   ->      how many pixels the bullet will move horizontally
 */
function Bullet(xPos, yPos) {
    this.xPos = xPos;
    this.yPos = yPos;
    this.height = 5;
    this.width = 20;
    this.xSpeed = 5;

    this.color1 = '#F44336';

    this.display = function() {
        fill(this.color1);
        rect(this.xPos, this.yPos, this.width, this.height, 5);
    }

    /**
     * === Move ===
     * This method controls the movement of the bullet
     * Moving it in a horizontal direction by xSpeed pixels
     */
    this.move = function() {
        this.xPos += this.xSpeed;
    }
}
/**
 * ===== Target System =====
 * Object which is a system that manages the current enemies in the game
 */
function TargetSystem() {
    this.system = new Array();

    /**
     * === Add ===
     * This method adds Enemy newEnemy to the end of the Target System's Array
     */
    this.add = function(newEnemy) {
        this.system.push(newEnemy);
    }

    /**
     * === Get ===
     * This method returns the Enemy at index 'index' in the Target System's Array
     */
    this.get = function(index) {
        return this.system[index];
    }

    /**
     * === Remove ===
     * This method removes the Enemy at index 'index' in the Target System's Array
     */
    this.remove = function(index) {
        this.system.splice(index, 1);
    }

    /**
     * === length ===
     * This method returns the length of the Target System
     */
    this.length = function() {
        return this.system.length;
    }

    /**
     * === Display ===
     * This method iterates through each Enemy in the Array and displays it
     */
    this.display = function() {
        for (var i = 0; i < this.system.length; i++) {
            this.system[i].display();
        }
    }

    /**
     * === Update ===
     * This method iterates through each Enemy in the Array and moves them
     */
    this.update = function() {
        for (var i = 0; i < this.system.length; i++) {
            var b = this.system[i];
            if (b.xPos > 0) {
                b.move();
            } else {
                this.remove(i);
                life--;
            }
        }
    }
}

/**
 * ===== Enemy =====
 * Object which is an enemy ship that the player controlled ship will be targeting
 * Enemy has several variables which determine the properties and aid in movement
 * 
 * xPos     ->      upper-left x coordinate where the enemy's drawing begins
 * yPos     ->      upper-left y coordinate where the enemy's drawing begins
 * width    ->      the width of the enemy
 * height   ->      the height of the enemy
 * color1   ->      the color of the enemy
 * xSpeed   ->      how many pixels the enemy will move horizontally
 * ySpeed   ->      how many pixels the enemy will move vertically
 */
function Enemy(xPos, yPos) {
    this.xPos = xPos;
    this.yPos = yPos;

    // === Constants === 
    this.width = shipWidth;
    this.height = shipHeight;
    this.xSpeed = 2;
    this.ySpeed = 0;

    this.color1 = '#616161';
    this.color2 = '#424242';

    /**
     * === Display ===
     * This method draws the enemy as two triangles starting at xPos and yPos
     */
    this.display = function() {
            fill(this.color1);
            triangle(
                this.xPos + this.width, this.yPos,
                this.xPos, this.yPos + this.height / 2,
                this.xPos + this.width, this.yPos + this.height
            );
            fill(this.color2);
            triangle(
                this.xPos + this.width, this.yPos + this.height / 2,
                this.xPos, this.yPos + this.height / 2,
                this.xPos + this.width, this.yPos + this.height
            );
        }
        /**
         * === Move ===
         * This method controls the movement of the enemy ship by changing the xPos by
         * -xSpeed pixels
         */
    this.move = function() {
        this.xPos -= this.xSpeed;
    }

    /**
     * === To Array ===
     * This method returns the enemy base triangle defined in display as an array of Vectors
     */
    this.toArray = function() {
        var triPoly = [
            createVector(this.xPos, this.yPos),
            createVector(this.xPos + this.width, this.yPos + this.height / 2),
            createVector(this.xPos, this.yPos + this.height)
        ];
        return triPoly;
    }
}