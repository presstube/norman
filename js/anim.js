import 'aframe'
import _ from 'lodash'

AFRAME.registerComponent('anim', {

  schema: {
    norman: {type: 'selector'}
  },

  init: function () {
    
    this.currentFrame = 0
    this.frameChangeTime = null
    this.frameEntities = _.map(this.animData, this.makeFrameEntity.bind(this))
    this.showOnlyCurrentFrame()
    this.controllers = Array.prototype.slice.call(document.querySelectorAll('a-entity[oculus-touch-controls]'))
    this.normanComp = this.data.norman.components.norman

    // code duplicated between anim and onionskin
    this.boundOnLineAdded = this.onLineAdded.bind(this)
    this.boundOnFrameAdded = this.onFrameAdded.bind(this)
    this.data.norman.addEventListener('LINE_ADDED', this.boundOnLineAdded)
    this.data.norman.addEventListener('FRAME_ADDED', this.boundOnFrameAdded)

    document.addEventListener('keydown', function(e) {
      // console.log('keydown: ', e)
      if (e.code == 'Comma') {
        this.gotoPrevFrame()
      } else if (e.code == 'Period') {
        this.gotoNextFrame()
      }
    }.bind(this))                   

  },

  update: function(oldData) {
    // console.log('anim updated: ', oldData, this.data)
  },

  tick: function(time, timeDelta) {
    if (this.normanComp.isAnimPlaying) {
      if (!this.frameChangeTime) this.frameChangeTime = time
      var diff = time - this.frameChangeTime
      if (diff >= Math.abs(this.normanComp.frameInterval)) {
        this.frameChangeTime = time
        if (this.normanComp.frameInterval >= 0) {
          this.gotoNextFrame()
        } else {
          this.gotoPrevFrame()
        }
      }
      this.showOnlyCurrentFrame()
    }
  },

  showOnlyCurrentFrame: function() {
    _.map(this.frameEntities, function(frameEnt, index) {
      if (index == this.currentFrame) {
        frameEnt.setAttribute('visible', true)
      } else {
        frameEnt.setAttribute('visible', false)
      }
    }.bind(this))
  },

  makeFrameEntity: function(frameData) {
    var frameEntity = document.createElement('a-entity')
    this.el.appendChild(frameEntity)
    frameEntity.setAttribute('frame', {
      frameData: frameData,
      color: '#222',
      style: 'solid'
    })
    return frameEntity
  },

  rebuild() {
    _.map(this.frameEntities, function(frameEnt, index) {
      this.el.removeChild(frameEnt)
    }.bind(this))
    this.frameEntities = _.map(this.animData, this.makeFrameEntity.bind(this))
    this.showOnlyCurrentFrame()
  },

  setAnimData: function(animData) {
    this.animData = animData
    this.rebuild()
  },

  gotoNextFrame: function() {
    this.el.emit('EXIT_FRAME', {frame: this.currentFrame})
    if (this.currentFrame + 1 == this.animData.length) {
      this.currentFrame = 0
    } else {
      this.currentFrame++
    }
    this.renderFrame()
  },

  gotoPrevFrame: function() {
    this.el.emit('EXIT_FRAME', {frame: this.currentFrame})
    if (this.currentFrame - 1 < 0) {
      this.currentFrame = this.animData.length - 1
    } else {
      this.currentFrame--
    }
    this.renderFrame()
  },

  renderFrame: function() {
    this.showOnlyCurrentFrame()
    this.el.emit('ENTER_FRAME', {frame: this.currentFrame})
  },

  onLineAdded: function(e) {
    this.addLineData(e.detail.lineData, e.detail.frameIndex)
  },

  addLineData(lineData, frameIndex) {
    this.frameEntities[frameIndex].components.frame.makeLineEntity(lineData)
  },

  onFrameAdded: function(e) {
    this.frameEntities.splice(e.detail.insertIndex, 0, this.makeFrameEntity([]))
  },

  remove: function() {
    this.data.norman.removeEventListener('LINE_ADDED', this.boundOnLineAdded)
    this.data.norman.removeEventListener('FRAME_ADDED', this.boundOnFrameAdded)
  }

})