// Grid properties
const CANVAS_SIZE = 500;
const PIXEL_SIZE = 10;
const GRID_SIZE = CANVAS_SIZE / PIXEL_SIZE; 
const VALUE_INCREMENT = 10;
const VALUE_MAX = 255;
const VALUE_DECREMENT = 0.2;

// Ant properties
const ANT_SIZE = 1;
const ANT_COUNT = 10;
const ANT_VISION_ANGLE = 120;
const ANT_VISION_ANGLE_INCREMENT = 15;
const ANT_VISION_DISTANCE = 1.2;
const ANT_SPEED = 0.2;

// Visuals
const ANT_COLOR = 'red';
const CHOSEN_PIXEL_COLOR = 'rgb(0,0,255,0.4)';
const VISION_COLOR = 'rgba(255,255,255,0.8)';
const DRAW_CHOSEN_PIXEL = false;
const DRAW_VISION = false;


class Ant {
    constructor(grid_size){
        this.x = Math.floor(Math.random() * grid_size);
        this.y = Math.floor(Math.random() * grid_size);
        this.direction = Math.random() * 360;
    }

    _chooseDirection(ctx, grid) {
        const startAngle = this.direction - ANT_VISION_ANGLE/2;
        const finishAngle = this.direction + ANT_VISION_ANGLE/2;

        let maxValue = 0;
        let bestDirection = this.direction;
        for(let angle = startAngle; angle <= finishAngle; angle += ANT_VISION_ANGLE_INCREMENT) {
            const pixel_x = this.x + Math.cos(degreesToRadians(angle)) * ANT_VISION_DISTANCE;
            const pixel_y = this.y + Math.sin(degreesToRadians(angle)) * ANT_VISION_DISTANCE;

            const current_value = grid.getPixelValue(pixel_x, pixel_y);
            if (current_value > maxValue) {
                maxValue = current_value;
                bestDirection = this._normalizeAngle(angle);
                if (DRAW_CHOSEN_PIXEL) {
                    grid._drawPixel(ctx, pixel_x, pixel_y, CHOSEN_PIXEL_COLOR);
                }
            }
        }
        this.direction = bestDirection;
    }

    _normalizeAngle(angle) {
        while (angle < 0) angle += 360;
        while (angle > 360) angle -= 360;
        return angle;
    }

    _draw(ctx) {
        if (DRAW_VISION) {
            this._drawVision(ctx, VISION_COLOR);
        }
        this._drawAnt(ctx, ANT_COLOR, this.x, this.y);
    }

    _drawAnt(ctx, color, x, y) {
        ctx.fillStyle = color;
        ctx.fillRect(x*PIXEL_SIZE - PIXEL_SIZE/2, y*PIXEL_SIZE - PIXEL_SIZE/2, PIXEL_SIZE, PIXEL_SIZE);
    }

    _drawVision(ctx, color) {
        const leftEdgeX = this.x + Math.cos(degreesToRadians(this.direction - ANT_VISION_ANGLE/2)) * ANT_VISION_DISTANCE;
        const leftEdgeY = this.y + Math.sin(degreesToRadians(this.direction - ANT_VISION_ANGLE/2)) * ANT_VISION_DISTANCE;
        
        const rightEdgeX = this.x + Math.cos(degreesToRadians(this.direction + ANT_VISION_ANGLE/2)) * ANT_VISION_DISTANCE;
        const rightEdgeY = this.y + Math.sin(degreesToRadians(this.direction + ANT_VISION_ANGLE/2)) * ANT_VISION_DISTANCE;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(this.x * PIXEL_SIZE, this.y * PIXEL_SIZE);
        ctx.lineTo(leftEdgeX * PIXEL_SIZE, leftEdgeY * PIXEL_SIZE);
        ctx.lineTo(rightEdgeX * PIXEL_SIZE, rightEdgeY * PIXEL_SIZE);
        ctx.arc(
            this.x * PIXEL_SIZE, 
            this.y * PIXEL_SIZE, 
            ANT_VISION_DISTANCE * PIXEL_SIZE, 
            degreesToRadians(this.direction - ANT_VISION_ANGLE/2), 
            degreesToRadians(this.direction + ANT_VISION_ANGLE/2)
        );
        ctx.fill();
    }

    _updatePosition() {
        this.x += Math.cos(degreesToRadians(this.direction))*ANT_SPEED;
        this.y += Math.sin(degreesToRadians(this.direction))*ANT_SPEED;

        this.x = (this.x + GRID_SIZE) % GRID_SIZE;
        this.y = (this.y + GRID_SIZE) % GRID_SIZE;
    }

    _markPixel(grid) {
        grid.markPixel(this.x, this.y);
    }

