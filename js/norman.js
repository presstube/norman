
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

    this.currentFileInfo = null
    this.fps = 30
    this.isPlaying = false
    this.isInsertMode = false
    this.isFileMode = false
    this.isGasPedalMode = false
    this.isRightHanded = true
    this.secondaryHand = null
    this.primaryHand = null
    this.frameInterval = 1000 / this.fps
    this.tracks = []

    this.STARTED_PLAYING = 'STARTED_PLAYING'
    this.STOPPED_PLAYING = 'STOPPED_PLAYING'
    this.ENTERED_FILE_MODE = 'ENTERED_FILE_MODE'
    this.EXITED_FILE_MODE = 'EXITED_FILE_MODE'
    this.ENTERED_INSERT_MODE = 'ENTERED_INSERT_MODE'
    this.EXITED_INSERT_MODE = 'EXITED_INSERT_MODE'

    this.setupKeyboard()

    // SMELLY delay!
    _.delay(() => {
      this.setupControllers()
      this.addTrack()
    }, 1) 

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
    secondaryHand.addEventListener('upperbuttondown', this.handleSecondaryUpperButtonDown.bind(this))
    secondaryHand.addEventListener('upperbuttonup', this.handleSecondaryUpperButtonUp.bind(this))
  },

  // CTRL

  handlePrimaryUpperButtonDown() {
    this.togglePlay()
  },

  handleSecondaryLowerButtonDown() {
    this.enterFileMode()
  },

  handleSecondaryLowerButtonUp() {
    this.exitFileMode()
  },

  handleSecondaryUpperButtonDown() {
    console.log('enter gas pedal mode')
  },

  handleSecondaryUpperButtonUp() {
    console.log('exit gas pedal mode')
  },

  // MODIFIERS

  addTrack() {
    const animEnt = document.createElement('a-entity'),
          {el, tracks} = this

    animEnt.setAttribute('anim', {
      norman: '#norman', 
      animData: [[]]
    })
    el.appendChild(animEnt)
    tracks.push(animEnt)
  },

  addAnim(animData) {
    const animEnt = document.createElement('a-entity'),
          {el} = this

    animEnt.setAttribute('anim', {norman: '#norman', animData})
    el.appendChild(animEnt)
  },

  togglePlay() {
    if (this.isPlaying) {
      this.stopPlaying()
    } else {
      this.startPlaying()
    }
  },

  startPlaying() {
    const {el, STARTED_PLAYING} = this
    this.isPlaying = true
    el.emit(STARTED_PLAYING)
  },

  stopPlaying() {
    const {el, STOPPED_PLAYING} = this
    this.isPlaying = false
    el.emit(STOPPED_PLAYING)
  },

  enterFileMode() {
    const {el, ENTERED_FILE_MODE} = this
    this.isFileMode = true
    el.emit(ENTERED_FILE_MODE)
  },

  exitFileMode() {
    const {el, EXITED_FILE_MODE} = this
    this.isFileMode = false
    el.emit(EXITED_FILE_MODE)
  },

  enterInsertMode() {
    const {el, ENTERED_INSERT_MODE} = this
    this.isInsertMode = true
    el.emit(ENTERED_INSERT_MODE)
  },

  exitInsertMode() {
    const {el, EXITED_INSERT_MODE} = this
    this.isInsertMode = false
    el.emit(EXITED_INSERT_MODE)
  },

})









