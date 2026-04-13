import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import {
  createSessionHandler,
  handleTerminalInput,
} from "./socket/handlers.js";
import {
  ContainerCapacityError,
  ContainerManager,
} from "./docker/containerManager.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import wrongRecordRoutes from "./routes/wrongRecords.js";

// Initialize database (creates tables if not exist)
import "./db/index.js";

const app = express();
const httpServer = createServer(app);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/wrong-records", wrongRecordRoutes);

// Health check
app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

// Initialize container manager
const containerManager = new ContainerManager();

function getUserFacingErrorMessage(error: unknown): string {
  if (error instanceof ContainerCapacityError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unknown error";
}

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Handle session creation
  socket.on("session:create", async (data: { levelId: number }) => {
    try {
      const previousSessionId = socket.data.sessionId;
      if (previousSessionId) {
        socket.data.sessionId = undefined;
        await containerManager.destroyContainer(previousSessionId);
      }

      const session = await createSessionHandler(
        containerManager,
        data.levelId,
      );
      socket.data.sessionId = session.id;
      socket.data.levelId = data.levelId;
      socket.emit("session:created", session);
      console.log(`Session created: ${session.id} for level ${data.levelId}`);
    } catch (error) {
      console.error("Failed to create session:", error);
      socket.emit("session:error", {
        message: getUserFacingErrorMessage(error),
      });
    }
  });

  // Handle terminal input
  socket.on(
    "terminal:input",
    async (data: { sessionId: string; command: string; levelId: number }) => {
      try {
        const result = await handleTerminalInput(
          containerManager,
          data.sessionId,
          data.command,
          data.levelId,
        );

        if (result.reconnected) {
          socket.emit("session:expired");
        }

        // Send output back to client with current directory
        socket.emit("terminal:output", {
          output: result.output,
          currentDir: result.currentDir,
          completed: result.completed,
        });

        // Check if level is completed
        if (result.completed) {
          socket.emit("level:completed", { levelId: data.levelId });
        }
      } catch (error) {
        console.error("Failed to handle terminal input:", error);
        const errorMessage = getUserFacingErrorMessage(error);
        socket.emit("terminal:output", {
          output: `\x1b[31mError: ${errorMessage}\x1b[0m`,
        });
      }
    },
  );

  // Handle disconnect
  socket.on("disconnect", async () => {
    console.log("Client disconnected:", socket.id);
    const sessionId = socket.data.sessionId;
    if (sessionId) {
      try {
        await containerManager.destroyContainer(sessionId);
        console.log(`Container destroyed for session: ${sessionId}`);
      } catch (error) {
        console.error("Failed to destroy container:", error);
      }
    }
  });
});

const PORT = process.env.PORT || 3001;

async function shutdown() {
  console.log("Shutting down...");
  await containerManager.cleanup();
  process.exit(0);
}

process.on("SIGTERM", () => {
  void shutdown();
});

process.on("SIGINT", () => {
  void shutdown();
});

async function bootstrap() {
  await containerManager.initialize();

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

void bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
