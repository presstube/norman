// import 'aframe'


AFRAME.registerComponent('homeframeghost', {

  schema: {
    norman: {type: 'selector'},
    frameData: {type: 'array'},
    color: {type: 'string', default: 'black'},
    style: {type: 'string', default: 'solid'},
    opacity: {type: 'number', default: 1},
  },

  init() {
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

  makeFrameEntity(frameData) {
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

  onLineAdded(e) {
    // console.log('HFG heard line added: ', e)
    this.homeFrame.components.frame.makeLineEntity(e.detail.lineData)
  },

  onStartedPlaying() {
    this.el.setAttribute('visible', false)
  },

  onStoppedPlaying() {
    // if (this.normanComp.onionVisible) {
    // }
    this.el.setAttribute('visible', true)
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
    let {norman} = this.data
    norman.removeEventListener('HOME_FRAME_LINE_ADDED', this.boundLineAddedListener)
    norman.removeEventListener('STARTED_PLAYING', this.boundStartedPlayingListener)
    norman.removeEventListener('STOPPED_PLAYING', this.boundStoppedPlayingListener)
    norman.removeEventListener('ONION_ON', this.boundOnionOnListener)
    norman.removeEventListener('ONION_OFF', this.boundOnionOffListener)
  }


})