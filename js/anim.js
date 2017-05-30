import _ from 'lodash'
import Frames from './frames'

AFRAME.registerComponent('anim', {

  schema: {
    norman: {type: 'selector'},
    animData: {type: 'array'},
  },

  init() {
    
    const {norman, animData} = this.data

    this.ctrl = {
      onWhatever() {

      }
    }

    this.ENTER_FRAME = 'ENTER_FRAME'
    this.EXIT_FRAME = 'EXIT_FRAME'
    this.FRAME_CHANGED = 'ANIM_FRAME_CHANGED'
    this.DATA_CHANGED = 'ANIM_DATA_CHANGED'
    this.FRAME_INSERTED = 'FRAME_INSERTED'
    this.FRAME_REMOVED = 'FRAME_REMOVED'
    this.LINE_STARTED = 'LINE_STARTED'
    this.LINE_ADDED_TO = 'LINE_ADDED_TO'
    this.LINE_FINISHED = 'LINE_FINISHED'

    this.normanEnt = norman
    this.normanComp = norman.components.norman
    this.animData = animData
    this.currentFrame = 0
    this.totalFrames = animData.length
    this.frameChangeTime = null

    this.frames = new Frames(this, animData)

    this.bindKeyboard()
    this.bindOculusTouchControllers()


  },

  remove() {
    // remove listeners
  },

  tick(time, timeDelta) {
    this.operatePlayhead(time)
  },

  operatePlayhead(time) {
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

  bindKeyboard() {
    document.addEventListener('keydown', e => {
      // // console.log('keydown: ', e)
      // if (e.code == 'Enter') {this.togglePlay()} 
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
    // bind the touch controllers to the ctrl
    const controllers =   document.querySelectorAll('a-entity[oculus-touch-controls]')

    console.log('controllers: ', controllers)
  },

  gotoNextFrame() {
    const {el, currentFrame, totalFrames} = this
    this.beforeFrameChange()
    if (currentFrame + 1 == totalFrames) {
      this.currentFrame = 0
    } else {
      this.currentFrame++
    }
    this.afterFrameChange()
  },

  gotoPrevFrame() {
    const {el, currentFrame, totalFrames} = this
    this.beforeFrameChange()
    if (currentFrame - 1 < 0) {
      this.currentFrame = totalFrames - 1
    } else {
      this.currentFrame--
    }
    this.afterFrameChange()
  },

  beforeFrameChange() {
    const {el, EXIT_FRAME, currentFrame} = this
    el.emit(EXIT_FRAME, {frame: currentFrame})
  },

  afterFrameChange() {
    const {el, ENTER_FRAME, currentFrame} = this
    el.emit(ENTER_FRAME, {frame: currentFrame})
  },

  insertFrame(index) {
    const {el, FRAME_INSERTED} = this
    emit(ENTER_FRAME, {frame: currentFrame})

    //
  },

  removeFrame(index) {
    //

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

