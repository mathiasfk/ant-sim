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