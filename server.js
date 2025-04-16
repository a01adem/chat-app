"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const messageHistory = [];
const activeUsers = [];
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
const publicPath = path_1.default.join(__dirname, "./public");
app.use(express_1.default.static(publicPath));
const STATUS = {
    SENT: 'sent',
    DELIVERED: 'delivered',
    READ: 'read'
};
function extractMentions(text) {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
        mentions.push(match[1]);
    }
    return mentions;
}
io.on('connection', (socket) => {
    socket.on('user joined', (username) => {
        socket.username = username;
        if (!activeUsers.includes(username)) {
            activeUsers.push(username);
        }
        io.emit('active users', activeUsers);
        socket.broadcast.emit('user joined', username);
        socket.emit('message history', messageHistory);
    });
    socket.on('chat message', (data) => {
        data.status = STATUS.DELIVERED;
        data.timestamp = Date.now();
        const extractedMentions = extractMentions(data.text);
        data.mentions = extractedMentions.filter(mention => activeUsers.includes(mention));
        messageHistory.push(data);
        if (messageHistory.length > 100) {
            messageHistory.shift();
        }
        io.emit('chat message', data);
        if (data.mentions && data.mentions.length > 0) {
            data.mentions.forEach(mentionedUser => {
                const mentionedSocket = Array.from(io.sockets.sockets.values()).find((s) => s.username === mentionedUser);
                if (mentionedSocket) {
                    mentionedSocket.emit('mentioned', {
                        from: data.user,
                        message: data.text
                    });
                }
            });
        }
    });
    socket.on('edit message', (data) => {
        const messageIndex = messageHistory.findIndex(msg => msg.id === data.id);
        if (messageIndex !== -1) {
            messageHistory[messageIndex].text = data.text;
            messageHistory[messageIndex].mentions = data.mentions;
        }
        socket.broadcast.emit('edit message', data);
    });
    socket.on('delete message', (data) => {
        const messageIndex = messageHistory.findIndex(msg => msg.id === data.id);
        if (messageIndex !== -1) {
            messageHistory.splice(messageIndex, 1);
        }
        socket.broadcast.emit('delete message', data);
    });
    socket.on('message received', (data) => {
        socket.broadcast.emit('message status update', {
            id: data.id,
            status: STATUS.READ,
            to: data.to,
            from: data.user
        });
    });
    socket.on('mark messages read', (data) => {
        socket.broadcast.emit('messages read by', {
            user: data.user
        });
    });
    socket.on('user left', (username) => {
        const index = activeUsers.indexOf(username);
        if (index !== -1) {
            activeUsers.splice(index, 1);
        }
        io.emit('active users', activeUsers);
        socket.broadcast.emit('user left', username);
    });
    socket.on('disconnect', () => {
        if (socket.username) {
            const index = activeUsers.indexOf(socket.username);
            if (index !== -1) {
                activeUsers.splice(index, 1);
            }
            io.emit('active users', activeUsers);
            socket.broadcast.emit('user left', socket.username);
        }
    });
    socket.on('request active users', () => {
        socket.emit('active users', activeUsers);
    });
    socket.on('invalid mention', (mentionedUser) => {
        socket.emit('mention error', `User ${mentionedUser} is not active in the chat.`);
    });
});
server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
