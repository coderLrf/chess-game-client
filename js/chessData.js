const width = 50 // 棋子的大小
/**
 * 棋子初始数据
 */
const CHESS_DATA = [
  {x: 0, y: 9, name: '車', width, power: 1},
  {x: 1, y: 9, name: '馬', width, power: 1},
  {x: 2, y: 9, name: '相', width, power: 1},
  {x: 3, y: 9, name: '仕', width, power: 1},
  {x: 4, y: 9, name: '帥', width, power: 1},
  {x: 5, y: 9, name: '仕', width, power: 1},
  {x: 6, y: 9, name: '相', width, power: 1},
  {x: 7, y: 9, name: '馬', width, power: 1},
  {x: 8, y: 9, name: '車', width, power: 1},
  {x: 1, y: 7, name: '炮', width, power: 1},
  {x: 7, y: 7, name: '炮', width, power: 1},
  {x: 0, y: 6, name: '兵', width, power: 1},
  {x: 2, y: 6, name: '兵', width, power: 1},
  {x: 4, y: 6, name: '兵', width, power: 1},
  {x: 6, y: 6, name: '兵', width, power: 1},
  {x: 8, y: 6, name: '兵', width, power: 1},

  {x: 0, y: 0, name: '車', width, power: 0},
  {x: 1, y: 0, name: '馬', width, power: 0},
  {x: 2, y: 0, name: '象', width, power: 0},
  {x: 3, y: 0, name: '士', width, power: 0},
  {x: 4, y: 0, name: '將', width, power: 0},
  {x: 5, y: 0, name: '士', width, power: 0},
  {x: 6, y: 0, name: '象', width, power: 0},
  {x: 7, y: 0, name: '馬', width, power: 0},
  {x: 8, y: 0, name: '車', width, power: 0},
  {x: 1, y: 2, name: '砲', width, power: 0},
  {x: 7, y: 2, name: '砲', width, power: 0},
  {x: 0, y: 3, name: '卒', width, power: 0},
  {x: 2, y: 3, name: '卒', width, power: 0},
  {x: 4, y: 3, name: '卒', width, power: 0},
  {x: 6, y: 3, name: '卒', width, power: 0},
  {x: 8, y: 3, name: '卒', width, power: 0}
]
