
import _ from 'lodash'
import $ from 'jquery'

import {save, deleteAnim, loadPrev, loadNext, loadAnimByName} from './firebasestore-multitrack'
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
    this.isAnimPlaying = false
    this.isDrawing = false
    this.isInsertMode = false
    this.isFileMode = false
    this.isGasPedalMode = false
    this.isRightHanded = true
    this.secondaryHand = null
    this.primaryHand = null
    this.frameInterval = 1000 / this.fps
    this.tracks = []
    this.currentTrackEnt = null
    this.currentTrackComp = null
    this.fileInfo = null
    this.lastPos = null
    this.pen = null
    this.distThresh = 0.001
    this.autoPrev = false
    this.autoNext = false

    this.STARTED_PLAYING = 'STARTED_PLAYING'
    this.STOPPED_PLAYING = 'STOPPED_PLAYING'
    this.ENTERED_FILE_MODE = 'ENTERED_FILE_MODE'
    this.EXITED_FILE_MODE = 'EXITED_FILE_MODE'
    this.ENTERED_INSERT_MODE = 'ENTERED_INSERT_MODE'
    this.EXITED_INSERT_MODE = 'EXITED_INSERT_MODE'

    this.boundFileNew = this.fileNew.bind(this)
    this.boundFileSave = this.fileSave.bind(this)

    this.setupKeyboard()

    // SMELLY delay!
    _.delay(() => {
      this.setupControllers()
      this.addTrack()
    }, 1) 

  },

  tick(time, timeDelta) {
    this.handleDraw()
  },

  setupKeyboard() {
    document.addEventListener('keydown', e => {
      // console.log('keydown: ', e)
      // if (e.code == 'Enter') {this.togglePlay()} 
      // if (e.code == 'Enter') {} 
      // else if (e.key == 'ArrowLeft' && e.altKey && e.shiftKey) {this.fileLoadPrev(!e.ctrlKey)}
    })
  },

  setupControllers() {
    const controllers =   document.querySelectorAll('a-entity[oculus-touch-controls]'),
          [leftHand, rightHand] = controllers,
          primaryHand = this.isRightHanded ? rightHand : leftHand,
          secondaryHand = this.isRightHanded ? leftHand : rightHand,
          pensphereEnt = document.querySelector("#pensphere")

    primaryHand.setObject3D('pensphereEnt', pensphereEnt.object3D)
    this.pen = primaryHand.object3D

    setupThumbStickDirectionEvents(primaryHand, 0.7)
    setupThumbStickDirectionEvents(secondaryHand, 0.7)
    abstractABXY(leftHand, 'left')
    abstractABXY(rightHand, 'right')
    Object.assign(this, {secondaryHand, primaryHand})

    primaryHand.addEventListener('triggerdown', () => this.handlePrimaryTriggerDown())
    primaryHand.addEventListener('triggerup', () => this.handlePrimaryTriggerUp()) 
    primaryHand.addEventListener('upperbuttondown', ()=> this.handlePrimaryUpperButtonDown())
    secondaryHand.addEventListener('triggerdown', () => this.handleSecondaryTriggerDown())
    secondaryHand.addEventListener('triggerup', () => this.handleSecondaryTriggerUp())
    secondaryHand.addEventListener('lowerbuttondown', ()=> this.handleSecondaryLowerButtonDown())
    secondaryHand.addEventListener('lowerbuttonup', ()=> this.handleSecondaryLowerButtonUp())
    secondaryHand.addEventListener('upperbuttondown', ()=> this.handleSecondaryUpperButtonDown())
    secondaryHand.addEventListener('upperbuttonup', ()=> this.handleSecondaryUpperButtonUp())
    secondaryHand.addEventListener('UP_ON', () => this.handleSecondaryUpOn())
    secondaryHand.addEventListener('DOWN_ON', () => this.handleSecondaryDownOn())
    secondaryHand.addEventListener('LEFT_ON', () => this.handleSecondaryLeftOn())
    secondaryHand.addEventListener('RIGHT_ON', () => this.handleSecondaryRightOn())
    secondaryHand.addEventListener('LEFT_OFF', () => this.handleSecondaryLeftOff())
    secondaryHand.addEventListener('RIGHT_OFF', () => this.handleSecondaryRightOff())
    secondaryHand.addEventListener('thumbstickdown', () => this.handleSecondaryThumbstickDown())
  },

  // CTRL

  handlePrimaryTriggerDown() {
    this.startDrawing()
  },

  handlePrimaryTriggerUp() {
    this.stopDrawing()
  },

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

  handleSecondaryTriggerDown() {
    this.enterInsertMode()
  },

  handleSecondaryTriggerUp() {
    this.exitInsertMode()
  },

  handleSecondaryUpOn() {
    if (this.isInsertMode) {
      this.addTrack()
    } else {
      this.selectPrevTrack()
    }
  },

  handleSecondaryDownOn() {
    if (this.isInsertMode) {
      this.removeTrack(this.currentTrackEnt)
    } else {
      this.selectNextTrack()
    }
  },

  handleSecondaryLeftOn() {
    const {isInsertMode, currentTrackComp, currentTrackEnt} = this
    this.autoPrev = true
    if (isInsertMode) {
      currentTrackComp.insertFrameAt('before')
    } else {
      currentTrackComp.gotoPrevFrame()
    }
  },
 
  handleSecondaryLeftOff() {
    this.autoPrev = false
  },

  handleSecondaryRightOn() {
    const {isInsertMode, currentTrackComp, currentTrackEnt} = this
    this.autoNext = true
    if (isInsertMode) {
      currentTrackComp.insertFrameAt('after')
    } else {
      currentTrackComp.gotoNextFrame()
    }
  },

  handleSecondaryRightOff() {
    this.autoNext = false
  },

  handleSecondaryThumbstickDown() {
    const {isInsertMode, currentTrackComp} = this
    if (isInsertMode) currentTrackComp.removeFrame()
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
    this.setCurrentTrack(animEnt)
    tracks.push(animEnt)
  },

  removeTrack(track) {
    const {el, tracks} = this,
          removedTrack = _.remove(tracks, track)[0]
    el.removeChild(removedTrack)

    // this is not good.. think of a better way
    this.setCurrentTrack(_.last(tracks))
  },

  setCurrentTrack(trackEnt) {
    if (trackEnt) {
      this.currentTrackEnt = trackEnt
      this.currentTrackComp = trackEnt.components.anim
    } else {
      this.currentTrackEnt = null
      this.currentTrackComp = null
    }
  },

  selectPrevTrack() {
    const {currentTrackEnt, tracks} = this
    let index = _.findIndex(tracks, currentTrackEnt)

    if (index - 1 === -1) {
      index = tracks.length - 1
    } else {
      index = index - 1
    }
    this.setCurrentTrack(tracks[index])
  },

  selectNextTrack() {
    const {currentTrackEnt, tracks} = this
    let index = _.findIndex(tracks, currentTrackEnt)

    if (index + 1 === tracks.length) {
      index = 0
    } else {
      index = index + 1
    }
    this.setCurrentTrack(tracks[index])
  },

  addFileModeListeners() {
    const {primaryHand} = this
    primaryHand.addEventListener('DOWN_ON', this.boundFileSave)
    primaryHand.addEventListener('UP_ON', this.boundFileNew)
  },

  removeFileModeListeners() {
    const {primaryHand} = this
    primaryHand.removeEventListener('DOWN_ON', this.boundFileSave)
    primaryHand.removeEventListener('UP_ON', this.boundFileNew)
  },

  fileNew() {
    console.log('new file')
    // remove all tracks
    this.tracks.map(this.removeTrack.bind(this))
    this.addTrack()
  },

  fileSave() {
    const {tracks, fileInfo} = this
    const compData = tracks.map(track => track.components.anim.animData)
    save(compData, fileInfo).then(fileInfo => {
      console.log('just saved: ', fileInfo)
      this.fileInfo = fileInfo
    })
  },

  startDrawing() {
    const {currentTrackComp} = this
    if (!this.isDrawing) {
      this.lastPos = currentTrackComp.getLocalPenPos(this.pen.position)
      this.isDrawing = true
      currentTrackComp .startLine(this.lastPos)
    }
  },

  handleDraw() {
    const {currentTrackComp} = this
    if (this.isDrawing) {
      const {pen, distThresh, lastPos, currentTrackComp} = this,
            currentPos = currentTrackComp.getLocalPenPos(pen.position),
            distToLastPos = lastPos.distanceTo(currentPos)
      if (distToLastPos > distThresh) {
        currentTrackComp.addToLine(currentPos)
        this.lastPos = currentPos
      }
    }
  },

  stopDrawing() {
    const {currentTrackComp} = this
    if (this.isDrawing) {
      this.isDrawing = false
      currentTrackComp.finishLine(currentTrackComp.getLocalPenPos(this.pen.position))
      if (this.autoNext) this.handleSecondaryRightOn()
      if (this.autoPrev) this.handleSecondaryLeftOn()
    }
  },

  // addAnim(animData) {
  //   const animEnt = document.createElement('a-entity'),
  //         {el} = this

  //   animEnt.setAttribute('anim', {norman: '#norman', animData})
  //   el.appendChild(animEnt)
  // },

  togglePlay() {
    if (this.isAnimPlaying) {
      this.stopPlaying()
    } else {
      this.startPlaying()
    }
  },

  startPlaying() {
    const {el, STARTED_PLAYING} = this
    this.isAnimPlaying = true
    el.emit(STARTED_PLAYING)
  },

  stopPlaying() {
    const {el, STOPPED_PLAYING} = this
    this.isAnimPlaying = false
    el.emit(STOPPED_PLAYING)
  },

  enterFileMode() {
    const {el, ENTERED_FILE_MODE} = this
    this.isFileMode = true
    this.addFileModeListeners()
    el.emit(ENTERED_FILE_MODE)
  },

  exitFileMode() {
    const {el, EXITED_FILE_MODE} = this
    this.removeFileModeListeners()
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









