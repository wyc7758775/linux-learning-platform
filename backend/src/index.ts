import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { createSessionHandler, handleTerminalInput } from './socket/handlers.js'
import { ContainerManager } from './docker/containerManager.js'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok' })
})

// Initialize container manager
const containerManager = new ContainerManager()

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  // Handle session creation
  socket.on('session:create', async (data: { levelId: number }) => {
    try {
      const session = await createSessionHandler(containerManager, data.levelId)
      socket.data.sessionId = session.id
      socket.data.levelId = data.levelId
      socket.emit('session:created', session.id)
      console.log(`Session created: ${session.id} for level ${data.levelId}`)
    } catch (error) {
      console.error('Failed to create session:', error)
      socket.emit('error', { message: 'Failed to create session' })
    }
  })

  // Handle terminal input
  socket.on('terminal:input', async (data: { sessionId: string; command: string; levelId: number }) => {
    try {
      const result = await handleTerminalInput(
        containerManager,
        data.sessionId,
        data.command,
        data.levelId
      )

      // Send output back to client with current directory
      socket.emit('terminal:output', {
        output: result.output,
        currentDir: result.currentDir
      })

      // Check if level is completed
      if (result.completed) {
        socket.emit('level:completed', { levelId: data.levelId })
      }
    } catch (error) {
      console.error('Failed to handle terminal input:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      socket.emit('terminal:output', { output: `\x1b[31mError: ${errorMessage}\x1b[0m` })
    }
  })

  // Handle disconnect
  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.id)
    const sessionId = socket.data.sessionId
    if (sessionId) {
      try {
        await containerManager.destroyContainer(sessionId)
        console.log(`Container destroyed for session: ${sessionId}`)
      } catch (error) {
        console.error('Failed to destroy container:', error)
      }
    }
  })
})

// Cleanup on server shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down...')
  await containerManager.cleanup()
  process.exit(0)
})

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
