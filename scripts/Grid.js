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