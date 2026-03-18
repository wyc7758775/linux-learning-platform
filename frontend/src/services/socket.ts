import { io, Socket } from 'socket.io-client'

export const socket: Socket = io('http://localhost:3001', {
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
