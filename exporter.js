const canvas = document.getElementById("exporter-canvas");
const ctx = canvas.getContext("2d");
const BORDER_GAP = 20;
const TILE_SIZE = 50;
const NUM_TILE_TYPE = 3;
var TileType;
(function (TileType) {
    TileType[TileType["Horse"] = 0] = "Horse";
    TileType[TileType["Space"] = 1] = "Space";
    TileType[TileType["Water"] = 2] = "Water";
    // Cherry,
    // Apple,
    // Bees,
})(TileType || (TileType = {}));
;
let numHorses = 0;
let numRows = 10;
let numCols = 20;
let grid = Array(numRows).fill(null).map(() => Array(numCols));
class Tile {
    constructor(height, width, indexX, indexY, tileType) {
        this.height = height;
        this.width = width;
        this.indexX = indexX;
        this.indexY = indexY;
        this.type = tileType;
        this.color = getColorFromType(tileType);
    }
}
function getColorFromType(type) {
    switch (type) {
        case TileType.Horse:
            return "#f5c242";
        case TileType.Water:
            return "#42b9f5";
        case TileType.Space:
            return "#98f542";
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
    const gridWidth = document.getElementById("grid-width");
    const gridHeight = document.getElementById("grid-height");
    const newNumRows = parseInt(gridHeight.value);
    const newNumCols = parseInt(gridWidth.value);
    if (newNumRows == numRows && newNumCols == numCols)
        return;
    numRows = newNumRows;
    numCols = newNumCols;
    grid = Array(numRows).fill(null).map(() => Array(numCols));
    initGrid();
    updateCanvasSize();
    drawGrid();
}
function importGridState() {
    const stateStringInput = document.getElementById("state-string-input");
    if (stateStringInput.value.length != numRows * numCols) {
        console.log(`[ERROR]: Input state string has incorrect length (expected: ${numRows * numCols}, got: ${stateStringInput.value.length}).`);
        return;
    }
    let l = 0;
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            let t = grid[i][j];
            t.type = parseInt(stateStringInput.value[l]);
            t.color = getColorFromType(t.type);
            l++;
        }
    }
    drawGrid();
}
function exportGridState() {
    const stateStringOutput = document.getElementById("state-string-output");
    stateStringOutput.value = encodeGrid();
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
function mouseDownHandler(event) {
    if (event.buttons != 1)
        return;
    const mouseX = event.pageX - canvas.offsetLeft;
    const mouseY = event.pageY - canvas.offsetTop;
    if (BORDER_GAP > mouseX || mouseX > canvas.width - BORDER_GAP || BORDER_GAP > mouseY || mouseY > canvas.height - BORDER_GAP) {
        console.log(`[WARN]: Mouse out of bound at (${mouseX}, ${mouseY}), ignoring.`);
        return;
    }
    const tc = Math.floor((mouseX - BORDER_GAP) / TILE_SIZE);
    const tr = Math.floor((mouseY - BORDER_GAP) / TILE_SIZE);
    let t = grid[tr][tc];
    const prevType = t.type;
    t.type = (t.type + 1) % NUM_TILE_TYPE;
    t.color = getColorFromType(t.type);
    if (prevType == TileType.Horse)
        numHorses--;
    if (t.type == TileType.Horse)
        numHorses++;
    drawGrid();
}
function updateCanvasSize() {
    canvas.width = 2 * BORDER_GAP + numCols * TILE_SIZE;
    canvas.height = 2 * BORDER_GAP + numRows * TILE_SIZE;
}
function main() {
    updateCanvasSize();
    canvas.addEventListener("mousedown", mouseDownHandler);
    const exportButton = document.getElementById("export-btn");
    exportButton.addEventListener("click", exportGridState);
    const importButton = document.getElementById("import-btn");
    importButton.addEventListener("click", importGridState);
    const clearButton = document.getElementById("clear-grid-btn");
    clearButton.addEventListener("click", clearGridState);
    const updateGridSizeButton = document.getElementById("update-grid-size-btn");
    updateGridSizeButton.addEventListener("click", updateGridSize);
    initGrid();
    drawGrid();
}
main();
export {};
