import type Docker from 'dockerode'

const LEVEL_SETUP_COMMANDS: Record<number, string[]> = {
  7: ['adduser -D alice'],
  9: ['adduser -D alice'],
  12: ['adduser -D alice'],
  13: ['/usr/local/bin/stress-worker > /dev/null 2>&1 &'],
  15: ['nc -l -p 8080 > /dev/null 2>&1 &'],
  21: ['mkdir -p /home/player/my-app/dist && echo "<!DOCTYPE html><html><head><title>My App</title></head><body><div id=\\"app\\"></div><script src=\\"/assets/index.js\\"></script></body></html>" > /home/player/my-app/dist/index.html && echo "console.log(\\"Hello Vue!\\")" > /home/player/my-app/dist/assets/index.js && chown -R player:player /home/player/my-app/dist'],
  22: ['mkdir -p /home/player/my-app/dist && echo "<!DOCTYPE html><html><head><title>My App</title></head><body><div id=\\"app\\"></div><script src=\\"/assets/index.js\\"></script></body></html>" > /home/player/my-app/dist/index.html && echo "console.log(\\"Hello Vue!\\")" > /home/player/my-app/dist/assets/index.js && chown -R player:player /home/player/my-app/dist'],
  23: ['mkdir -p /home/player/my-app/dist && echo "<!DOCTYPE html><html><head><title>My App</title></head><body><div id=\\"app\\"></div><script src=\\"/assets/index.js\\"></script></body></html>" > /home/player/my-app/dist/index.html && echo "console.log(\\"Hello Vue!\\")" > /home/player/my-app/dist/assets/index.js && chown -R player:player /home/player/my-app/dist'],
  24: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>My App</title></head><body><h1>Hello Nginx!</h1></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html && nginx'],
  25: ['chown -R player:player /etc/nginx/http.d'],
  27: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>My App</title></head><body><h1>Hello Nginx!</h1></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html'],
  28: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>My App</title></head><body><h1>Hello Nginx!</h1></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html'],
  29: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>My App</title></head><body><h1>Hello Nginx!</h1></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html'],
  30: ['rm -f /etc/nginx/http.d/default.conf && /usr/local/bin/mock-api > /dev/null 2>&1 & sleep 1 && echo "server { listen 80 default_server; location / { proxy_pass http://127.0.0.1:3000; } }" > /etc/nginx/http.d/myapp.conf'],
  34: ['chmod u+s /usr/bin/crontab'],
  35: ['chown -R player:player /etc/logrotate.d'],
  45: ['echo "important data" > /home/player/testfile.tmp && chown player:player /home/player/testfile.tmp'],
  52: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>Network Lab</title></head><body><h1>Welcome</h1><p>Server is running</p></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html && nginx'],
  53: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>Network Lab</title></head><body><h1>Welcome</h1><p>Server is running</p></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html && nginx'],
  54: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>Network Lab</title></head><body><h1>Welcome</h1><p>Server is running</p></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html && nginx'],
  55: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>Network Lab</title></head><body><h1>Welcome</h1><p>Server is running</p></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html && nginx'],
  57: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>Network Lab</title></head><body><h1>Welcome</h1><p>Server is running</p></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html && nginx'],
  59: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>Network Lab</title></head><body><h1>Welcome</h1><p>Server is running</p></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html && nginx'],
  60: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>Network Lab</title></head><body><h1>Welcome</h1><p>Server is running</p></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html'],
}

const LEVEL_PRESET_HISTORY: Record<number, string[]> = {
  5: ['ls', 'pwd', 'clear'],
}

export function getInitialCurrentDir(levelId: number): string {
  return levelId === 3 ? '/tmp' : '/home/player'
}

export function getPresetHistory(levelId: number): string[] {
  return [...(LEVEL_PRESET_HISTORY[levelId] || [])]
}

export async function runLevelSetup(
  container: Docker.Container,
  levelId: number,
): Promise<void> {
  const setupCommands = LEVEL_SETUP_COMMANDS[levelId]
  if (!setupCommands) return

  for (const command of setupCommands) {
    const exec = await container.exec({
      Cmd: ['/bin/sh', '-c', command],
      AttachStdout: true,
      AttachStderr: true,
      User: 'root',
    })
    const stream = await exec.start({ Detach: false })
    await new Promise<void>((resolve) => {
      stream.on('end', resolve)
      stream.on('error', resolve)
      stream.on('data', () => {})
    })
    console.log(`[Setup] Level ${levelId} setup: ${command}`)
  }
}
