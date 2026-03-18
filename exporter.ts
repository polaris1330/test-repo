interface Canvas {
    [x: string]: any;
}

const canvas = document.getElementById("exporter-canvas")! as Canvas;
canvas.oncontextmenu = () => false;

const ctx = canvas.getContext("2d");

const BORDER_GAP = 20;
const TILE_SIZE = 50;
const NUM_TILE_TYPE = 7;

enum TileType {
    Space,
    Water,
    Wall,
    Cherry,
    Apple,
    Bees,
    Horse,
};

let numHorses = 0;
let numRows = 10;
let numCols = 20;
let numWalls = 0;

let grid: Tile[][] = Array(numRows).fill(null).map(() => Array(numCols));

class Tile {
    height: number;
    width: number;
    indexX: number;
    indexY: number;
    color: string;
    type: TileType;

    constructor(height: number, width: number, indexX: number, indexY: number, tileType: TileType) {
        this.height = height;
        this.width = width;
        this.indexX = indexX;
        this.indexY = indexY;
        this.type = tileType;
        this.color = getColorFromType(tileType);
    }
}

function getColorFromType(type: TileType) {
    switch (type) {
        case TileType.Horse:
            return "#d742f5";
        case TileType.Water:
            return "#42b9f5";
        case TileType.Space:
            return "#98f542";
        case TileType.Wall:
            return "#dddddd";
        case TileType.Apple:
            return "#e9272a";
        case TileType.Bees:
            return "#ecd342";
        case TileType.Cherry:
            return "#f542bf";
    }
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            const t = grid[i][j];
            ctx.fillStyle = t.color;
            ctx.fillRect(BORDER_GAP + t.indexX * t.width, BORDER_GAP + t.indexY * t.height, t.width, t.height);
            ctx.strokeRect(BORDER_GAP + t.indexX * t.width, BORDER_GAP + t.indexY * t.height, t.width, t.height);
        }
    }
}

function initGrid() {
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            grid[i][j] = new Tile(TILE_SIZE, TILE_SIZE, j, i, TileType.Space);
        }
    }
}

function clearGridState() {
    initGrid();
    drawGrid();
}

function updateGridSize() {
    const gridWidth = document.getElementById("grid-width")! as HTMLInputElement;
    const gridHeight = document.getElementById("grid-height")! as HTMLInputElement;
    const wallCount = document.getElementById("num-walls")! as HTMLInputElement;

    const newNumRows = parseInt(gridHeight.value);
    const newNumCols = parseInt(gridWidth.value);

    const newNumWalls = parseInt(wallCount.value);

    if (newNumWalls != numWalls) numWalls = newNumWalls;

    if (newNumRows == numRows && newNumCols == numCols) return;

    numRows = newNumRows;
    numCols = newNumCols;

    grid = Array(numRows).fill(null).map(() => Array(numCols));

    initGrid();
    updateCanvasSize();
    drawGrid();
}

