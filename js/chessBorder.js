const wrapEl = document.querySelector('#wrap')
// 获取棋盘元素
const chessBorderEl = document.querySelector('#chess_border')
// 获取棋子内容元素
const chessContentEl = chessBorderEl.querySelector('.content')
// 获取线条容器
const lineContainerEl = chessBorderEl.querySelector('.line-container')
// 悔棋
var backChessEl = document.querySelector('#back-chess')
// 认输
var whiteFlagEl = document.querySelector('#white-flag')

/**
 * 棋盘类
 */
class ChessBorder {

  /**
   * 棋盘构造器
   * @param width，棋盘两线之间的距离
   */
  constructor(width) {
    this.start = false // 状态
    this.challenger = null // 挑战者
    this.power = -1 // 表示我方棋子颜色
    this.width = width
    this.chessList = [] // 用于存放所有棋子
    this.focus = false // 当前是否有棋子选中
    this.startX = -1 // 开始坐标
    this.startY = -1
    this.endX = -1  // 结束坐标
    this.endY = -1
    this.currentPower = 1 // 轮到哪方走棋，1 -> 红方，0 -> 黑方
    this.lastStep = [] // 保存每一步的走棋步骤
    this.rule = new Rule(this.chessList) // 规则类的声明
    this.client = null // 客户端对象

    // 初始化容器
    this.initContainer()

    // 初始化棋子
    this.initChess()

    // 初始化棋子事件
    this.initEvent()
  }

  /**
   * 初始化棋子事件
   */
  initEvent() {
    // 给棋盘绑定鼠标点击事件
    let chessFun = this.chessBorderClick.bind(this)
    chessBorderEl.addEventListener('mousedown', chessFun)
  }

  /**
   * 棋盘点击
   */
  chessBorderClick(e) {
    if (e.button === 2 || !this.start) {
      return
    }
    // 还未轮到自己走棋
    if (this.currentPower !== this.power) {
      return showWindow({content: '还未轮到您走棋'})
    }
    let pos = this.getPos(e)
    if (!pos.hasOwnProperty('x') || !pos.hasOwnProperty('y')) { // 不存在棋子
      return
    }
    let x = pos.x
    let y = pos.y
    if (!this.focus) {
      // 选中棋子
      this.noFocus(x, y)
    } else {
      let chess = this.chessList[y][x]
      if (chess) {
        // 如果二次选中为我方棋子，则切换选择，反之，吃子操作
        if (chess.power === this.power) { // 切换选择
          this.noFocus(x, y)
        } else {
          this.endX = x
          this.endY = y
          // TODO 判断是否满足走棋规则
          // 获取该棋子名称
          let name = this.chessList[this.startY][this.startX].name
          if (this.rule.canMove(this.startX, this.startY, this.endX, this.endY, name)) {
            // TODO 判断是否被将军
            // 判断是否面將
            if (!this.rule.faceWill(this.startX, this.startY, this.endX, this.endY)) {
              // 吃子操作
              this.kill(this.startX, this.startY, this.endX, this.endY)
            }
          } else {
          }
          // 恢复状态
          this.restoreState()
        }
      } else {
        // 记录坐标
        this.endX = x
        this.endY = y
        let name = this.chessList[this.startY][this.startX].name

        // TODO 判断是否满足走棋规则
        if (this.rule.canMove(this.startX, this.startY, this.endX, this.endY, name)) {
          // TODO 判断是否被将军
          // 判断是否面將
          if (!this.rule.faceWill(this.startX, this.startY, this.endX, this.endY)) {
            // 棋子走棋
            this.move(this.startX, this.startY, this.endX, this.endY)
          }
        } else {
        }
        // 恢复状态
        this.restoreState()
      }
    }
  }

  /**
   * 吃子操作
   */
  kill(startX, startY, endX, endY) {
    // 删除元素
    this.chessList[endY][endX].el.style.display = 'none'
    // chessContentEl.removeChild(this.chessList[endY][endX].el)
    // 进行移动
    this.move(startX, startY, endX, endY)
  }

  /**
   * 走棋
   */
  move(startX, startY, endX, endY) {
    // 这里进行了移动
    this.chessMove(startX, startY, endX, endY)
    // 到敌方走棋
    this.currentPower = this.currentPower === 1 ? 0 : 1
    // 向服务器发送走棋信息
    this.sendMove()
    backChessEl.disabled = false
  }

