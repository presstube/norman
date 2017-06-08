
import _ from 'lodash'
import $ from 'jquery'

import {save, deleteAnim, loadPrev, loadNext, loadAnimByName} from './firebasestore-multitrack'
import {abstractABXY, setupThumbStickDirectionEvents} from './oculustouchhelpers'
import './anim'

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
    this.selectedTrackEnt = null
    this.selectedTrackComp = null
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
    this.SELECTED_TRACK_CHANGED = 'EXITED_INSERT_MODE'

    this.boundFileNew = this.fileNew.bind(this)
    this.boundFileSave = this.fileSave.bind(this)
    this.boundFileLoadPrev = this.fileLoadPrev.bind(this)

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

  addFileModeListeners() {
    const {primaryHand} = this
    primaryHand.addEventListener('DOWN_ON', this.boundFileSave)
    primaryHand.addEventListener('UP_ON', this.boundFileNew)
    primaryHand.addEventListener('LEFT_ON', this.boundFileLoadPrev)
  },

  removeFileModeListeners() {
    const {primaryHand} = this
    primaryHand.removeEventListener('DOWN_ON', this.boundFileSave)
    primaryHand.removeEventListener('UP_ON', this.boundFileNew)
    primaryHand.removeEventListener('LEFT_ON', this.boundFileLoadPrev)
  },

  // FILE OPS

  fileNew() {
    const {tracks} = this
    this.removeAllTracks()
    this.fileInfo = null
    this.addTrack()
  },

  fileSave() {
    const {tracks, fileInfo} = this
    const compData = tracks.map(track => track.components.anim.animData)
    save({compData}, fileInfo).then(fileInfo => {
      console.log('just saved: ', fileInfo)
      this.fileInfo = fileInfo
    })
  },

  fileLoadPrev() {
    const {fileInfo} = this
    loadPrev(fileInfo).then((data) => {
      console.log('loaded prev: ', data)
    })
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
      this.removeTrack(this.selectedTrackEnt)
    } else {
      this.selectNextTrack()
    }
  },

  handleSecondaryLeftOn() {
    const {isInsertMode, selectedTrackComp, selectedTrackEnt} = this
    this.autoPrev = true
    if (isInsertMode) {
      selectedTrackComp.insertFrameAt('before')
    } else {
      selectedTrackComp.gotoPrevFrame()
    }
  },
 
  handleSecondaryLeftOff() {
    this.autoPrev = false
  },

  handleSecondaryRightOn() {
    const {isInsertMode, selectedTrackComp, selectedTrackEnt} = this
    this.autoNext = true
    if (isInsertMode) {
      selectedTrackComp.insertFrameAt('after')
    } else {
      selectedTrackComp.gotoNextFrame()
    }
  },

  handleSecondaryRightOff() {
    this.autoNext = false
  },

  handleSecondaryThumbstickDown() {
    const {isInsertMode, selectedTrackComp} = this
    if (isInsertMode) selectedTrackComp.removeFrame()
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
    this.setSelectedTrack(animEnt)
    tracks.push(animEnt)
  },

  removeTrack(track) {
    const {el, tracks} = this

    _.remove(tracks, track)
    el.removeChild(track)

    // this is not good.. think of a better way
    this.setSelectedTrack(_.last(tracks))
  },

  removeAllTracks() {
    const {el, tracks} = this
    tracks.forEach(track => el.removeChild(track))
    this.tracks = []
    this.setSelectedTrack(null)
  },

  setSelectedTrack(trackEnt) {
    const {el, SELECTED_TRACK_CHANGED} = this
    if (trackEnt) {
      this.selectedTrackEnt = trackEnt
      this.selectedTrackComp = trackEnt.components.anim
    } else {
      this.selectedTrackEnt = null
      this.selectedTrackComp = null
    }
    el.emit(SELECTED_TRACK_CHANGED)
  },

  selectPrevTrack() {
    const {selectedTrackEnt, tracks} = this
    let index = _.findIndex(tracks, selectedTrackEnt)

    if (index - 1 === -1) {
      index = tracks.length - 1
    } else {
      index = index - 1
    }

    this.setSelectedTrack(tracks[index])
  },

  selectNextTrack() {
    const {selectedTrackEnt, tracks} = this
    let index = _.findIndex(tracks, selectedTrackEnt)

    if (index + 1 === tracks.length) {
      index = 0
    } else {
      index = index + 1
    }
    this.setSelectedTrack(tracks[index])
  },

  startDrawing() {
    const {selectedTrackComp} = this
    if (!this.isDrawing) {
      this.lastPos = selectedTrackComp.getLocalPenPos(this.pen.position)
      this.isDrawing = true
      selectedTrackComp .startLine(this.lastPos)
    }
  },

  handleDraw() {
    const {selectedTrackComp} = this
    if (this.isDrawing) {
      const {pen, distThresh, lastPos, selectedTrackComp} = this,
            currentPos = selectedTrackComp.getLocalPenPos(pen.position),
            distToLastPos = lastPos.distanceTo(currentPos)
      if (distToLastPos > distThresh) {
        selectedTrackComp.addToLine(currentPos)
        this.lastPos = currentPos
      }
    }
  },

  stopDrawing() {
    const {selectedTrackComp} = this
    if (this.isDrawing) {
      this.isDrawing = false
      selectedTrackComp.finishLine(selectedTrackComp.getLocalPenPos(this.pen.position))
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









