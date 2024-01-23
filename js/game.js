// 对话框
var windowDialogEl = document.querySelector('#window-dialog')
// 主机名
var hostEl = document.querySelector('#host')
// 端口号
var portEl = document.querySelector('#port')
// 昵称
var nameEl = document.querySelector('#name')
// 连接el
var connectionEl = document.querySelector('#connection')
// 关闭el
var closeEl = document.querySelector('#close')
// 用户列表
var userListEl = document.querySelector('#user-list')
// 悔棋
var backChessEl = document.querySelector('#back-chess')
// 认输
var whiteFlagEl = document.querySelector('#white-flag')

// 聊天对话框
const messageContentEl = document.querySelector('#message-content ul')

// 发送按钮
const sendEl = document.querySelector('#send')
// 发送输入框
const sendInputEl = document.querySelector('#send-input')

/**
 * 游戏对象
 */
class Game {
  constructor() {
    // 用于存放所有事件，以及触发方法
    this.eventMap = new Map([
      ['challengeEvent', this.challengeEventFun.bind(this)],
      ['takeChallengeEvent', this.takeChallengeEventFun.bind(this)],
      ['rejectChallengeEvent', this.rejectChallengeEventFun.bind(this)],
      ['busyEvent', this.busyEventFun.bind(this)],
      ['moveEvent', this.moveEventFun.bind(this)],
      ['giveUpEvent', this.giveUpEventFun.bind(this)],
      ['messageEvent', this.messageEventFun.bind(this)],
      ['isfaceEvent', this.isfaceEventFun.bind(this)],
      ['pullBackEvent', this.pullBackEventFun.bind(this)],
      ['rejectPullBackEvent', this.rejectPullBackEventFun.bind(this)],
      ['resolvePullBackEvent', this.resolvePullBackEventFun.bind(this)],
      ['closeConnectionEvent', this.closeConnectionEventFun.bind(this)]
    ])

    // 初始化事件
    this.initEvent()
  }

  /**
   * 开始游戏
   */
  start() {
    this.chessBorder = new ChessBorder(60)
    this.client = null // 客户端对象
  }

  /**
   * 初始化事件
   */
  initEvent() {
    // 连接
    let connectionFun = this.connectionServer.bind(this)
    connectionEl.addEventListener('click', connectionFun)
    // 断开连接
    closeEl.disabled = true
    closeEl.addEventListener('click', () => {
      if (this.client) {
        this.client.webSocket.close()
        this.chessBorder.setClient(null)
      }
    })
    // 用户列表
    userListEl.disabled = true
    let showUserListFun = this.showUserList.bind(this)
    userListEl.addEventListener('click', showUserListFun)

    // 监听自定义事件
    for (let key of this.eventMap.keys()) {
      document.addEventListener(key, this.eventMap.get(key)) // 发起挑战
    }

    backChessEl.disabled = true
    whiteFlagEl.disabled = true
    sendEl.disabled = true

    backChessEl.addEventListener('click', () => {
      // 请求悔棋
      let message = {from: this.client.name, to: this.chessBorder.challenger, message: null, type: 10}
      // 通过webSocket向服务器推送
      this.client.webSocket.send(JSON.stringify(message))
      showWindow({content: '已发送悔棋请求，请等待回复'})
    })
    whiteFlagEl.addEventListener('click', () => {
      // 主动认输
      let message = {from: this.client.name, to: this.chessBorder.challenger, message: null, type: 6}
      // 通过webSocket向服务器推送
      this.client.webSocket.send(JSON.stringify(message))
    })

    // 发送聊天信息
    sendInputEl.addEventListener('keyup', e => {
      if (e.keyCode === 13) {
        sendEl.click()
      }
    })
    sendEl.addEventListener('click', () => {
      let value = sendInputEl.value.trim()
      let message = {from: this.client.name, to: this.chessBorder.challenger, message: value, type: 8}
      // 通过webSocket向服务器推送
      this.client.webSocket.send(JSON.stringify(message))
      sendInputEl.value = ''
      message.createTime = new Date().getTime()
      this.messageEventFun({detail: message})
    })
  }

  /**
   * 连接服务器
   */
  connectionServer() {
    // 检测名称是否已被使用
    let name = nameEl.value
    let host = hostEl.value
    let port = portEl.value
    let serverUrl = 'http://' + host + ':' + port
    fetch(serverUrl + '/web/' + name)
      .then(response => response.json())
      .then(res => {
        if (!res) {
          this.client = new Client(hostEl.value, portEl.value, nameEl.value)
          this.chessBorder.setClient(this.client)
        } else {
          // 名称已被使用
          showWindow({title: '提示', content: '该昵称已被使用'})
        }
      })
      .catch(() => showWindow({title: '提示', content: '服务器连接失败'}))
  }

  /**
   * 显示用户列表
   */
  showUserList() {
    let serverUrl = 'http://' + hostEl.value + ':' + portEl.value
    // 请求用户列表
    fetch(serverUrl + '/web/userList/' + this.client.name)
      .then(response => response.json())
      .then(res => {
        // for (let i = 0; i < 50; i++) {
        //   res.push('playCopy' + i)
        // }
        const newUl = createUserList(res)
        if (!(typeof newUl === 'string')) {
          let liList = newUl.querySelectorAll('li')
          liList && liList.forEach(item => {
            let name = item.querySelector('span')
            item.querySelector('button').addEventListener('click', () => {
              // 发起挑战
              let message = {from: this.client.name, to: name.innerHTML, message: null, type: 1}
              // 通过webSocket向服务器推送
              this.client.webSocket.send(JSON.stringify(message))
              showWindow({content: '已发出挑战信息，请等待回复'})
            })
          })
        }
        showWindow({title: '在线列表', content: newUl})
      })
  }

