/**
 * 规则类
 */
class Rule {
  constructor(chessList) {
    this.chessList = chessList // 棋子数组
    let x = -1
    let y = -1
  }

  /**
   * 判断是否可以移动
   */
  canMove(startX, startY, endX, endY, name) {
    let maxX = Math.max(startX, endX), maxY = Math.max(startY, endY)
    let minX = Math.min(startX, endX), minY = Math.min(startY, endY)
    let canMove = false
    if (name === '車') {
      canMove = this.ju(maxX, maxY, minX, minY)
    } else if (name === '馬') {
      canMove = this.ma(startX, startY, endX, endY)
    } else if (name === '相' || name === '象') {
      canMove = this.xiang1(maxX, maxY, minX, minY, endY)
    }
    else if (name === '象') {
      canMove = this.xiang2(maxX, maxY, minX, minY, endY)
    }
    else if (name === '仕' || name === '士') {
      canMove = this.shi(startX, startY, endX, endY)
    } else if (name === '將' || name === '帥') {
      canMove = this.jinag(startX, startY, endX, endY)
    } else if (name === '炮' || name === '砲') {
      canMove = this.pao(maxX, maxY, minX, minY, startX, startY, endX, endY)
    } else if (name === '兵' || name === '卒') {
      canMove = this.bing(startX, startY, endX, endY)
    } else if (name === '卒') {
      canMove = this.zu(startX, startY, endX, endY)
    }
    return canMove
  }
  /** 对車的处理方法 */
  ju(maxX, maxY, minX, minY) {
    if (maxY === minY) { // 同一条横线
      for (let i = minX + 1; i < maxX; i++) {
        // 如果中间有棋子
        if (this.chessList[maxY][i]) {
          return false
        }
      }
    } else if (maxX === minX) { // 同一条竖线
      for (let i = minY + 1; i < maxY; i++) {
        // 如果中间有棋子
        if (this.chessList[i][maxX]) {
          return false
        }
      }
    } else {
      return false
    }
    return true
  }
  /** 对馬的处理 */
  ma(startX, startY, endX, endY) {
    let a = Math.abs(endX - startX)
    let b = Math.abs(endY - startY)
    if (a === 1 && b === 2) { // 竖的日字
      // 判断马脚
      if (startY > endY) { // 下往上
        if (this.chessList[startY - 1][startX]) {
          return false
        }
      } else { // 上往下
        if (this.chessList[startY + 1][startX]) {
          return false
        }
      }
    } else if (b === 1 && a === 2) { // 横的日字
      // 判断马脚
      if (endX > startX) { // 左往右
        if (this.chessList[startY][startX + 1]) {
          return false
        }
      } else { // 右往左
        if (this.chessList[startY][startX - 1]) {
          return false
        }
      }
    } else {
      return false
    }
    return true
  }
  /** 对相的处理 */
  xiang1(maxX, maxY, minX, minY, endY) {
    // 对相的处d理
    let a = maxX - minX
    let b = maxY - minY
    if (a === 2 && b === 2) { // 为田字
      if (endY < 4) { // 过河了
        return false
      }
      if (this.chessList[(maxY + minY) / 2][(maxX + minX) / 2]) { // 如果田中间有棋子
        return false
      }
    } else {
      return false
    }
    return true
  }
  /** 对象的处理 */
  xiang2(maxX, maxY, minX, minY, endY) {
    // 对相的处d理
    let a = maxX - minX
    let b = maxY - minY
    if (a === 2 && b === 2) { // 为田字
      if (endY > 4) { // 过河了
        return false
      }
      if (this.chessList[(maxY + minY) / 2][(maxX + minX) / 2]) { // 如果田中间有棋子
        return false
      }
    } else {
      return false
    }
    return true
  }
  /** 对仕的处理 */
  shi(startX, startY, endX, endY) {
    let a = Math.abs(startX - endX);
    let b = Math.abs(startY - endY);
    if(a === 1 && b === 1) { // 如果是小斜线
      if(startY > 4) { // 如果是下方的仕
        if(endY < 7) {
          return false // 越界了
        }
      } else { // 如果是上方的仕
        if(endY > 2) {
          return false // 越界了
        }
      }
      // 如果左右越界了，也不可以走
      if(endX < 3 || endX > 5) {
        return false
      }
    } else {
      // 如果不是小斜线
      return false
    }
    return true
  }
  /** 对將的处理 */
  jinag(startX, startY, endX, endY) {
    let a = Math.abs(startX - endX);
    let b = Math.abs(startY - endY);
    if((a === 1 && b === 0) || (a === 0 && b === 1)) { // 如果走的是一小格
      if(startY > 4) { // 下方的將
        if(endY < 7) {
          return false; // 越界了
        }
      } else { // 上方的將
        if(endY > 2) {
          return false // 越界了
        }
      }
      if(endX < 3 || endX > 5) {
        return false // 左右越界了
      }
    } else {
      // 如果走的不是一格
      return false
    }
    return true
  }
  /** 对砲的处理 */
  pao(maxX, maxY, minX, minY, startX, startY, endX, endY) {
    let count = 0
    // 横线
    if (maxY === minY) {
      // 统计棋子数量
      for (let i = minX + 1; i < maxX; i++) {
        if (this.chessList[maxY][i]) {
          count ++
        }
      }
    }
    // 竖线
    else if(maxX === minX) {
      // 统计棋子数量
      for (let i = minY + 1; i < maxY; i++) {
        if (this.chessList[i][maxX]) {
          count ++
        }
      }
    } else { // 非横竖线
      return false
    }
    if (this.chessList[endY][endX]) { // 终点处有棋子
      if (count !== 1) {
        return false
      }
    } else {
      if (count > 0) {
        return false
      }
    }
    return true
  }
  /** 对兵的处理 */
  bing(startX, startY, endX, endY) {
    let a = Math.abs(startX - endX);
    let b = Math.abs(startY - endY);
    if (!((a === 1 && b === 0) || (a === 0 && b === 1))) { // 如果走的不是一格
      return false
    }
    if (startY > 4) { // 还没有过河
      if (startX !== endX || endY > startY) { // 必须向前走
        return false
      }
    } else {
      if (startY < endY) {
        return false
      }
    }
    return true
  }
  /** 对卒的处理 */
  zu(startX, startY, endX, endY) {
    let a = Math.abs(startX - endX);
    let b = Math.abs(startY - endY);
    if (!((a === 1 && b === 0) || (a === 0 && b === 1))) { // 如果走的不是一格
      return false
    }
    if (startY < 5) { // 还没有过河
      if (startX !== endX || endY < startY) { // 必须向前走
        return false
      }
    } else {
      if (startY > endY) {
        return false
      }
    }
    return true
  }

  /** 判断是否面將 */
  faceWill(startX, startY, endX, endY) {
    if (startX === endX) { // 竖着走，永远不会面將
      return false
    }
    let x1 = -1
    let y1 = -1
    let x2 = -1
    let y2 = -1
    // 遍历棋盘，找出帥和將的位置
    for (let i = 0; i < this.chessList.length; i++) {
      for (let j = 0; j < this.chessList[i].length; j++) {
        let chess = this.chessList[i][j]
        if (chess) {
          if (chess.name === '帥') {
            x1 = chess.x
            y1 = chess.y
          } else if (chess.name === '將') {
            x2 = chess.x
            y2 = chess.y
          }
        }
      }
    }
    if (x1 === x2) { // 处于同一条竖线
      // 统计中间棋子数量，除该棋子之外
      let count = 0
      for (let i = Math.min(y1, y2) + 1; i < Math.max(y1, y2); i++) {
        if (this.chessList[i][x1] && i !== startY) {
          count ++
        }
      }
      if (count === 0) {
        // 面將了
        return true
      }
    }
    return false
  }
}