    move(ctx, grid) {
        this._chooseDirection(ctx, grid);
        this._markPixel(grid);
        this._updatePosition();
        this._draw(ctx);
    }
}

class Grid {
    constructor(grid_size, pixel_size) {
        this._grid_size = grid_size;
        this._pixel_size = pixel_size;
        this._grid = {};
    }

    getPixelValue(x, y) {
        const gridX = Math.round(x);
        const gridY = Math.round(y);
        
        const val = this._grid[`${gridX},${gridY}`];
        return val ? val : 0;
    }

    markPixel(x, y) {
        const gridX = Math.round(x);
        const gridY = Math.round(y);
        const prevValue = this.getPixelValue(gridX, gridY);
        const newValue = prevValue > VALUE_MAX - VALUE_INCREMENT ? VALUE_MAX : prevValue + VALUE_INCREMENT;
        this._grid[`${gridX},${gridY}`] = newValue;
    }

    _deletePixel(x, y) {
        const gridX = Math.round(x / PIXEL_SIZE);
        const gridY = Math.round(y / PIXEL_SIZE);
        delete this._grid[`${gridX},${gridY}`];
    }

    _getColor (value) {
        const grade = value > 255 ? 255 : Math.floor(value);
        return `rgba(${grade},${grade},0,1)`;
    }

    _adjustPixel(x, y) {
        const gridX = Math.round(x / 1)*1*this._pixel_size;
        const gridY = Math.round(y / 1)*1*this._pixel_size;
        return [gridX, gridY]
    }

    _decay(gridX, gridY) {
        const prevValue = this.getPixelValue(gridX, gridY);
        const newValue = prevValue - VALUE_DECREMENT;
        if (newValue <= 0) {
            delete this._grid[`${gridX},${gridY}`];
        }
        else {
            this._grid[`${gridX},${gridY}`] = newValue;
        }
    }

    _drawPixel(ctx, gridX, gridY, color) {
        const [screenX, screenY] = this._adjustPixel(gridX, gridY);
        ctx.fillStyle = color;
        ctx.fillRect(screenX, screenY, this._pixel_size, this._pixel_size);
    }

    _getCoordinatesFromEvent(e) {
        const isTouch = e instanceof TouchEvent;
        const x = (isTouch ? e.touches[0].clientX : e.clientX) - window.canvas.offsetLeft;
        const y = (isTouch ? e.touches[0].clientY : e.clientY) - window.canvas.offsetTop;
        return [x, y];
    }

    mouseHandler(e) {
        const [x, y] = this._getCoordinatesFromEvent(e);
    
        switch(e.type){
            case 'touchstart':
            case 'mousedown':
                this.isClicked = true;
                break;
            case 'touchend':
            case 'touchleave':
            case 'touchcancel':
            case 'mouseup':
            case 'mouseout':
                this.isClicked = false;
                break;
        }
    
        if (this.isClicked) {
            this._deletePixel(x, y);
            this._deletePixel(x - PIXEL_SIZE, y);
            this._deletePixel(x + PIXEL_SIZE, y);
            this._deletePixel(x, y - PIXEL_SIZE);
            this._deletePixel(x, y + PIXEL_SIZE);
        }
    }

    draw(ctx) {
        Object.keys(this._grid).forEach(pos => {
            const value = this._grid[pos];
            const [gridX, gridY] = pos.split(",");
            this._drawPixel(ctx, gridX, gridY, this._getColor(value));
            
            this._decay(gridX, gridY);

            
        });
    }
}

const radiansToDegrees = (rad) => rad * 180 / Math.PI;
const degreesToRadians = (deg) => deg * Math.PI / 180;


const initializeAnts = (quantity) => {
    const ants = [];
    while (quantity--) {
        ants[quantity] = new Ant(GRID_SIZE);
    }
    return ants;
};

const draw = (timestamp) => {

    window.ctx.globalCompositeOperation = "destination-over";
    window.ctx.clearRect(0, 0, CANVAS_SIZE + ANT_SIZE, CANVAS_SIZE + ANT_SIZE);

    window.ants.forEach(ant => ant.move(window.ctx, window.grid));
    window.grid.draw(window.ctx);

    window.requestAnimationFrame(draw);
}


const init = () => {
    window.ants = initializeAnts(ANT_COUNT);
    window.grid = new Grid(GRID_SIZE, PIXEL_SIZE);
    window.canvas = document.getElementById("canvas");
    window.ctx = window.canvas.getContext("2d");

    const events = [
        "mousemove",
        "mousedown",
        "mouseup",
        "mouseout",
        "touchstart",
        "touchend",
        "touchcancel",
        "touchleave",
        "touchmove"
    ];

    events.forEach(
        event => window.canvas.addEventListener(event, e => window.grid.mouseHandler(e), false)
    );

    window.requestAnimationFrame(draw);
}

init();