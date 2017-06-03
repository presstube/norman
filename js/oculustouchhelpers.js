
const abstractABXY = (c, hand) => {
  if (hand === 'left') {
    c.addEventListener('xbuttondown', () => { c.emit('lowerbuttondown')})
    c.addEventListener('xbuttonup', () => { c.emit('lowerbuttonup')})
    c.addEventListener('ybuttondown', () => { c.emit('upperbuttondown')})
    c.addEventListener('ybuttonup', () => { c.emit('upperbuttonup')})
  } else if (hand === 'right') {
    c.addEventListener('abuttondown', () => { c.emit('lowerbuttondown')})
    c.addEventListener('abuttonup', () => { c.emit('lowerbuttonup')})
    c.addEventListener('bbuttondown', () => { c.emit('upperbuttondown')})
    c.addEventListener('bbuttonup', () => { c.emit('upperbuttonup')})
  }
}

const setupThumbStickDirectionEvents = (controller, thresh = 0.5) => {
  let left = false,
      right = false,
      up = false,
      down = false,
      c = controller
  c.addEventListener('axismove', e => {
    const [xAxis, yAxis] = e.detail.axis
    if (xAxis > thresh && !right) {
      c.emit('RIGHT_ON')
      right = true
    } else if (xAxis < thresh && right) {
      c.emit('RIGHT_OFF')
      right = false
    } else if (xAxis < -thresh && !left) {
      c.emit('LEFT_ON')
      left = true
    } else if (xAxis > -thresh && left) {
      c.emit('LEFT_OFF')
      left = false
    } else if (yAxis > thresh && !down) {
      c.emit('DOWN_ON')
      down = true
    } else if (yAxis < thresh && down) {
      c.emit('DOWN_OFF')
      down = false
    } else if (yAxis < -thresh && !up) {
      c.emit('UP_ON')
      up = true
    } else if (yAxis > -thresh && up) {
      c.emit('UP_OFF')
      up = false
    }
  })
}

export {
  abstractABXY,
  setupThumbStickDirectionEvents
}