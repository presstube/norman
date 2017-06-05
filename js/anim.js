import _ from 'lodash'
import Frames from './frames'
import OnionSkin from './onionskin'
import HomeFrameGhost from './homeframeghost'
import RegMarker from './regmarker'

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
    this.ONION_REMOVED = 'ONION_REMOVED'

    this.normanEnt = norman
    this.normanComp = norman.components.norman
    this.animData = animData
    this.currentFrame = 0
    this.frameChangeTime = null
    // this.distThresh = 0.001
    // this.lastPos = null
    // this.autoNext = false
    // this.autoPrev = false
    // this.frameEditing = false
    this.regMarker = new RegMarker(this)
    this.frames = new Frames(this, animData)
    this.homeFrameGhost = new HomeFrameGhost(this)
    this.onionskin = null

    const {regMarker, homeFrameGhost} = this
    this.hideOnPlay = [regMarker, homeFrameGhost]

    this.bindNorman()
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
      const {pen, distThresh, lastPos} = this,
            currentPos = this.getLocalPenPos(pen.position),
            distToLastPos = lastPos.distanceTo(currentPos)
      if (distToLastPos > distThresh) {
        this.addToLine(currentPos)
        this.lastPos = currentPos
      }
    }
  },

  bindNorman() {
    const {normanEnt, normanComp} = this,
          {STARTED_PLAYING, STOPPED_PLAYING} = normanComp

    normanEnt.addEventListener('STARTED_PLAYING', () => this.onStartedPlaying())
    normanEnt.addEventListener('STOPPED_PLAYING', () => this.onStoppedPlaying())
  },

  onStartedPlaying() {
    this.hideOnPlay.forEach(toHide => toHide.visible = false)
  },

  onStoppedPlaying() {
    this.hideOnPlay.forEach(toHide => toHide.visible = true)
  },

  bindKeyboard() {
    document.addEventListener('keydown', e => {
      // console.log('keydown: ', e)
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
    // HAHA, thanks former me! Just ran into that now. hmmmm.
    const {primaryHand, secondaryHand} = this.normanComp

    this.pen = primaryHand.object3D


    // primaryHand.addEventListener('triggerdown', () => this.handlePrimaryTriggerDown())
    // primaryHand.addEventListener('triggerup', () => this.handlePrimaryTriggerUp()) 
    primaryHand.addEventListener('lowerbuttondown', () => this.handlePrimaryLowerButtonDown()) 
    // secondaryHand.addEventListener('triggerdown', () => this.handleSecondaryTriggerDown())
    // secondaryHand.addEventListener('triggerup', () => this.handleSecondaryTriggerUp())
    // secondaryHand.addEventListener('LEFT_ON', () => this.handleSecondaryLeftOn())
    // secondaryHand.addEventListener('RIGHT_ON', () => this.handleSecondaryRightOn())
    // secondaryHand.addEventListener('LEFT_OFF', () => this.handleSecondaryLeftOff())
    // secondaryHand.addEventListener('RIGHT_OFF', () => this.handleSecondaryRightOff())
    // secondaryHand.addEventListener('thumbstickdown', () => this.handleSecondaryThumbstickDown())
  },

  // MODIFIERS

  gotoNextFrame() {         
    this.beforeFrameChange()
    this.currentFrame = this.getRelativeFrame(1)
    this.afterFrameChange()
  },

  gotoPrevFrame() {
    this.beforeFrameChange()
    this.currentFrame = this.getRelativeFrame(-1)
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

  toggleOnion() {
    const {el, ONION_REMOVED} = this
    if (!this.onionskin) {
      this.onionskin = new OnionSkin(this)
    } else {
      el.emit(ONION_REMOVED)
    }
  },

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

  // startDrawing() {
  //   if (!this.isDrawing) {
  //     this.lastPos = this.getLocalPenPos(this.pen.position)
  //     this.isDrawing = true
  //     this.startLine(this.lastPos)
  //   }
  // },

  // stopDrawing() {
  //   if (this.isDrawing) {
  //     this.isDrawing = false
  //     this.finishLine(this.getLocalPenPos(this.pen.position))
  //     if (this.autoNext) this.gotoNextFrame()
  //     if (this.autoPrev) this.gotoPrevFrame()
  //   }
  // },

  // handlePrimaryTriggerDown() {
  //   this.startDrawing()
  // },

  // handlePrimaryTriggerUp() {
  //   this.stopDrawing()
  // },

  handlePrimaryLowerButtonDown() {
    this.toggleOnion()
  },

  // handleSecondaryTriggerDown() {
  //   this.frameEditing = true
  // },

  // handleSecondaryTriggerUp() {
  //   this.frameEditing = false
  // },

  // handleSecondaryLeftOn() {
  //   this.autoPrev = true
  //   if (this.frameEditing) {
  //     this.insertFrameAt('before')
  //   } else {
  //     this.gotoPrevFrame()
  //   }
  // },
 
  // handleSecondaryLeftOff() {
  //   this.autoPrev = false
  // },

  // handleSecondaryRightOn() {
  //   this.autoNext = true
  //   if (this.frameEditing) {
  //     this.insertFrameAt('after')
  //   } else {
  //     this.gotoNextFrame()
  //   }
  // },

  // handleSecondaryRightOff() {
  //   this.autoNext = false
  // },

  // handleSecondaryThumbstickDown() {
  //   if (this.frameEditing) this.removeFrame()
  // },

  // HELPERS

  getRelativeFrame(relativeVal) {
    const {currentFrame, animData} = this,
          finalFrame = animData.length -1
    let relFrame = currentFrame + relativeVal
    if (relFrame > finalFrame) {
      relFrame = relFrame - animData.length
    } else if (relFrame < 0) {
      relFrame = animData.length + relFrame
    }
    return relFrame
  },

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

