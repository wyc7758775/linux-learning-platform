import { io, Socket } from 'socket.io-client'

// 生产环境使用相对路径，开发环境使用 localhost
const SOCKET_URL = import.meta.env.PROD ? window.location.origin : 'http://localhost:3001'

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
})

export function connectSocket() {
  if (!socket.connected) {
    socket.connect()
  }
}

export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect()
  }
}
