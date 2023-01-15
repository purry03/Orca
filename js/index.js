(function () {
    const canvas = $('#main');

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);

    const padding = 50; // padding inside canvas     
    const gridSize = 20; // distance between grid
    let columnCount = 0;
    let rowCount = 0;
    const glyphs = {
        grid: {
            text: '+',
            color: 'rgba(255,255,255,0.05)',
        },
        cursor: {
            text: '▮',
            color: 'rgba(255,255,255,0.5)',
            position: {
                x: 0,
                y: 0,
            }
        },
        clock: {
            text: 'C',
            color: 'rgba(255,255,255,0.5)',
        },
        signal: {
            text: "∗",
            color: 'rgba(255,255,255,0.5)',
        }
    };


    const elements = []

    const keys = {
        up: false,
        down: false,
        left: false,
        right: false,
        shift: false,
    }


    function addKeyEventListener() {
        document.onkeydown = function (e) {
            switch (e.which) {
                case 37: // left
                    keys.left = true;
                    break;
                case 38: // up
                    keys.up = true;
                    break;
                case 39: // right
                    keys.right = true;
                    break;
                case 40: // down
                    keys.down = true;
                    break;
                case 16: //shift
                    keys.shift = true;
                    break;
                case 67: //c
                    placeElement('clock');
                    break;
                case 8:
                    deleteElement(glyphs.cursor.position.x,glyphs.cursor.position.y);
                    break;
                default:
                    return; // exit this handler for other keys
            }
            e.preventDefault(); // prevent the default action (scroll / move caret)
        };

        document.onkeyup = function (e) {
            switch (e.which) {
                case 37: // left
                    keys.left = false;
                    break;
                case 38: // up
                    keys.up = false;
                    break;
                case 39: // right
                    keys.right = false;
                    break;
                case 40: // down
                    keys.down = false;
                    break;
                case 16:
                    keys.shift = false;
                    break;
                default:
                    return; // exit this handler for other keys
            }
            e.preventDefault(); // prevent the default action (scroll / move caret)
        };
    }

    function placeElement(element) {
        elements.push({
            glyph: element,
            position: {
                x: glyphs.cursor.position.x,
                y: glyphs.cursor.position.y
            }
        })
    }

    function deleteElement(x,y) {
        let indexToDelete = -1;
        for (const [i, element] of elements.entries()) {
            if (element.position.x == x && element.position.y == y) {
                indexToDelete = i;
                break;
            }
        }
        if (indexToDelete != -1) {
            elements.splice(indexToDelete, 1);
        }
    }

    function removeOffgridElements(){
        for (const [i, element] of elements.entries()) {
            if (element.position.x >= rowCount || element.position.y >= columnCount) {
               deleteElement(element.position.x,element.position.y)
            }
        }
    }


    function resizeCanvas() {
        canvas.attr('width', window.innerWidth);
        canvas.attr('height', window.innerHeight);
    }

    addKeyEventListener();
    resizeCanvas();

    setInterval(drawStuff, 100);

    function drawStuff() {
        clearCanvas();
        removeOffgridElements();
        drawGrid();
        drawElements();
        drawCursor();
        updateSignals();
        updateElements();
    }


    function clearCanvas() {
        canvas.clearCanvas();
    }

    function updateSignals() {
        for (const [index, element] of elements.entries()) {
            if (element.glyph == 'signal') {
                switch (element.data.direction) {
                    case 'up':
                        elements[index].position.y -= 1;
                        break;
                    case 'down':
                        elements[index].position.y += 1;
                        break;
                    case 'left':
                        elements[index].position.x -= 1;
                        break;
                    case 'right':
                        elements[index].position.x += 1;
                        break;
                }
            }
        }
    }

    function currentTime(){
        return Date.now();
    }

    function spawnElement(glyph,x,y,data){
        elements.push({
            glyph,
            position:{
                x,
                y,
            },
            data
        })
    }

    function updateElements(){
        for (const [index, element] of elements.entries()) {
            switch(element.glyph){
                case 'clock':
                    // if data does not exist make it
                    if(typeof(element.data) == 'undefined'){
                        elements[index].data = {
                            lastPulse: 0,
                            Frequence: 1
                        }
                        elements[index].data.lastPulse = currentTime();
                    }


                    if(currentTime() - element.data.lastPulse >= 1000){
                        elements[index].data.lastPulse = currentTime();
                        spawnElement('signal',element.position.x+1,element.position.y,{
                            direction: 'right'
                        })
                    }

            }
        }
    }

    function drawElements() {
        for (const element of elements) {
            const glyph = glyphs[element.glyph];
            drawText(element.position.x, element.position.y, glyph.color, glyph.text, 16);
        }
    }

    function drawGrid() {
        rowCount = (canvas.width() - (padding * 2)) / gridSize;
        columnCount = (canvas.height() - (padding * 2)) / gridSize;

        for (let j = 0; j < columnCount; j++) {
            for (let i = 0; i < rowCount; i++) {
                drawText(i, j, glyphs.grid.color, glyphs.grid.text)
            }
        }
    }

    function updateCursor() {

        let cursorSpeed = 1;

        if (keys.shift) {
            cursorSpeed *= 5;
        }

        if (keys.left) {
            glyphs.cursor.position.x -= cursorSpeed;

        } else if (keys.right) {
            glyphs.cursor.position.x += cursorSpeed;


        }
        if (keys.up) {
            glyphs.cursor.position.y -= cursorSpeed;

        } else if (keys.down) {
            glyphs.cursor.position.y += cursorSpeed;

        }



        // warp cursor around screen

        if (glyphs.cursor.position.x < 0) {
            glyphs.cursor.position.x = (rowCount + glyphs.cursor.position.x)
        }

        if (glyphs.cursor.position.x >= rowCount) {
            glyphs.cursor.position.x = (glyphs.cursor.position.x - rowCount)
        }

        if (glyphs.cursor.position.y < 0) {
            glyphs.cursor.position.y = (columnCount + glyphs.cursor.position.y)
        }

        if (glyphs.cursor.position.y >= columnCount) {
            glyphs.cursor.position.y = (glyphs.cursor.position.y - columnCount)
        }

    }

    function drawCursor() {
        updateCursor();
        drawText(glyphs.cursor.position.x, glyphs.cursor.position.y, glyphs.cursor.color, glyphs.cursor.text);
    }

    function drawText(x, y, color, text, size = 12) {
        canvas.drawText({
            fillStyle: color,
            strokeStyle: color,
            strokeWidth: 1,
            x: (x * gridSize) + padding,
            y: (y * gridSize) + padding,
            fontSize: size,
            fontFamily: 'monospace',
            text: text
        });
    }

})();