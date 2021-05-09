// Grid properties
const CANVAS_SIZE = 500;
const PIXEL_SIZE = 10;
const GRID_SIZE = CANVAS_SIZE / PIXEL_SIZE; 
const VALUE_INCREMENT = 10;
const VALUE_MAX = 255;
const VALUE_DECREMENT = 0.2;

// Ant properties
const ANT_SIZE = 1;
const INITIAL_ANT_COUNT = 10;
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

const sliderHandler = (e) => {
    const newCount = e.toElement.value;
    const currentCount = window.ants.length;
    
    if(newCount >= currentCount) {
        for(let id = currentCount; id < newCount; id++){
            window.ants[id] = new Ant(GRID_SIZE);
        }
    } else {
        for(let id = currentCount - 1; id >= newCount; id--){
            window.ants.splice(id);
        }
    }
    console.log(newCount);
    console.log(window.ants.length);
}


const init = () => {

    document.getElementById("ant-count").addEventListener("mouseup", e => sliderHandler(e));

    window.ants = initializeAnts(INITIAL_ANT_COUNT);
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