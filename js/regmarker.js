import _ from 'lodash'


export default (target, color = 'red') => {


  console.log('WHAAA: ', target)

  const geometry = new THREE.Geometry(),
        material = new THREE.LineBasicMaterial({
          color,
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
  target.add(mesh)

  return mesh

}