  /**
   * 挑战者走棋
   */
  challengeMove(data) {
    let {startX, startY, endX, endY, currentPower} = data
    if (this.chessList[endY][endX]) {
      // 挑战者吃子，这里进行假删除
      this.chessList[endY][endX].el.style.display = 'none'
      // chessContentEl.removeChild(this.chessList[endY][endX].el)
    }
    this.chessMove(startX, startY, endX, endY)
    this.currentPower = currentPower
    backChessEl.disabled = true
  }

  /**
   * 棋子移动
   */
  chessMove(startX, startY, endX, endY) {
    let startChess = this.chessList[startY][startX]
    let endChess = this.chessList[endY][endX]
    // 这里进行了移动
    this.chessList[endY][endX] = this.chessList[startY][startX]
    this.chessList[endY][endX].x = endX
    this.chessList[endY][endX].y = endY
    this.chessList[startY][startX] = null // 逻辑操作
    this.rePosition() // 重新定位
    // 记录上一步步骤
    let lastStep = this.lastStep[this.lastStep.length - 1] || null
    if (lastStep && lastStep.endChess) {
      // 删除元素
      chessContentEl.removeChild(lastStep.endChess.el)
    }
    this.lastStep.push({startX, startY, endX, endY, startChess, endChess})
  }

  /**
   * 发送给挑战者走棋信息
   */
  sendMove() {
    let message = {
      startX: this.startX,
      startY: this.startY,
      endX: this.endX,
      endY: this.endY,
      currentPower: this.currentPower
    }
    let payload = {from: this.client.name, to: this.challenger, message, type: 5}
    this.client.webSocket.send(JSON.stringify(payload))
  }

  /**
   * 悔棋
   */
  backChess() {
    let {startX, startY, endX, endY, startChess, endChess} = this.lastStep.pop()
    startChess.x = startX
    startChess.y = startY
    // 这里进行了移动
    this.chessList[startY][startX] = startChess
    if (endChess) {
      endChess.el.style.display = 'flex'
    }
    this.chessList[endY][endX] = endChess // 逻辑操作
    this.rePosition() // 重新定位
    // 到敌方走棋
    this.currentPower = this.currentPower === 1 ? 0 : 1
  }

  /**
   * 选中棋子状态
   */
  noFocus(x, y) {
    let chess = this.chessList[y][x]
    if (chess && chess.power === this.power) { // 如果此位置存在棋子 && 为我方棋子
      for (let i = 0; i < this.chessList.length; i++) {
        for (let j = 0; j < this.chessList[i].length; j++) {
          if (this.chessList[i][j]) {
            this.chessList[i][j].el.classList.remove('active') // 删除选中状态
          }
        }
      }
      chess.el.classList.add('active')
      this.focus = true
      // 记录坐标
      this.startX = x
      this.startY = y
    }
  }

  /**
   * 返回对应的棋子坐标
   */
  getPos(e) {
    let o = {}
    // 获取left，top坐标
    let left = Math.floor(e.clientX - e.currentTarget.getBoundingClientRect().left)
    let top = Math.floor(e.clientY - e.currentTarget.getBoundingClientRect().top)
    // 获得x坐标
    if (Math.floor(left % this.width) >= 5 && Math.floor(left % this.width) <= 55) {
      o.x = Math.floor(left / this.width)
    }
    // 获得y坐标
    if (Math.floor(top % this.width) >= 5 && Math.floor(top % this.width) <= 55) {
      o.y = Math.floor(top / this.width)
    }
    return o
  }

  // 重新定位
  rePosition() {
    for (let i = 0; i < this.chessList.length; i++) {
      for (let j = 0; j < this.chessList[i].length; j++) {
        if (this.chessList[i][j]) {
          let {x, y} = this.chessList[i][j]
          this.chessList[i][j].el.style.left = (x * this.width + this.width / 2) + 'px'
          this.chessList[i][j].el.style.top = (y * this.width + this.width / 2) + 'px'
          this.chessList[i][j].el.classList.remove('active')
        }
      }
    }
  }

  /**
   * 恢复状态
   */
  restoreState() {
    if (this.chessList[this.startY][this.startX]) {
      this.chessList[this.startY][this.startX].el.classList.remove('active')
    }
    this.startX = -1
    this.startY = -1
    this.endX = -1
    this.endY = -1
    this.focus = false
  }

