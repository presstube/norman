// import 'aframe'
import _ from 'lodash'


AFRAME.registerComponent('linemeshline', {

  schema: {
    lineData: {type: 'array'},
    color: {type: 'string', default: 'black'},
    style: {type: 'string', default: 'solid'},
    opacity: {type: 'number', default: 1}
  },

  init() {
      const {lineData} = this.data,
            geometry = new THREE.Geometry(),
            line = new MeshLine(),
            material = new MeshLineMaterial({
              sizeAttenuation: true,
              lineWidth: 0.001})

      _.each(lineData, point => geometry.vertices.push(point))
      line.setGeometry(geometry)
      const mesh = new THREE.Mesh(line.geometry, material)
      this.el.setObject3D('line', mesh)

  },

})