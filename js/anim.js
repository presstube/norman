// import 'aframe'
import _ from 'lodash'

AFRAME.registerComponent('anim', {

  schema: {
    norman: {type: 'selector'},
    animData: {type: 'array'}
  },

  init() {
    const {norman, animData} = this.data
    Object.assign(this, {
      currentFrame: 0,
      frameChangeTime: null,
      frameEntities: animData.map(frameData => this.makeFrameEntity(frameData)),
      normanComp: norman.components.norman,
      boundOnLineAdded: this.onLineAdded.bind(this),
      boundOnFrameAdded: this.onFrameAdded.bind(this)
    })
    const {boundOnLineAdded, boundOnFrameAdded} = this
    norman.addEventListener('LINE_ADDED', boundOnLineAdded)    
    norman.addEventListener('FRAME_ADDED', boundOnFrameAdded)    
    this.showOnlyCurrentFrame()
  },

  remove() {
    const {norman} = this.data,
          {boundOnLineAdded, boundOnFrameAdded} = this
    norman.removeEventListener('LINE_ADDED', boundOnLineAdded)
    norman.removeEventListener('FRAME_ADDED', boundOnFrameAdded)
  },

  tick(time, timeDelta) {
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
      this.showOnlyCurrentFrame()
    }
  },

  showOnlyCurrentFrame() {
    const {frameEntities, currentFrame} = this
    frameEntities.map((frameEnt, index) => {
      if (index == currentFrame) {
        frameEnt.setAttribute('visible', true)
      } else {
        frameEnt.setAttribute('visible', false)
      }
    })
  },

  makeFrameEntity(frameData) {
    const frameEntity = document.createElement('a-entity'),
          {el} = this
    el.appendChild(frameEntity)
    frameEntity.setAttribute('frame', {
      frameData: frameData,
      // color: '#222',
      color: 'black',
      style: 'solid'
    })
    return frameEntity
  },

  gotoNextFrame() {
    const {el, data, currentFrame} = this,
          {animData} = data
    el.emit('EXIT_FRAME', {frame: currentFrame})
    if (currentFrame + 1 == animData.length) {
      this.currentFrame = 0
    } else {
      this.currentFrame++
    }
    this.renderFrame()
  },

  gotoPrevFrame() {
    const {el, data, currentFrame} = this,
          {animData} = data
    el.emit('EXIT_FRAME', {frame: currentFrame})
    if (currentFrame - 1 < 0) {
      this.currentFrame = animData.length - 1
    } else {
      this.currentFrame--
    }
    this.renderFrame()
  },

  renderFrame() {
    const {el, currentFrame} = this
    this.showOnlyCurrentFrame()
    el.emit('ENTER_FRAME', {frame: currentFrame})
  },

  onLineAdded({detail}) {
    this.addLineData(detail)
  },

  addLineData({lineData, frameIndex}) {
    this.frameEntities[frameIndex].components.frame.makeLineEntity(lineData)
  },

  onFrameAdded(e) {
    this.frameEntities.splice(e.detail.insertIndex, 0, this.makeFrameEntity([]))
  },

})