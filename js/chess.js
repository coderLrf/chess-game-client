/**
 * 棋子类
 */
class Chess {
  constructor({x, y, width, name, power}) {
    this.x = x
    this.y = y
    this.width = width
    this.name = name
    this.power = power // 1 -> 我方棋子，2 -> 敌方棋子
    this.el = null // el元素
  }
}
