const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 存储房间信息
const rooms = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('新用户连接');

    // 创建新房间
    socket.on('createRoom', () => {
        const roomId = Math.floor(100000 + Math.random() * 900000).toString(); // 生成六位纯数字房间号
        rooms[roomId] = [];
        socket.join(roomId);
        socket.emit('roomJoined', roomId);
        console.log(`房间 ${roomId} 创建`);
    });

    // 加入已有房间
    socket.on('joinRoom', (roomId) => {
        if (rooms[roomId]) {
            socket.join(roomId);
            socket.emit('roomJoined', roomId);
            console.log(`用户加入房间 ${roomId}`);
        }
    });

    // 处理绘画同步
    socket.on('draw', (data) => {
        socket.to(data.roomId).emit('draw', data);
    });

    // 处理画布清空
    socket.on('clearCanvas', (roomId) => {
        io.to(roomId).emit('clearCanvas');
    });

    socket.on('disconnect', () => {
        console.log('用户断开连接');
    });
});

// 服务器监听端口
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
