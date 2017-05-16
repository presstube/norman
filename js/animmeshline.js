// import 'aframe'
import _ from 'lodash'

AFRAME.registerComponent('animmeshline', {

  schema: {
    norman: {type: 'selector'},
    animData: {type: 'array'}
  },

  init() {

    const {animData} = this.data,
          geometry = new THREE.Geometry(),
          line = new MeshLine(),
          material = new MeshLineMaterial({
            lineWidth: 0.001
          })

    _.each(animData, frame => {
      _.each(frame, line => {
        _.each(line, point => {
          // console.log('point: ', point)
          const {x, y, z} = point
          geometry.vertices.push(new THREE.Vector3(x, y, z))
        })
      })
    })
    


    // var geometry = new THREE.Geometry();
    // for( var j = 0; j < Math.PI; j += 2 * Math.PI / 100 ) {
    //   var v = new THREE.Vector3( Math.cos( j ), Math.sin( j ), 0 );
    //   geometry.vertices.push( v );
    // }
    // var line = new MeshLine();

    line.setGeometry( geometry )
    const mesh = new THREE.Mesh( line.geometry, material )
    this.el.setObject3D('mesh', mesh)
  },

  remove() {

  },

  tick(time, timeDelta) {

  },

})