  /**
   * 初始化棋子
   */
  initChess() {
    chessContentEl.innerHTML = ''
    for (let i = 0; i < 10; i++) {
      this.chessList[i] = []
      for (let j = 0; j < 9; j++) {
        this.chessList[i][j] = null // 初始为空
      }
    }
    for (let chess of this.getChessData()) {
      let {x, y} = chess
      this.chessList[y][x] = this.chessLocation(chess)
    }
  }

  /** 棋子定位 */
  chessLocation(chess) {
    const newChess = new Chess(chess)
    let {x, y, name, width, power} = chess
    const newEl = document.createElement('div')
    newEl.className = 'chess'
    newEl.style.width = width + 'px'
    newEl.style.height = width + 'px'
    newEl.style.left = (x * this.width + this.width / 2) + 'px'
    newEl.style.top = (y * this.width + this.width / 2) + 'px'
    newEl.innerText = name
    if (power) {
      newEl.style.color = 'red'
      newEl.classList.add('power')
    }
    newChess.el = newEl
    chessContentEl.appendChild(newEl)
    return newChess
  }

  /**
   * 初始化容器
   */
  initContainer() {
    let width = this.width * 9
    let height = this.width * 10
    chessBorderEl.style.width = width + 'px'
    chessBorderEl.style.height = height + 'px'
    // wrapEl.style.width = width + 'px'
    // wrapEl.style.height = height + 'px'

    lineContainerEl.innerHTML = ''

    // 画横线
    width = width - this.width
    for (let i = 0; i < 10; i++) {
      this.createLine({width, left: this.width / 2, top: (i * this.width) + (this.width / 2), className: 'line'})
    }
    this.createLine({width: width + this.width, left: this.width / 2, top: this.width / 2, className: 'v-line'})
    this.createLine({width: width + this.width, left: width + this.width / 2, top: this.width / 2, className: 'v-line'})

    // 画竖线
    width = width / 2
    for (let i = 1; i < 8; i++) {
      this.createLine({width, left: (this.width / 2) + (i * this.width), top: this.width / 2, className: 'v-line'})
      this.createLine({width, left: (this.width / 2) + (i * this.width), top: width + this.width + (this.width / 2), className: 'v-line'})
    }

    // 画斜线
    width = 170
    this.createLine({width, left: (3 * this.width) + (this.width / 2), top: this.width / 2, className: 'o-line'})
    const oLine2 = this.createLine({width, left: (5 * this.width) + (this.width / 2), top: this.width / 2, className: 'o-line'})
    oLine2.style.transform = 'rotate(135deg)'

    this.createLine({width, left: (3 * this.width) + (this.width / 2), top: this.width / 2 + this.width * 7, className: 'o-line'})
    const oLine4 = this.createLine({width, left: (5 * this.width) + (this.width / 2), top: this.width / 2 + this.width * 7, className: 'o-line'})
    oLine4.style.transform = 'rotate(135deg)'
  }

  /**
   * 创建线
   */
  createLine({width, left, top, className}) {
    const newDiv = document.createElement('div')
    newDiv.className = className
    newDiv.style.width = width + 'px'
    newDiv.style.left = left + 'px'
    newDiv.style.top = top + 'px'
    lineContainerEl.appendChild(newDiv)
    return newDiv
  }

  /**
   * 获取所有棋子数据
   */
  getChessData() {
    // 游戏已经开始 and 接收方
    if (this.start && this.power !== this.currentPower) {
      // 需要旋转棋盘
      return this.rotateChessBorder()
    }
    return CHESS_DATA
  }

  /**
   * 开始挑战
   */
  startChallenge(challenge, isInit) {
    this.start = true
    this.challenger = challenge
    this.power = isInit ? 1 : 0
    this.currentPower = 1 // 红旗先走
    this.initChess()

    whiteFlagEl.disabled = false
  }

  /**
   * 设置客户端对象
   */
  setClient(client) {
    if (client) {
      this.client = client
    } else {
      this.start = false
    }
  }

  /**
   * 旋转棋盘
   */
  rotateChessBorder() {
    for (let i = 0, j = CHESS_DATA.length / 2; i < CHESS_DATA.length / 2 && j < CHESS_DATA.length; i ++, j ++) {
      let chess = Object.assign({}, CHESS_DATA[j])
      CHESS_DATA[j].x = CHESS_DATA[i].x
      CHESS_DATA[j].y = CHESS_DATA[i].y
      CHESS_DATA[i].x = chess.x
      CHESS_DATA[i].y = chess.y
    }
    return CHESS_DATA
  }
}
