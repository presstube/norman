import 'aframe'


AFRAME.registerComponent('homeframeghost', {

  schema: {
    norman: {type: 'selector'},
    frameData: {type: 'array'},
    color: {type: 'string', default: 'black'},
    style: {type: 'string', default: 'solid'},
    opacity: {type: 'number', default: 1},
  },

  init: function() {
    // console.log('home frame ghost here!', this.data)
    this.normanComp = norman.components.norman
    this.homeFrame = this.makeFrameEntity(this.data.frameData)
    this.boundLineAddedListener = this.onLineAdded.bind(this)
    this.data.norman.addEventListener('HOME_FRAME_LINE_ADDED', this.boundLineAddedListener)

              // code duplicated between onionskin and homeframeghost
    this.boundStartedPlayingListener = this.onStartedPlaying.bind(this)
    this.boundStoppedPlayingListener = this.onStoppedPlaying.bind(this)
    this.data.norman.addEventListener('STARTED_PLAYING', this.boundStartedPlayingListener)
    this.data.norman.addEventListener('STOPPED_PLAYING', this.boundStoppedPlayingListener)

    this.boundOnionOnListener = this.onOnionOn.bind(this)
    this.boundOnionOffListener = this.onOnionOff.bind(this)
    // this.data.norman.addEventListener('ONION_ON', this.boundOnionOnListener)
    // this.data.norman.addEventListener('ONION_OFF', this.boundOnionOffListener)
  },

  makeFrameEntity: function(frameData) {
    var frameEntity = document.createElement('a-entity')
    this.el.appendChild(frameEntity)
    frameEntity.setAttribute('frame', {
      frameData: frameData,
      color: this.data.color,
      style: this.data.style,
      opacity: this.data.opacity
    })
    // frameEntity.setAttribute('visible', false)
    return frameEntity
  },

  onLineAdded: function(e) {
    // console.log('HFG heard line added: ', e)
    this.homeFrame.components.frame.makeLineEntity(e.detail.lineData)
  },

  onStartedPlaying: function() {
    this.el.setAttribute('visible', false)
  },

  onStoppedPlaying: function() {
    // if (this.normanComp.onionVisible) {
    // }
    this.el.setAttribute('visible', true)
  },

  onOnionOn: function() {
    if (!this.normanComp.isAnimPlaying) {
      this.el.setAttribute('visible', true)
    }
  },

  onOnionOff: function() {
    this.el.setAttribute('visible', false)
  },

  remove: function() {
    this.data.norman.removeEventListener('HOME_FRAME_LINE_ADDED', this.boundLineAddedListener)
    this.data.norman.removeEventListener('STARTED_PLAYING', this.boundStartedPlayingListener)
    this.data.norman.removeEventListener('STOPPED_PLAYING', this.boundStoppedPlayingListener)
    this.data.norman.removeEventListener('ONION_ON', this.boundOnionOnListener)
    this.data.norman.removeEventListener('ONION_OFF', this.boundOnionOffListener)
  }


})