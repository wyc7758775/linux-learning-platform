import type Docker from 'dockerode'
import type { ContainerManagerState } from './types.js'

export async function ensureImageExists(ctx: ContainerManagerState): Promise<void> {
  if (ctx.imageEnsured) return

  if (!ctx.imageEnsurePromise) {
    ctx.imageEnsurePromise = (async () => {
      const images = await ctx.docker.listImages()
      const imageExists = images.some((image) =>
        image.RepoTags?.includes(`${ctx.imageName}:latest`),
      )

      if (!imageExists) {
        console.log('Building Docker image...')
        await buildImage(ctx)
      }

      ctx.imageEnsured = true
    })().finally(() => {
      ctx.imageEnsurePromise = undefined
    })
  }

  await ctx.imageEnsurePromise
}

export async function buildImage(ctx: ContainerManagerState): Promise<void> {
  const dockerfilePath = process.env.DOCKERFILE_PATH || './docker'
  const stream = await ctx.docker.buildImage(
    { context: dockerfilePath, src: ['Dockerfile.level'] },
    { t: `${ctx.imageName}:latest` },
  )

  await new Promise<void>((resolve, reject) => {
    stream.on('data', (data: Buffer) => console.log(data.toString()))
    stream.on('end', resolve)
    stream.on('error', reject)
  })
}

export async function createBaseContainer(
  ctx: ContainerManagerState,
  containerName: string,
): Promise<Docker.Container> {
  const container = await ctx.docker.createContainer({
    name: containerName,
    Image: `${ctx.imageName}:latest`,
    Tty: true,
    OpenStdin: true,
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    User: 'root',
    WorkingDir: '/home/player',
    Env: ['TERM=xterm-256color', 'HOME=/home/player'],
    HostConfig: {
      AutoRemove: true,
      Memory: 128 * 1024 * 1024,
      NanoCpus: 500_000_000,
    },
  })

  await container.start()
  if (!(await isContainerRunning(container))) {
    throw new Error(`Container failed to stay running: ${containerName}`)
  }
  return container
}

export async function acquireContainer(
  ctx: ContainerManagerState,
  containerName: string,
  refillPool: () => void,
): Promise<Docker.Container> {
  await ensureImageExists(ctx)

  while (ctx.pool.length > 0) {
    const container = ctx.pool.shift()!
    if (await isContainerRunning(container)) {
      refillPool()
      return container
    }
    await stopContainer(container).catch(() => {})
  }

  return createBaseContainer(ctx, containerName)
}

export async function stopContainerById(
  ctx: ContainerManagerState,
  containerId: string,
): Promise<void> {
  await stopContainer(ctx.docker.getContainer(containerId))
}

export async function stopContainer(container: Docker.Container): Promise<void> {
  await container.stop({ t: 2 })
}

export async function isContainerRunning(container: Docker.Container): Promise<boolean> {
  try {
    const info = await container.inspect()
    return Boolean(info.State?.Running)
  } catch {
    return false
  }
}