function importGridState() {
    const gridWidth = document.getElementById("grid-width")! as HTMLInputElement;
    const gridHeight = document.getElementById("grid-height")! as HTMLInputElement;
    const wallCount = document.getElementById("num-walls")! as HTMLInputElement;
    const stateJson = document.getElementById("state-string-input")! as HTMLInputElement;
    const stateObj = JSON.parse(stateJson.value);

    const stateStr = stateObj.grid;

    if (stateStr.length != stateObj.num_rows * stateObj.num_cols) {
        console.log(`[ERROR]: Input state string has incorrect length (expected: ${numRows * numCols}, got: ${stateStr.length}).`)
        return;
    }

    if (stateObj.num_rows != numRows || stateObj.num_cols != numCols) {
        numRows = stateObj.num_rows;
        gridWidth.value = numRows.toString();
        numCols = stateObj.num_cols;
        gridHeight.value = numCols.toString();

        grid = Array(numRows).fill(null).map(() => Array(numCols));
    }

    if (stateObj.num_walls != numWalls) {
        numWalls = stateObj.num_walls;
        wallCount.value = numWalls.toString();
    }

    initGrid();

    let l = 0;
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            grid[i][j].type = stateStr.charCodeAt(l) - 48;
            grid[i][j].color = getColorFromType(grid[i][j].type);
            l++;
        }
    }

    // let l = 0;
    // let cr = 0;
    // let cc = 0;
    // while (l < stateStr.length) {
    //     const currChar = stateStr.charCodeAt(l);
    //     if (currChar >= 48 && currChar <= 57) {
    //         let t = JSON.parse(JSON.stringify(grid[cr][cc])) as Tile;
    //         t.type = currChar - 48;
    //         t.color = getColorFromType(t.type);
    //         temp[cr].push(t);
    //         cc++;
    //         if (cc == numCols) {
    //             temp.push([]);
    //             cc = 0;
    //             cr++;
    //         }
    //         l++;
    //     }
    //     // '\n' is ASCII code 10, '\r' is ASCII code 13
    //     else if (currChar == 10 || currChar == 13) {
    //         l++;
    //     } else {
    //         console.log(`[ERROR]: Invalid character in input state string has incorrect length (expected a number between 0-9, got '${stateStr[l]}').`)
    //         return;
    //     }
    // }
    updateCanvasSize();

    drawGrid();
}

function exportGridState() {
    const stateStringOutput = document.getElementById("state-string-output")! as HTMLInputElement;
    const obj = {
        "num_rows": numRows,
        "num_cols": numCols,
        "num_walls": numWalls,
        "grid": encodeGrid(),
    }
    stateStringOutput.value = JSON.stringify(obj);
}

function encodeGrid() {
    let output = "";

    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            output += grid[i][j].type;
        }
    }

    return output;
}

function mouseDownHandler(event: any) {
    if (event.buttons != 1 && event.buttons != 2) return;

    const mouseX = event.pageX - canvas.offsetLeft;
    const mouseY = event.pageY - canvas.offsetTop;

    if (BORDER_GAP > mouseX || mouseX > canvas.width - BORDER_GAP || BORDER_GAP > mouseY || mouseY > canvas.height - BORDER_GAP) {
        console.log(`[WARN]: Mouse out of bound at (${mouseX}, ${mouseY}), ignoring.`)
        return;
    }

    const tc = Math.floor((mouseX - BORDER_GAP) / TILE_SIZE);
    const tr = Math.floor((mouseY - BORDER_GAP) / TILE_SIZE);

    let t = grid[tr][tc];

    const prevType = t.type;

    if (event.buttons == 1) {
        t.type = (t.type + 1) % NUM_TILE_TYPE;
    }
    else {
        t.type = (t.type + NUM_TILE_TYPE - 1) % NUM_TILE_TYPE;
    }
    t.color = getColorFromType(t.type);

    if (prevType == TileType.Horse) numHorses--;
    if (t.type == TileType.Horse) numHorses++;

    drawGrid();
}

function updateCanvasSize() {
    canvas.width = 2 * BORDER_GAP + numCols * TILE_SIZE;
    canvas.height = 2 * BORDER_GAP + numRows * TILE_SIZE;
}

function main() {
    updateCanvasSize();

    canvas.addEventListener("mousedown", mouseDownHandler);

    const exportButton = document.getElementById("export-btn")! as HTMLElement;
    exportButton.addEventListener("click", exportGridState);

    const importButton = document.getElementById("import-btn")! as HTMLElement;
    importButton.addEventListener("click", importGridState);

    const clearButton = document.getElementById("clear-grid-btn")! as HTMLElement;
    clearButton.addEventListener("click", clearGridState);

    const updateGridSizeButton = document.getElementById("update-grid-size-btn")! as HTMLElement;
    updateGridSizeButton.addEventListener("click", updateGridSize);

    initGrid();
    drawGrid();
}

main();