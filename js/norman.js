
import _ from 'lodash'
import $ from 'jquery'

import {save, deleteAnim, loadPrev, loadNext, loadAnimByName} from './firebasestore'
import {abstractABXY, setupThumbStickDirectionEvents} from './oculustouchhelpers'
import './anim'

const comps = [

  ['gildered-frump-hinges'],
  ['mulgy-shift-hops', 'mulgy-prunt-clumps','fropley-limp-hunguses', 'brumpled-brine-glops'],
  ['clumbied-clam-shanks'], // norman
  ['clumbied-crank-hops', 'mulgy-bung-flops'],
  ['lorgussy-clam-hinges'],
  ['gildered-bung-glops', 'brumpled-crank-glops'],
  ['fropley-groft-lumps'],
  ['mulgy-shift-hops', 'mulgy-prunt-clumps'],
  ['fropley-limp-hunguses', 'brumpled-brine-glops'],
  ['clumbied-brine-hunguses', 'mulgy-dank-glops'],
  ['brumpled-dank-hunguses'],
  ['lorgussy-bung-clamps'],
  ['fropley-clam-shanks', 'trulmy-dank-hops'],
  ['brumpled-shift-hinges'],
  ['gildered-shift-hunguses'],
  ['troubling-plex-hunguses'], // black pearl motion study
  ['trulmy-limp-donks'], // runnning man
  ['marbled-groft-clumps'], // craggly norman letters
  ['mulgy-ront-hops'], // abstract short loop
]

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
    _.delay(this.setupControllers.bind(this), 1) // SMELLY delay!

    loadAnimByName('trulmy-limp-donks').then(({animData, currentFileInfo}) => {
      this.addAnim(animData)
    })
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
    setupThumbStickDirectionEvents(primaryHand, 0.5)
    setupThumbStickDirectionEvents(secondaryHand, 0.5)
    abstractABXY(leftHand, 'left')
    abstractABXY(rightHand, 'right')
    Object.assign(this, {secondaryHand, primaryHand})

    primaryHand.addEventListener('upperbuttondown', this.handlePrimaryUpperButtonDown.bind(this))
    secondaryHand.addEventListener('lowerbuttondown', this.handleSecondaryLowerButtonDown.bind(this))
    secondaryHand.addEventListener('lowerbuttonup', this.handleSecondaryLowerButtonUp.bind(this))
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

  handlePrimaryUpperButtonDown() {
    this.togglePlay()
  },

  handleSecondaryLowerButtonDown() {
    console.log('enter filesystem mode')
  },

  handleSecondaryLowerButtonUp() {
    console.log('exit filesystem mode')
  },

})
