import _ from 'lodash'


export default (anim) => {

  const {el} = anim,
        geometry = new THREE.Geometry(),
        material = new THREE.LineBasicMaterial({
          color: 'black',
          linewidth: 1,
          scale: 1,
          transparent: true,
          opacity: 0.5,
        })

  geometry.vertices = [
    {x: 0, y: 0, z: 0},
    {x: 0.01, y: 0, z: 0},
    
    {x: -0.01, y: 0, z: 0},
    {x: 0, y: 0, z: 0},
    {x: 0, y: 0.01, z: 0},
    {x: 0, y: 0, z: 0},
    {x: 0, y: -0.01, z: 0},
    {x: 0, y: 0, z: 0},
    {x: 0, y: 0, z: 0.01},
    {x: 0, y: 0, z: 0},
    {x: 0, y: 0, z: -0.01},
  ]

  const mesh = new THREE.LineSegments(geometry, material)
  el.object3D.add(mesh)

}
