import _ from 'lodash'
import $ from 'jquery'

import {save, deleteAnim, loadPrev, loadNext} from './firebasestore'

import './anim'

AFRAME.registerComponent('norman', {

  init() {
    Object.assign(this, {
      currentFileInfo: null,
      fps: 30,
      isAnimPlaying: false,
      isRightHanded: true,
      secondaryHand: null,
      primaryHand: null,
    })
    this.frameInterval = 1000 / this.fps
    this.setupKeyboard()
    _.delay(this.setupControllers.bind(this), 1) // SMELLY!

    this.fileLoadPrev()
  },

  setupKeyboard() {
    document.addEventListener('keydown', e => {
      // console.log('keydown: ', e)
      if (e.code == 'Enter') {this.togglePlay()} 
      else if (e.key == 'ArrowLeft' && e.altKey && e.shiftKey) {this.fileLoadPrev(!e.ctrlKey)}
    })
  },

  setupControllers() {
    const controllers =   document.querySelectorAll('a-entity[oculus-touch-controls]'),
          [leftHand, rightHand] = controllers,
          primaryHand = this.isRightHanded ? rightHand : leftHand,
          secondaryHand = this.isRightHanded ? leftHand : rightHand,
          pensphereEnt = document.querySelector("#pensphere")

          primaryHand.setObject3D('pensphereEnt', pensphereEnt.object3D)
          this.setupThumbStickDirectionEvents(primaryHand, 0.5)
          this.setupThumbStickDirectionEvents(secondaryHand, 0.5)
          Object.assign(this, {secondaryHand, primaryHand})
  },

  fileLoadPrev(doTeardown = true) {
    loadPrev(this.currentFileInfo).then(({animData, currentFileInfo}) => {
      this.currentFileInfo = currentFileInfo
      this.setup(animData)
    })
  },

  setup(animData = [[]]) {
    this.addAnim(animData)
  },

  addAnim(animData) {
    const animEnt = document.createElement('a-entity'),
          {el} = this

    animEnt.setAttribute('anim', {norman: '#norman', animData})
    el.appendChild(animEnt)
  },

  togglePlay() {
    if (this.isAnimPlaying) {
      this.stopPlaying()
    } else {
      this.startPlaying()
    }
  },

  startPlaying() {
    this.isAnimPlaying = true
    this.el.emit('STARTED_PLAYING')
  },

  stopPlaying() {
    this.isAnimPlaying = false
    this.el.emit('STOPPED_PLAYING')
  },

  // HELPERS

  setupThumbStickDirectionEvents(controller, thresh = 0.5) {
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
  },

})
