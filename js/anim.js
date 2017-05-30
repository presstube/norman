import _ from 'lodash'
import Frames from './frames'

AFRAME.registerComponent('anim', {

  schema: {
    norman: {type: 'selector'},
    animData: {type: 'array'},
  },

  init() {
    
    const {norman, animData} = this.data

    this.ENTER_FRAME = 'ENTER_FRAME'
    this.EXIT_FRAME = 'EXIT_FRAME'
    this.ANIM_DATA_CHANGED = 'ANIM_DATA_CHANGED'

    this.FRAME_INSERTED = 'FRAME_INSERTED'
    this.FRAME_REMOVED = 'FRAME_REMOVED'

    this.LINE_STARTED = 'LINE_STARTED'
    this.LINE_ADDED_TO = 'LINE_ADDED_TO'
    this.LINE_FINISHED = 'LINE_FINISHED'

    this.normanEnt = norman
    this.normanComp = norman.components.norman
    this.animData = animData
    this.currentFrame = 0
    // this.totalFrames = animData.length
    this.frameChangeTime = null
    this.distThresh = 0.001
    this.lastPos = null

    this.frames = new Frames(this, animData)

    this.bindKeyboard()
    this.bindOculusTouchControllers()

  },

  remove() {
    // remove listeners
  },

  tick(time, timeDelta) {
    this.handlePlayhead(time)
    this.handleDraw()
  },

  handlePlayhead(time) {
    const {normanComp} = this,
          {isAnimPlaying, frameInterval} = normanComp

    if (isAnimPlaying) {
      if (!this.frameChangeTime) this.frameChangeTime = time
      const {frameChangeTime} = this,
            diff = time - frameChangeTime
      if (diff >= Math.abs(frameInterval)) {
        this.frameChangeTime = time
        if (frameInterval >= 0) {
          this.gotoNextFrame()
        } else {
          this.gotoPrevFrame()
        }
      }
    }
  },

  handleDraw() {
    if (this.isDrawing) {

      const {primaryHand, distThresh} = this,
            currentPos = this.getLocalPenPos(this.pen.position),
            distToLastPos = this.lastPos.distanceTo(currentPos)

      if (distToLastPos > distThresh) {
        this.addToLine(currentPos)
        this.lastPos = currentPos
      }
    }
  },

  bindKeyboard() {
    document.addEventListener('keydown', e => {
      console.log('keydown: ', e)
      if (e.code == 'Enter') {}
      else if (e.code == 'Comma') {this.gotoPrevFrame()}
      else if (e.code == 'Period') {this.gotoNextFrame()}

      else if (e.code == 'BracketLeft' && e.shiftKey) {this.removeFrame()}

      else if (e.code == 'BracketLeft') {this.insertFrameAt('before')}
      else if (e.code == 'BracketRight') {this.insertFrameAt('after')}


       
      // // else if (e.key == 'S') {
      // //   // console.log('saving: ')
      // //   uploadAnimData(null, {data: this.animData})
      // // }
      // else if (e.key == 'ArrowLeft' && e.altKey && e.shiftKey) {this.fileLoadPrev(!e.ctrlKey)}
      // else if (e.key == 'ArrowRight' && e.altKey && e.shiftKey) {this.fileLoadNext(!e.ctrlKey)}
      // else if (e.key == 'ArrowDown' && e.altKey && e.shiftKey && !e.ctrlKey) {this.fileSave()}
      // else if (e.key == 'ArrowDown' && e.altKey && e.shiftKey && e.ctrlKey) {this.fileSave(false)}
      // else if (e.code == 'KeyX' && e.altKey) {this.fileDelete()}
      // else if (e.key == 'o') {this.toggleOnion()}
      // else if (e.key == ',') {this.changeFPS(-1)}
      // else if (e.key == '.') {this.changeFPS(1)}
      // else if (e.key == 't') {this.addLineData([{x:0, y:1, z:2},{x:0, y:1, z:2}], 2)}
    }) 
  },

  bindOculusTouchControllers() {
    // good chance there will be a race condition here when setting up a blank anim in Norman
    const {primaryHand, secondaryHand} = this.normanComp
    this.pen = primaryHand.object3D
    this.primaryHand = primaryHand

    primaryHand.addEventListener('triggerdown', () => {
      this.startDrawing()
    })
    primaryHand.addEventListener('triggerup', () => {
      this.stopDrawing()
    })
  },

  // gotoFrame(index)

  gotoNextFrame() {
    const {el, currentFrame, animData} = this,
          totalFrames = animData.length
          
    this.beforeFrameChange()
    if (currentFrame + 1 == totalFrames) {
      this.currentFrame = 0
    } else {
      this.currentFrame++
    }
    this.afterFrameChange()
  },

  gotoPrevFrame() {
    const {el, currentFrame, animData} = this,
          totalFrames = animData.length

    this.beforeFrameChange()
    if (currentFrame - 1 < 0) {
      this.currentFrame = totalFrames - 1
    } else {
      this.currentFrame--
    }
    this.afterFrameChange()
  },

  beforeFrameChange() {
    const {el, EXIT_FRAME, currentFrame, isDrawing} = this
    if (isDrawing) this.finishLine(this.getLocalPenPos(this.pen.position))
    el.emit(EXIT_FRAME, {frame: currentFrame})
  },

  afterFrameChange() {
    const {el, ENTER_FRAME, currentFrame, isDrawing} = this
    if (isDrawing) this.startLine(this.getLocalPenPos(this.pen.position))
    el.emit(ENTER_FRAME, {frame: currentFrame})
  },

  insertFrame(index) {
    const {el, animData, FRAME_INSERTED} = this
    animData.splice(index, 0, [])
    el.emit(FRAME_INSERTED, {frameIndex: index})
  },

  removeFrame(index) {
    // TODO, bug if removing last frame. fix when brain is fresh
    const {el, animData, currentFrame, FRAME_REMOVED} = this
    if (index === undefined) index = currentFrame
    animData.splice(index, 1)
    el.emit(FRAME_REMOVED, {frameIndex: index})
  },

  // CTRL

  insertFrameAt(position, frameIndex) {
    if (!frameIndex) frameIndex = this.currentFrame

    if (position === 'after') {
      frameIndex += 1
      this.currentFrame += 1
    } else {
      // do nothing
    }

    this.insertFrame(frameIndex)
  },

  startDrawing() {
    if (!this.isDrawing) {
      this.lastPos = this.getLocalPenPos(this.pen.position)
      this.isDrawing = true
      this.startLine(this.lastPos)
    }
  },

  stopDrawing() {
    if (this.isDrawing) {
      this.isDrawing = false
      this.finishLine(this.getLocalPenPos(this.pen.position))
    }
  },

  startLine(pos) {
    const {el, animData, currentFrame, ANIM_DATA_CHANGED, LINE_STARTED} = this,
          frameData = animData[currentFrame]

    frameData.push([pos])

    el.emit(ANIM_DATA_CHANGED, {
      type: LINE_STARTED,
      frameIndex: currentFrame, 
      frameData
    })
  },

  addToLine(pos) {
    const {el, animData, currentFrame, ANIM_DATA_CHANGED, LINE_ADDED_TO} = this,
          frameData = animData[currentFrame]

    _.last(frameData).push(pos)

    el.emit(ANIM_DATA_CHANGED, {
      type: LINE_ADDED_TO,
      frameIndex: currentFrame, 
      frameData
    })
  },

  finishLine(pos) {
    const {el, animData, currentFrame, ANIM_DATA_CHANGED, LINE_FINISHED} = this,
          frameData = animData[currentFrame]

    _.last(frameData).push(pos)

    el.emit(ANIM_DATA_CHANGED, {
      type: LINE_FINISHED,
      frameIndex: currentFrame, 
      frameData
    })
  },

  // HELPERS

  getLocalPenPos(penPos) {
    const {pen, normanEnt} = this
    let pos = new THREE.Vector3()
    pen.localToWorld(pos)
    normanEnt.object3D.worldToLocal(pos)
    return pos
  },

  fillGeometry(geometry, frameData) {
    const positions = [],
          indices = []

    let nextPosIndex = 0

    const addVertex = (v, index) => {
      positions.push(v.x, v.y, v.z)
      nextPosIndex++
    }

    const addSubsequentVertex = (v, index) => {
      const i = nextPosIndex - 1
      addVertex(v, index)
      indices.push(i, i+1)
    }

    const makeLine = vertices => {
      addVertex(vertices[0], 0)
      for (let i=1; i < vertices.length; i++) {
        addSubsequentVertex(vertices[i], i);
      }
    }

    _.each(frameData, (line, index) => {
      if (line.length) makeLine(line)
    })

    // console.log('positions: ', positions)
    // console.log('indices: ', indices)

    geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1))
    geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
    geometry.attributes.position.needsUpdate = true
  }

})

