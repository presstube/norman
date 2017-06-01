// import 'aframe'
import _ from 'lodash'

AFRAME.registerComponent('onionskin', {

  schema: {
    animData: {type: 'array'},
    framesToSkin: {type: 'array'},
    color: {type: 'string', default: 'black'},
    style: {type: 'string', default: 'solid'},
    opacity: {type: 'number', default: 1},
    norman: {type: 'selector'}
  },

  init() {
    this.normanComp = norman.components.norman
    this.animEnt = document.querySelector('#anim')
    this.animComp = document.querySelector('#anim').components.anim
    this.boundFrameChangeListener = this.onEnterFrame.bind(this)
    this.animEnt.addEventListener('ENTER_FRAME', this.boundFrameChangeListener)
    this.el.setAttribute('opacity', this.data.opacity)
    
    // code duplicated between onionskin and homeframeghost
    this.boundStartedPlayingListener = this.onStartedPlaying.bind(this)
    this.boundStoppedPlayingListener = this.onStoppedPlaying.bind(this)
    this.data.norman.addEventListener('STARTED_PLAYING', this.boundStartedPlayingListener)
    this.data.norman.addEventListener('STOPPED_PLAYING', this.boundStoppedPlayingListener)

    this.rebuild()

    // code duplicated between anim and onionskin
    this.boundOnLineAdded = this.onLineAdded.bind(this)
    this.boundOnFrameAdded = this.onFrameAdded.bind(this)
    this.data.norman.addEventListener('LINE_ADDED', this.boundOnLineAdded)
    this.data.norman.addEventListener('FRAME_ADDED', this.boundOnFrameAdded)

    this.boundOnionOnListener = this.onOnionOn.bind(this)
    this.boundOnionOffListener = this.onOnionOff.bind(this)
    this.data.norman.addEventListener('ONION_ON', this.boundOnionOnListener)
    this.data.norman.addEventListener('ONION_OFF', this.boundOnionOffListener)

    this.el.setAttribute('visible', false)

  },

  rebuild() {
    _.map(this.frameEntities, function(frameEnt, index) {
      this.el.removeChild(frameEnt)
    }.bind(this))
    this.frameEntities = _.map(this.data.animData, this.makeFrameEntity.bind(this))
    // this.showActiveFrames()
  },

  onEnterFrame(e) {
    // console.log('onion heard change: ', this)
    this.showActiveFrames()
  },

  makeFrameEntity(frameData) {
    var frameEntity = document.createElement('a-entity')
    this.el.appendChild(frameEntity)
    frameEntity.setAttribute('frame', {
      frameData: frameData,
      color: this.data.color,
      style: this.data.style,
      opacity: this.data.opacity
    })
    frameEntity.setAttribute('visible', false)
    return frameEntity
  },

  showActiveFrames() {
    var cf = this.animComp.currentFrame
    var totalFrames = this.frameEntities.length
    _.each(this.showingFrames, function(frameEnt, index) {
      frameEnt.setAttribute('visible', false)
    })
    if (totalFrames > 1) {
      this.showingFrames = _.map(this.data.framesToSkin, function(frameToSkin) {
        var frameNumToSkin = cf + frameToSkin
        if (frameNumToSkin < 0) frameNumToSkin = (totalFrames) + frameNumToSkin
        if (frameNumToSkin >= totalFrames) frameNumToSkin = frameNumToSkin - totalFrames
        var frameEnt = this.frameEntities[frameNumToSkin]
        frameEnt.setAttribute('visible', true)
        return frameEnt
      }.bind(this))
    }
  },

  onLineAdded(e) {
    this.addLineData(e.detail.lineData, e.detail.frameIndex)
  },

  addLineData(lineData, frameIndex) {
    this.frameEntities[frameIndex].components.frame.makeLineEntity(lineData)
  },

  onFrameAdded(e) {
    this.frameEntities.splice(e.detail.insertIndex, 0, this.makeFrameEntity([]))
  },

  onStartedPlaying() {
    this.el.setAttribute('visible', false)
  },

  onStoppedPlaying() {
    if (this.normanComp.onionVisible) {
      this.el.setAttribute('visible', true)
    }
  },

  onOnionOn() {
    if (!this.normanComp.isAnimPlaying) {
      this.el.setAttribute('visible', true)
    }
  },

  onOnionOff() {
    this.el.setAttribute('visible', false)
  },

  remove() {

    // console.log('removing onion')

    this.animEnt.removeEventListener('ENTER_FRAME', this.boundFrameChangeListener)
    this.data.norman.removeEventListener('LINE_ADDED', this.boundOnLineAdded)

    this.data.norman.removeEventListener('ONION_ON', this.boundOnionOnListener)
    this.data.norman.removeEventListener('ONION_OFF', this.boundOnionOffListener)

    this.data.norman.removeEventListener('STARTED_PLAYING', this.boundStartedPlayingListener)
    this.data.norman.removeEventListener('STOPPED_PLAYING', this.boundStoppedPlayingListener)

  }

})