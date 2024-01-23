// 连接el
var connectionEl = document.querySelector('#connection')
// 关闭el
var closeEl = document.querySelector('#close')
// 用户列表
var userListEl = document.querySelector('#user-list')
// 主机名
var hostEl = document.querySelector('#host')
// 端口号
var portEl = document.querySelector('#port')
// 昵称
var nameEl = document.querySelector('#name')

/**
 * 客户端类
 */
class Client {
  constructor(host, port, name) {
    this.host = host
    this.port = port
    this.name = name
    if ('WebSocket' in window) {
      this.webSocket = new WebSocket(this.getUrl())
      // 初始化事件
      this.initEvent()
    } else {
      alert('Not support webSocket')
    }
  }

  /**
   * 初始化事件
   */
  initEvent() {
    // 窗口关闭时
    window.onbeforeunload = () => {
      this.webSocket.close()
    }

    // 初始化webSocket事件
    this.webSocket.onopen = this.onOpen.bind(this)
    this.webSocket.onmessage = this.onMessage.bind(this)
    this.webSocket.onclose = this.onClose.bind(this)
    this.webSocket.onerror = this.onError.bind(this)
  }

  /**
   * 连接成功时
   */
  onOpen(e) {
    connectionEl.disabled = true
    closeEl.disabled = false
    userListEl.disabled = false
    hostEl.disabled = true
    portEl.disabled = true
    nameEl.disabled = true

    showWindow({content: '服务器连接成功'})
  }

  /**
   * 接收到消息时
   */
  onMessage(e) {
    let data = JSON.parse(e.data)
    // 初始化自定义事件
    this[data.event] = new CustomEvent(data.event, {detail: data}) // 发起挑战事件
    // 事件触发
    document.dispatchEvent(this[data.event])
  }

  /**
   * 关闭时
   */
  onClose() {
    connectionEl.disabled = false
    closeEl.disabled = true
    userListEl.disabled = true
    hostEl.disabled = false
    portEl.disabled = false
    nameEl.disabled = false

    showWindow({content: '与服务器断开连接'})
  }

  /**
   * 发生错误时
   */
  onError() {
    alert('连接服务器失败')
  }

  getUrl() {
    return `ws://${this.host}:${this.port}/webSocket/${this.name}`
  }
}