  /**
   * 发起挑战事件触发
   */
  challengeEventFun({detail}) {
    let message = {from: this.client.name, to: detail.from, message: null}
    // 如果处于忙线状态
    if (this.chessBorder.start && this.chessBorder.challenger) {
      message.type = 4
      // 通过webSocket向服务器推送
      setTimeout(() => {
        this.client.webSocket.send(JSON.stringify(message))
      }, 2000)
      return
    }
    // 创建拒绝和接收两个按钮
    let cancelFun = () => {
      message.type = 3
      // 通过webSocket向服务器推送
      this.client.webSocket.send(JSON.stringify(message))
    }
    const cancelEl = createButton({text: '拒绝', className: 'cancel', callBack: cancelFun.bind(this)})
    let confirmCallBack = () => {
      message.type = 2
      // 通过webSocket向服务器推送
      this.client.webSocket.send(JSON.stringify(message))
      // 开始挑战
      this.chessBorder.startChallenge(detail.from, false)
      sendEl.disabled = false
    }
    const confirmEl = createButton({text: '接受', className: 'confirm', callBack: confirmCallBack.bind(this)})
    showWindow({content: detail.message, cancelButton: cancelEl, confirmButton: confirmEl})
  }

  /**
   * 接收挑战事件触发
   */
  takeChallengeEventFun({detail}) {
    showWindow({content: detail.message})
    // 开始挑战
    this.chessBorder.startChallenge(detail.from, true)
    sendEl.disabled = false
  }

  /**
   * 拒绝挑战事件触发
   */
  rejectChallengeEventFun({detail}) {
    showWindow({content: detail.message})
  }

  /**
   * 挑战者忙事件触发
   */
  busyEventFun({detail}) {
    // 改变this指向
    let closeCallback = this.showUserList.bind(this)
    showWindow({content: detail.message, closeCallback})
  }

  /**
   * 走棋事件触发
   */
  moveEventFun({detail}) {
    // 获取走棋的数据
    let {startX, startY, endX, endY, currentPower} = JSON.parse(detail.message)
    // 计算走棋后的数据
    let data = {
      startX: 8 - startX,
      startY: 9 - startY,
      endX: 8 - endX,
      endY: 9 - endY,
      currentPower
    }
    // 挑战者走棋
    this.chessBorder.challengeMove(data)
  }

  /**
   * 认输事件触发
   */
  giveUpEventFun({detail}) {
    showWindow({content: detail.message})
  }

  /**
   * 消息事件触发
   */
  messageEventFun({detail}) {
    // 创建聊天信息
    let li = createMessage(detail)
    messageContentEl.appendChild(li)
    // 让滚动条自动滚动到最底部
    messageContentEl.scrollTop = messageContentEl.scrollHeight
  }

  /**
   * 面將事件触发
   */
  isfaceEventFun({detail}) {

  }

  /**
   * 请求悔棋事件触发
   */
  pullBackEventFun({detail}) {
    // 拒绝
    let message = {from: this.client.name, to: detail.from, message: null}
    const cancelFun = () => {
      message.type = 11
      // 向webSocket服务器推送数据
      this.client.webSocket.send(JSON.stringify(message))
    }
    const cancelEl = createButton({text: '拒绝', className: 'cancel', callBack: cancelFun.bind(this)})
    // 同意
    let confirmFun = () => {
      message.type = 12
      // 向webSocket服务器推送数据
      this.client.webSocket.send(JSON.stringify(message))
      // 悔棋
      this.chessBorder.backChess()
    }
    const confirmEl = createButton({text: '同意', className: 'confirm', callBack: confirmFun.bind(this)})
    showWindow({content: detail.message, cancelButton: cancelEl, confirmButton: confirmEl})
  }

  /**
   * 拒绝悔棋事件触发
   */
  rejectPullBackEventFun({detail}) {
    showWindow({content: detail.message})
  }

  /**
   * 同意悔棋事件触发
   */
  resolvePullBackEventFun({detail}) {
    this.chessBorder.backChess()
    backChessEl.disabled = true
  }

  /**
   * 断开连接
   */
  closeConnectionEventFun(e) {
    this.messageEventFun(e)
    if (this.chessBorder.start && this.chessBorder.challenger === e.detail.to) {
      showWindow({content: e.detail.message})
      this.chessBorder.challenger = null
      this.chessBorder.start = false
    }
  }
}

/**
 * 创建用户列表元素
 */
function createUserList(list) {
  let newUl = document.createElement('ul')
  newUl.className = 'user-list'
  for (let user of list) {
    const newLi = document.createElement('li')
    newLi.innerHTML = `
            <span>${user}</span>
            <span class="tips">一级棋手</span>
            <button class="button">发起PK</button>
    `
    newUl.appendChild(newLi)
  }
  if (list.length === 0) {
    newUl = '数据为空'
  }
  return newUl
}

/**
 * 创建聊天数据
 */
function createMessage(data) {
  let newLi = document.createElement('li')
  newLi.innerHTML = `
              <div class="top">
                <span>${data.from}</span><span>${parseDate(data.createTime)}</span>
              </div>
              <div class="con">${data.message}</div>`
  return newLi
}

/**
 * 创建按钮元素
 */
function createButton(payload) {
  let {text, className, callBack} = payload
  const buttonEl = document.createElement('button')
  buttonEl.className = 'button'
  buttonEl.classList.add(className)
  buttonEl.innerHTML = text
  buttonEl.addEventListener('click', () => {
    if (callBack) {
      callBack()
    }
    // 关闭对话框
    closeWindow.call(windowDialogEl)
  })
  return buttonEl
}

/**
 * 解析日期
 */
function parseDate(time) {
  time = new Date(time)
  return time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate() + ' ' + time.getHours() + ':' + time.getMinutes()
}
