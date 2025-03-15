const socket = io();

const createRoomBtn = document.getElementById("create-room");
const joinRoomBtn = document.getElementById("join-room");
const roomInput = document.getElementById("room-id");
const roomDisplay = document.getElementById("room-id-display");
const drawingArea = document.getElementById("drawing-area");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("color-picker");
const brushSize = document.getElementById("brush-size");
const clearCanvasBtn = document.getElementById("clear-canvas");

let drawing = false;
let currentRoom = null;

canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 100;

createRoomBtn.addEventListener("click", () => {
    const roomId = Math.floor(100000 + Math.random() * 900000).toString();
    socket.emit("join", roomId);
    currentRoom = roomId;
    updateRoomUI(roomId);
});

joinRoomBtn.addEventListener("click", () => {
    const roomId = roomInput.value;
    if (roomId) {
        socket.emit("join", roomId);
        currentRoom = roomId;
        updateRoomUI(roomId);
    }
});

canvas.addEventListener("mousedown", () => drawing = true);
canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mousemove", (event) => {
    if (!drawing) return;
    const x = event.clientX - canvas.offsetLeft;
    const y = event.clientY - canvas.offsetTop;
    draw(x, y, colorPicker.value, brushSize.value, true);
    socket.emit("draw", { x, y, color: colorPicker.value, size: brushSize.value });
});

function draw(x, y, color, size, emit) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
}

socket.on("draw", (data) => draw(data.x, data.y, data.color, data.size, false));

clearCanvasBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit("clear");
});

socket.on("clear", () => ctx.clearRect(0, 0, canvas.width, canvas.height));

function updateRoomUI(roomId) {
    document.getElementById("room-selection").style.display = "none";
    drawingArea.style.display = "block";
    roomDisplay.textContent = `房间号: ${roomId}`;
}
