import type { ValidationRule } from '../types.js'

export const chapter4Rules: Record<number, ValidationRule> = {
  21: { type: 'directory_exists', expected: '/home/player/my-app/dist' },
  22: { type: 'output_contains', expected: 'index.html' },
  23: { type: 'file_exists', expected: '/var/www/html/index.html' },
  24: { type: 'output_contains', expected: 'html' },
  25: { type: 'file_exists', expected: '/etc/nginx/http.d/myapp.conf' },
  26: { type: 'output_contains', expected: 'syntax is ok' },
  27: { type: 'nginx_running', expected: 'nginx: master' },
  28: { type: 'output_contains', expected: '<html' },
  29: { type: 'output_contains', expected: 'GET' },
  30: { type: 'output_contains', expected: 'ok' },
}
