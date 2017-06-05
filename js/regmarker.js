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
        }),
        length = 0.005

  geometry.vertices = [
    {x: 0, y: 0, z: 0},
    {x: length, y: 0, z: 0},
    {x: 0, y: 0, z: 0},
    {x: -length, y: 0, z: 0},
    {x: 0, y: 0, z: 0},
    {x: 0, y: length, z: 0},
    {x: 0, y: 0, z: 0},
    {x: 0, y: -length, z: 0},
    {x: 0, y: 0, z: 0},
    {x: 0, y: 0, z: length},
    {x: 0, y: 0, z: 0},
    {x: 0, y: 0, z: -length},
  ]

  const mesh = new THREE.LineSegments(geometry, material)
  el.object3D.add(mesh)

  return mesh

}
