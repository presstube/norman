// import 'aframe'

AFRAME.registerComponent('line', {

  schema: {
    lineData: {type: 'array'},
    color: {type: 'string', default: 'black'},
    style: {type: 'string', default: 'solid'},
    opacity: {type: 'number', default: 1}
  },

  init() {
    var material
    var lineMesh
    var geometry = new THREE.Geometry()
    geometry.vertices = this.data.lineData
    if (this.data.style == 'solid') {
      material = new THREE.LineBasicMaterial({ 
        color: this.data.color,
        transparent: this.data.opacity != 1 ? true : false,
        opacity: this.data.opacity
      })
      lineMesh = new THREE.Line(geometry, material)
    } else if (this.data.style == 'dashed') {
      material = new THREE.LineDashedMaterial({ 
        color: this.data.color,
        linewidth: 1,
        scale: 1,
        dashSize: 3,
        gapSize: 1,
        transparent: this.data.opacity != 1 ? true : false,
        opacity: this.data.opacity
      })
      lineMesh = new THREE.LineSegments(geometry, material)
    }
    this.el.setObject3D('line', lineMesh)
  },

})