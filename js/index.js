(function () {
    const canvas = $('#main');

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);

    const verticalPadding = 20; // padding inside canvas    
    const horizontalPadding = 50; // padding inside canvas      
    const gridSize = 20; // distance between grid
    let columnCount = 0;
    let rowCount = 0;
    let lastUpdate = currentTime();
    let drawing = false;
    const glyphs = {
        grid: {
            text: '+',
            color: 'rgba(255,255,255,0.07)',
        },
        cursor: {
            text: '■',
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
        control: false,
    }


    function addKeyEventListener() {
        document.onkeydown = function (e) {
            const keycode = e.which;

            if (keycode == 37) {
                keys.left = true;
            }
            if (keycode == 38) {
                keys.up = true;
            }
            if (keycode == 39) {
                keys.right = true;
            }
            if (keycode == 40) {
                keys.down = true;
            }
            if (keycode == 16) {
                keys.shift = true;
            }
            if (keycode == 67) {
                placeElement('clock');
            }
            if (keycode == 8) {
                deleteElement(glyphs.cursor.position.x, glyphs.cursor.position.y);
            }
            if(keycode == 17){
                keys.control = true;
            }

            e.preventDefault(); // prevent the default action (scroll / move caret)
        };

        document.onkeyup = function (e) {
            const keycode = e.which;

            if (keycode == 37) {
                keys.left = false;
            }
            if (keycode == 38) {
                keys.up = false;
            }
            if (keycode == 39) {
                keys.right = false;
            }
            if (keycode == 40) {
                keys.down = false;
            }
            if (keycode == 16) {
                keys.shift = false;
            }
            if(keycode == 17){
                keys.control = false;
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

    function deleteElement(x, y) {
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

    function removeOffgridElements() {
        for (const [i, element] of elements.entries()) {
            if (element.position.x >= rowCount || element.position.y >= columnCount || element.position.x < 0 || element.position.y <0) {
                deleteElement(element.position.x, element.position.y)
            }
        }
    }


    function resizeCanvas() {
        canvas.attr('width', window.innerWidth);
        canvas.attr('height', window.innerHeight * 0.85);
    }

    addKeyEventListener();
    resizeCanvas();

    setInterval(drawStuff, 100);

    function drawStuff() {
        if (!drawing) {
            drawing = true;
            updateInspector();
            lastUpdate = currentTime();
            clearCanvas();
            drawGrid();
            handleModifiers();
            updateSignals();
            updateElements();
            removeOffgridElements();
            drawElements();
            drawCursor();
            drawStuff();
            drawing = false;
        }
    }

    function handleModifiers(){

        const {x,y} = glyphs.cursor.position;

        if(keys.control){
            if(keys.up){
                updateDirection(x,y,'up');
            }
            if(keys.down){
                updateDirection(x,y,'down');
            }
            if(keys.left){
                updateDirection(x,y,'left');
            }
            if(keys.right){
                updateDirection(x,y,'right');
            }
        }
    }

    function updateDirection(x,y,direction){
        for (const [i, element] of elements.entries()) {
            if (element.position.x == x && element.position.y == y) {
                elements[i].data.direction = direction;
                break;
            }
        }
    }

    function updateInspector() {
        $("#element-count").html(elements.length);
        $("#update-rate").html(`${currentTime() - lastUpdate} ms`);
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

    function currentTime() {
        return Date.now();
    }

    function spawnElement(glyph, x, y, data) {
        elements.push({
            glyph,
            position: {
                x,
                y,
            },
            data
        })
    }

    function updateElements() {
        for (const [index, element] of elements.entries()) {
            switch (element.glyph) {
                case 'clock':
                    // if data does not exist make it
                    if (typeof (element.data) == 'undefined') {
                        elements[index].data = {
                            lastPulse: 0,
                            Frequence: 1
                        }
                        elements[index].data.lastPulse = currentTime();
                        elements[index].data.direction = 'right';
                    }


                    if (currentTime() - element.data.lastPulse >= 1000) {
                        elements[index].data.lastPulse = currentTime();
                        let signalSpawnPosition = {x:element.position.x , y:element.position.y}
                        switch(element.data.direction){
                            case 'left':
                                signalSpawnPosition.x -= 1;
                                break;
                            case 'right':
                                signalSpawnPosition.x += 1;
                                break;
                            case 'up':
                                signalSpawnPosition.y -=1 ;
                                break;
                            case 'down':
                                signalSpawnPosition.y += 1;
                                break;
                        }
                        spawnElement('signal', signalSpawnPosition.x, signalSpawnPosition.y, {
                            direction: element.data.direction
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
        rowCount = Math.floor((canvas.width() - (horizontalPadding * 2)) / gridSize / 5)*5 + 1;
        columnCount = Math.floor((canvas.height() - (verticalPadding * 2)) / gridSize / 5)*5 + 1;
        for (let j = 0; j < columnCount; j+=1) {
            for (let i = 0; i < rowCount; i+=1) {
                if(i%5 ==0 || j%5 == 0){
                drawText(i, j, glyphs.grid.color, glyphs.grid.text)
                }
                else{
                drawText(i, j, glyphs.grid.color, '•', 8)
                }
            }
        }
    }

    function updateCursor() {

        if(!keys.control){

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
                glyphs.cursor.position.x = (rowCount + glyphs.cursor.position.x) + horizontalPadding
            }

            if (glyphs.cursor.position.x >= rowCount) {
                glyphs.cursor.position.x = (glyphs.cursor.position.x - rowCount) + horizontalPadding
            }

            if (glyphs.cursor.position.y < 0) {
                glyphs.cursor.position.y = (columnCount + glyphs.cursor.position.y) + verticalPadding
            }

            if (glyphs.cursor.position.y >= columnCount) {
                glyphs.cursor.position.y = (glyphs.cursor.position.y - columnCount) + verticalPadding
            }
        
        }

    }

    function drawCursor() {
        updateCursor();
        if(keys.control){
            drawText(glyphs.cursor.position.x, glyphs.cursor.position.y, 'rgba(0,255,255,0.5)', glyphs.cursor.text);
        }
        else{
            drawText(glyphs.cursor.position.x, glyphs.cursor.position.y, glyphs.cursor.color, glyphs.cursor.text);
        }
    }

    function drawText(x, y, color, text, size = 12) {
        canvas.drawText({
            fillStyle: color,
            strokeStyle: color,
            strokeWidth: 1,
            x: (x * gridSize) + horizontalPadding,
            y: (y * gridSize) + verticalPadding,
            fontSize: size,
            fontFamily: 'monospace',
            text: text,
            fromCenter: false,
        });
    }

})();