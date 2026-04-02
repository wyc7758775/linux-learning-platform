import type { Level } from "./types";

// Chapter 7: 网络排查 (Level 51-60)
export const chapter7Levels: Level[] = [
  {
    id: 51,
    chapter: 7,
    title: "网卡在哪",
    description: "新服务器到手！运维第一步：看看网卡配置和 IP 地址",
    hint: "用 ip addr 查看所有网络接口和 IP 地址信息",
    command: "ip addr",
    objective: "使用 ip addr 查看网络接口和 IP 地址",
    knowledgeCards: [
      {
        command: "ip addr",
        description:
          "显示所有网络接口的 IP 地址、MAC 地址、状态等信息。简写 ip a",
      },
      {
        command: "ifconfig",
        description:
          "老式网络配置命令（net-tools），功能类似 ip addr。新系统推荐用 ip 命令",
      },
      {
        command: "网络接口",
        description:
          "lo 是回环接口（127.0.0.1），eth0 是第一块网卡。每个接口可以有 IPv4（inet）和 IPv6（inet6）地址",
      },
    ],
    validation: { type: "output_contains", expected: "inet" },
    completed: false,
  },
  {
    id: 52,
    chapter: 7,
    title: "谁在监听",
    description:
      "同事说 Nginx 已经启动了，但页面访问不了。检查一下端口是否真的在监听",
    hint: "用 ss -tlnp 查看所有正在监听的 TCP 端口，看看 80 端口是否在列表中",
    command: "ss -tlnp",
    objective: "使用 ss -tlnp 确认 80 端口是否在监听",
    knowledgeCards: [
      {
        command: "ss -tlnp",
        description:
          "显示所有监听中的 TCP 端口。t=TCP，l=listening，n=数字端口，p=显示进程",
      },
      {
        command: "netstat -tlnp",
        description: "老式端口查看命令，功能类似 ss。新系统推荐用 ss（更快）",
      },
      {
        command: "端口状态",
        description:
          "LISTEN 表示服务在等待连接，ESTABLISHED 表示已建立连接。:80 表示监听 80 端口",
      },
    ],
    validation: { type: "output_contains", expected: ":80" },
    completed: false,
  },
  {
    id: 53,
    chapter: 7,
    title: "本地服务测试",
    description: "端口在监听了！现在用 curl 确认 Nginx 是否正常返回 HTML 页面",
    hint: "用 curl localhost 发送 HTTP 请求，看看返回什么内容",
    command: "curl localhost",
    objective: "使用 curl 测试本地 HTTP 服务",
    knowledgeCards: [
      {
        command: "curl URL",
        description: "发送 HTTP 请求并输出响应内容。最基本的 Web 调试工具",
      },
      {
        command: "curl http://127.0.0.1",
        description: "等价于 curl localhost。127.0.0.1 是本机回环地址",
      },
      {
        command: "HTTP 响应",
        description:
          "正常响应包含 HTML 内容（以 <!DOCTYPE html> 或 <html> 开头），表示 Web 服务正常",
      },
    ],
    validation: { type: "output_contains", expected: "html" },
    completed: false,
  },
  {
    id: 54,
    chapter: 7,
    title: "响应头诊断",
    description:
      "页面行为异常，可能是缓存问题也可能是服务器配置错误。先看看 HTTP 响应头",
    hint: "用 curl -I localhost 只看响应头（HEAD 请求），重点看状态码和 Server 字段",
    command: "curl -I localhost",
    objective: "使用 curl -I 查看 HTTP 响应头和状态码",
    knowledgeCards: [
      {
        command: "curl -I URL",
        description:
          "发送 HEAD 请求，只返回响应头不返回 body。用于快速检查状态码和服务器信息",
      },
      {
        command: "HTTP 状态码",
        description:
          "200=成功，301/302=重定向，404=未找到，500=服务器错误。状态码是排查 HTTP 问题的第一线索",
      },
      {
        command: 'curl -w "%{http_code}"',
        description: "自定义输出格式，只打印 HTTP 状态码。适合脚本中使用",
      },
    ],
    validation: { type: "output_contains", expected: "200" },
    completed: false,
  },
  {
    id: 55,
    chapter: 7,
    title: "详细请求追踪",
    description:
      "API 调用有时超时有时正常。用 curl -v 看看完整的 HTTP 交互过程，包括 DNS 解析、连接建立、请求头和响应头",
    hint: "用 curl -v localhost 查看完整的请求/响应过程，* 开头的是连接信息，> 是请求头，< 是响应头",
    command: "curl -v localhost",
    objective: "使用 curl -v 查看完整 HTTP 请求响应过程",
    knowledgeCards: [
      {
        command: "curl -v URL",
        description:
          "verbose 模式，输出完整的 HTTP 交互过程。* 是连接信息，> 是请求头，< 是响应头",
      },
      {
        command: "curl -vvv URL",
        description: "更详细的调试输出，包含 SSL/TLS 握手细节",
      },
      {
        command: "排查思路",
        description:
          "先看 DNS 解析是否正常 → 再看 TCP 连接是否建立 → 再看 HTTP 状态码 → 最后看响应内容",
      },
    ],
    validation: { type: "output_contains", expected: "HTTP/" },
    completed: false,
  },
  {
    id: 56,
    chapter: 7,
    title: "DNS 解析排查",
    description: "用户反馈网站打不开！ping 也不通。先查一下 DNS 解析是否正常",
    hint: "用 nslookup localhost 查看域名解析结果，或者用 getent hosts localhost 查看 hosts 解析",
    command: "nslookup localhost",
    objective: "使用 DNS 查询工具排查域名解析问题",
    knowledgeCards: [
      {
        command: "nslookup 域名",
        description:
          "查询 DNS 解析记录，查看域名对应的 IP 地址。最常用的 DNS 诊断工具",
      },
      {
        command: "getent hosts 域名",
        description:
          "查询系统名称解析（包括 /etc/hosts 和 DNS），比 nslookup 更贴近实际解析结果",
      },
      {
        command: "DNS 排查流程",
        description:
          "1) 检查 /etc/hosts 是否有硬编码 2) 用 nslookup 查 DNS 3) 对比期望 IP 4) 检查 /etc/resolv.conf 的 DNS 服务器配置",
      },
    ],
    validation: { type: "output_contains", expected: "127.0.0.1" },
    completed: false,
  },
  {
    id: 57,
    chapter: 7,
    title: "端口连通性",
    description:
      "需要连接远程数据库，但不确定端口是否可达。用 nc 测试一下 TCP 连通性",
    hint: "用 nc -zv localhost 80 测试 80 端口是否可达。z=扫描模式不发送数据，v=详细输出",
    command: "nc -zv localhost 80",
    objective: "使用 nc 测试 TCP 端口连通性",
    knowledgeCards: [
      {
        command: "nc -zv HOST PORT",
        description:
          '测试 TCP 端口连通性。z=零 I/O 模式（只测连接不发数据），v=显示结果。成功输出 "succeeded"，失败输出 "refused"',
      },
      {
        command: "nc -zv HOST 1-1000",
        description: "端口范围扫描。可以快速发现目标主机上哪些端口开放",
      },
      {
        command: "连通性排查",
        description:
          "端口不通的常见原因：1) 服务没启动 2) 防火墙阻止 3) 监听在 127.0.0.1 而非 0.0.0.0 4) 网络不通",
      },
    ],
    validation: { type: "output_contains", expected: "succeeded" },
    completed: false,
  },
  {
    id: 58,
    chapter: 7,
    title: "路由走向",
    description: "两台机器之间网络不通。查看路由表，看看数据包会走哪条路",
    hint: "用 ip route 查看路由表，default 开头的是默认网关，也是出口路由",
    command: "ip route",
    objective: "使用 ip route 查看系统路由表",
    knowledgeCards: [
      {
        command: "ip route",
        description:
          "显示路由表。default via GATEWAY 是默认路由，所有不匹配的流量走网关",
      },
      {
        command: "route -n",
        description:
          "老式路由查看命令（net-tools），-n 用数字显示地址不解析域名",
      },
      {
        command: "路由排障",
        description:
          "1) 检查是否有 default 路由 2) 目标 IP 匹配哪条路由 3) via 后面的网关是否可达 4) dev 指定的网卡是否正常",
      },
    ],
    validation: { type: "output_contains", expected: "default" },
    completed: false,
  },
  {
    id: 59,
    chapter: 7,
    title: "连接数统计",
    description: "服务器响应越来越慢，怀疑是连接数太多。统计一下 TCP 连接状态",
    hint: "用 ss -s 查看连接统计摘要，重点关注 estab（已建立连接）的数量",
    command: "ss -s",
    objective: "使用 ss -s 统计 TCP 连接状态",
    knowledgeCards: [
      {
        command: "ss -s",
        description:
          "显示 socket 统计摘要。包括 TCP/UDP/RAW socket 数量和各状态连接数",
      },
      {
        command: "ss -tan",
        description:
          "显示所有 TCP 连接详情。t=TCP，a=all（包括 LISTEN），n=数字格式",
      },
      {
        command: "TCP 状态",
        description:
          "ESTAB=已建立，TIME-WAIT=等待关闭，CLOSE-WAIT=等待本地关闭。大量 TIME-WAIT 说明短连接过多",
      },
    ],
    validation: { type: "output_contains", expected: "TCP" },
    completed: false,
  },
  {
    id: 60,
    chapter: 7,
    title: "综合排查",
    description:
      "终极挑战！Web 服务不可用，用户反馈页面打不开。从网络接口 → 端口检查 → 启动服务 → 验证访问，完整排查并修复故障",
    hint: "先用 ss 检查端口 → 发现 80 没监听 → 启动 nginx → 用 curl 验证服务正常",
    command: "curl localhost",
    objective: "综合运用网络排查工具，完成从发现故障到修复的全流程",
    knowledgeCards: [
      {
        command: "排查方法论",
        description:
          "网络排查黄金法则：从底层到顶层。物理层 → 数据链路 → 网络（IP/路由）→ 传输（TCP/端口）→ 应用（HTTP/DNS）",
      },
      {
        command: "故障排查清单",
        description:
          "1) ip addr 查网卡 2) ip route 查路由 3) ss 查端口 4) nc 测连通 5) curl 测 HTTP 6) nslookup 查 DNS",
      },
      {
        command: 'curl -o /dev/null -s -w "%{http_code}"',
        description:
          "静默请求只输出状态码，适合监控脚本。可扩展输出 time_total、size_download 等指标",
      },
    ],
    validation: { type: "output_contains", expected: "html" },
    completed: false,
  },
];
