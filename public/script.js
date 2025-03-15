const socket = io("https://你的服务器地址"); // 修改为你的后端 WebSocket 地址

let roomId = null;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const createRoomBtn = document.getElementById('create-room');
const joinRoomBtn = document.getElementById('join-room');
const roomInput = document.getElementById('room-id');
const drawingArea = document.getElementById('drawing-area');
const roomSelection = document.getElementById('room-selection');
const clearCanvasBtn = document.getElementById('clear-canvas');
const roomIdDisplay = document.getElementById('room-id-display');
const colorPicker = document.getElementById('color-picker');
const brushSize = document.getElementById('brush-size');

// 适配屏幕尺寸
canvas.width = window.innerWidth > 600 ? 600 : window.innerWidth * 0.9;
canvas.height = canvas.width * 0.6;

ctx.lineCap = 'round';
ctx.lineJoin = 'round';

// 创建新房间
createRoomBtn.addEventListener('click', () => {
    socket.emit('createRoom');
});

// 加入房间
joinRoomBtn.addEventListener('click', () => {
    const inputRoomId = roomInput.value.trim();
    if (inputRoomId) {
        roomId = inputRoomId;
        socket.emit('joinRoom', roomId);
    }
});

// 进入房间后显示画板
socket.on('roomJoined', (id) => {
    roomId = id;
    roomSelection.style.display = 'none';
    drawingArea.style.display = 'block';
    roomIdDisplay.textContent = `房间号: ${roomId}`;
});

// 监听绘画事件
let drawing = false;
let lastX = null, lastY = null;

canvas.addEventListener('mousedown', (event) => {
    drawing = true;
    lastX = event.offsetX;
    lastY = event.offsetY;
});

canvas.addEventListener('mouseup', () => {
    drawing = false;
    lastX = null;
    lastY = null;
});

canvas.addEventListener('mousemove', (event) => {
    if (!drawing) return;
    const x = event.offsetX;
    const y = event.offsetY;

    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = brushSize.value;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    socket.emit('draw', { roomId, x1: lastX, y1: lastY, x2: x, y2: y, color: ctx.strokeStyle, width: ctx.lineWidth });

    lastX = x;
    lastY = y;
});

// 监听来自服务器的绘画数据
socket.on('draw', ({ x1, y1, x2, y2, color, width }) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
});

// 清空画布
clearCanvasBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clearCanvas', roomId);
});

// 监听画布清空
socket.on('clearCanvas', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
