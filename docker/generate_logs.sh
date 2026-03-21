#!/bin/sh
# Generate log files for Chapter 3: Incident Response levels
set -e

mkdir -p /var/log/nginx /var/log/app

ACCESS_LOG="/var/log/nginx/access.log"
APP_LOG="/var/log/app/app.log"
DATE="21/Mar/2024"
ATTACK_IP="10.66.6.6"

# Use awk for fast log generation
# Numbers are precise for level validation:
#   500 errors total: 47 (24 at 02:15 + 23 at 02:17)
#   500 errors in 02:17: 23
#   ATTACK_IP total: 300 (118 at 01:xx + 182 at 02:17)
#   ATTACK_IP in 02:17: 182
#   /var/log/nginx will be the largest directory under /var/log
awk -v date="$DATE" -v attack="$ATTACK_IP" 'BEGIN {
  # 1500 lines: normal traffic 00:xx, diverse IPs (200)
  for (i = 1; i <= 1500; i++) {
    ip = "192.168.1." (i % 50 + 1)
    printf "%s - - [%s:00:%02d:%02d +0800] \"GET /api/products HTTP/1.1\" 200 2048 \"-\" \"Mozilla/5.0\"\n", ip, date, i%60, i%60
  }
  # 1000 lines: normal traffic 01:xx
  for (i = 1; i <= 1000; i++) {
    ip = "172.16.0." (i % 30 + 1)
    printf "%s - - [%s:01:%02d:%02d +0800] \"GET /api/users HTTP/1.1\" 200 2048 \"-\" \"Mozilla/5.0\"\n", ip, date, i%60, i%60
  }
  # 118 lines: attack IP normal traffic at 01:xx
  for (i = 1; i <= 118; i++) {
    printf "%s - - [%s:01:%02d:%02d +0800] \"GET /api/login HTTP/1.1\" 200 2048 \"-\" \"python-requests/2.28\"\n", attack, date, i%60, i%60
  }
  # 24 lines: 500 errors at 02:15 (NOT in 02:17 window)
  for (i = 1; i <= 24; i++) {
    printf "192.168.1.200 - - [%s:02:15:%02d +0800] \"POST /api/checkout HTTP/1.1\" 500 512 \"-\" \"Mozilla/5.0\"\n", date, i%60
  }
  # 23 lines: 500 errors at 02:17 (in alert window)
  for (i = 1; i <= 23; i++) {
    printf "10.0.0.100 - - [%s:02:17:%02d +0800] \"POST /api/checkout HTTP/1.1\" 500 512 \"-\" \"Mozilla/5.0\"\n", date, i%60
  }
  # 182 lines: attack IP at 02:17 (TOP IP in alert window)
  for (i = 1; i <= 182; i++) {
    printf "%s - - [%s:02:17:%02d +0800] \"GET /api/login HTTP/1.1\" 200 2048 \"-\" \"python-requests/2.28\"\n", attack, date, i%60
  }
  # 50 lines: other IPs at 02:17 (less than attack IP)
  for (i = 1; i <= 50; i++) {
    ip = "172.16.0." (i % 20 + 1)
    printf "%s - - [%s:02:17:%02d +0800] \"GET /api/products HTTP/1.1\" 200 2048 \"-\" \"Mozilla/5.0\"\n", ip, date, i%60
  }
  # 500 lines: tail traffic 03-04:xx
  for (i = 1; i <= 500; i++) {
    ip = "10.0.0." (i % 100 + 1)
    printf "%s - - [%s:0%d:%02d:%02d +0800] \"GET /static/js/app.js HTTP/1.1\" 200 4096 \"-\" \"Mozilla/5.0\"\n", ip, date, 3+(i%2), i%60, i%60
  }
}' > "$ACCESS_LOG"

# Generate app.log: 312 ERROR + 500 INFO + 200 WARN
awk 'BEGIN {
  for (i = 1; i <= 312; i++) {
    printf "[2024-03-21 02:%02d:%02d] ERROR Database connection timeout after 30s (attempt %d)\n", i%60, i%60, i
  }
  for (i = 1; i <= 500; i++) {
    printf "[2024-03-21 01:%02d:%02d] INFO  Request processed: GET /api/products 200 OK (%.1fms)\n", i%60, i%60, 10+(i%90)*1.0
  }
  for (i = 1; i <= 200; i++) {
    printf "[2024-03-21 03:%02d:%02d] WARN  Memory usage high: %d%% (threshold: 80%%)\n", i%60, i%60, 81+(i%14)
  }
}' > "$APP_LOG"

chown -R player:player /var/log/nginx /var/log/app
chmod -R 755 /var/log/nginx /var/log/app

echo "=== Log generation complete ==="
echo "  access.log:   $(wc -l < $ACCESS_LOG) lines"
echo "  app.log:      $(wc -l < $APP_LOG) lines"
echo "  500 total:    $(grep -c ' 500 ' $ACCESS_LOG)"
echo "  500 @ 02:17:  $(grep '02:17' $ACCESS_LOG | grep -c ' 500 ')"
echo "  $ATTACK_IP total: $(grep -c "^$ATTACK_IP" $ACCESS_LOG)"
echo "  $ATTACK_IP 02:17: $(grep "^$ATTACK_IP" $ACCESS_LOG | grep -c '02:17')"
