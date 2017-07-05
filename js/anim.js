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
    this.regMarker = new RegMarker(this.el.object3D)
    this.frames = new Frames(this, animData)
    this.homeFrameGhost = new HomeFrameGhost(this)
    this.onionskin = null

    const {regMarker, homeFrameGhost} = this
    this.hideOnPlay = [regMarker, homeFrameGhost]

    if (this.normanComp.isAnimPlaying) {
      this.onStartedPlaying()
    } else {
      this.onStoppedPlaying()
    }

    this.bindNorman()
    this.bindKeyboard()
    this.bindOculusTouchControllers()

    this.el.object3D.frustumCulled = false

  },

  remove() {
    // remove listeners
    // cleanup frames object
    // etc...
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
    }) 
  },

  bindOculusTouchControllers() {
    // good chance there will be a race condition here when setting up a blank anim in Norman
    // HAHA, thanks former me! Just ran into that now. hmmmm.
    const {primaryHand, secondaryHand} = this.normanComp

    this.pen = primaryHand.object3D

    primaryHand.addEventListener('lowerbuttondown', () => this.handlePrimaryLowerButtonDown()) 
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
    const {el, EXIT_FRAME, currentFrame, normanComp} = this,
          {isDrawing} = normanComp
          
    // check for an 'isConnectingLines' flag here to get connected Timepen      
    if (isDrawing) this.finishLine(this.getLocalPenPos(this.pen.position))
    el.emit(EXIT_FRAME, {frame: currentFrame})
  },

  afterFrameChange() {
    const {el, ENTER_FRAME, currentFrame, normanComp} = this,
          {isDrawing} = normanComp

    // check for an 'isConnectingLines' flag here to get connected Timepen      
    if (isDrawing) this.startLine(this.getLocalPenPos(this.pen.position))
    el.emit(ENTER_FRAME, {frame: currentFrame})
  },

  insertFrame(index) {
    const {el, animData, FRAME_INSERTED} = this
    animData.splice(index, 0, [[]])
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

  handlePrimaryLowerButtonDown() {
    this.toggleOnion()
  },

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

