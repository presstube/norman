import 'aframe'
import _ from 'lodash'

AFRAME.registerComponent('frame', {

  schema: {
    frameData: {type: 'array'},
    color: {type: 'string', default: 'black'},
    style: {type: 'string', default: 'solid'},
    opacity: {type: 'number', default: 1}
  },

  init() {
    var lineEntities = _.map(this.data.frameData, this.makeLineEntity.bind(this))
  },

  makeLineEntity(lineData) {
    var lineEntity = document.createElement('a-entity');
    this.el.appendChild(lineEntity);
    lineEntity.setAttribute('line', {
      lineData: lineData,
      color: this.data.color,
      style: this.data.style,
      opacity: this.data.opacity
    });
    return lineEntity
  },

})