// 窗口列表el
const windowElList = document.querySelectorAll('.window')
// 对话框
var windowDialogEl = document.querySelector('#window-dialog')

/**
 * 页面渲染完成
 */
window.onload = function () {
  new Game().start()

  initWindowEvent()

  // 取消鼠标右键
  document.querySelector('#wrap').oncontextmenu = function(e) {
    return false
  }
}

// 初始化窗口事件
function initWindowEvent() {
  windowElList.forEach(item => {
    // 绑定关闭事件
    const closeEl = item.querySelector('.close')
    closeEl && closeEl.addEventListener('click', e => closeWindow.call(item, e))
    // 绑定事件
    const titleEl = item.querySelector('.window-title')
    titleEl.addEventListener('mousedown',  e => startDraw.call(item, e))
    // 绑定取消事件
    const cancelEl = item.querySelector('.cancel')
    cancelEl && cancelEl.addEventListener('click', e => closeWindow.call(item, e))
  })
}


// 开始拖拽
function startDraw(e) {
  let disX = e.clientX - this.offsetLeft
  let disY = e.clientY - this.offsetTop
  // 拖拽中
  document.onmousemove = e1 => {
    this.style.left = e1.clientX - disX + 'px'
    this.style.top = e1.clientY - disY + 'px'
  }
  // 拖拽结束
  document.onmouseup = () => {
    document.onmousemove = null
    document.onmouseup = null
    return false
  }
}

// 关闭窗口
function closeWindow(e, callback) {
  this.style.display = 'none'
  if (callback) {
    callback()
  }
}

// 显示窗口
function showWindow(payload) {
  let {title, content, cancelButton, confirmButton, closeCallback} = payload
  if (typeof content === 'string') {
    let con = content
    content = document.createElement('div')
    content.innerHTML = con
  }
  let containerEl = windowDialogEl.querySelector('.container')
  let titleEl = windowDialogEl.querySelector('#title')
  titleEl.innerHTML = title || '提示'
  containerEl.innerHTML = ''
  containerEl.appendChild(content)

  let floorEl = windowDialogEl.querySelector('.custom-floor')
  floorEl.innerHTML = ''
  if (!cancelButton) {
    cancelButton = document.createElement('button')
    cancelButton.className = 'button cancel'
    cancelButton.innerHTML = '关闭'
  }
  // 绑定关闭事件
  cancelButton.addEventListener('click', e => closeWindow.call(windowDialogEl, e, closeCallback))
  const closeEl = windowDialogEl.querySelector('.close')
  closeEl && closeEl.addEventListener('click', e => closeWindow.call(windowDialogEl, e, closeCallback))

  floorEl.appendChild(cancelButton)
  confirmButton && floorEl.appendChild(confirmButton)

  windowDialogEl.style.display = 'table'
}
