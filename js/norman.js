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

})