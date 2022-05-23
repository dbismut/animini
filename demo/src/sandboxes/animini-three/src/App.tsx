import { useAnimini } from '@animini/three'
import { useControls, button } from 'leva'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useEffect } from 'react'

const torusknot = new THREE.TorusKnotBufferGeometry(3, 0.8, 256, 16)

const Mesh = () => {
  const [mat, apiMat] = useAnimini<THREE.MeshPhysicalMaterial>()

  const [ref, api] = useAnimini<THREE.Mesh>()
  useControls({
    changeColor: button(() => apiMat.start({ color: '#f00' })),
    changeScale: button(() => api.start({ scale: { x: 2, y: 1, z: 2 } })),
    changeRotation: button(() => api.start({ rotation: { x: 2, y: 1, z: 2 } }))
  })

  useEffect(() => {
    console.log(mat)
  }, [])

  return (
    <mesh ref={ref} geometry={torusknot}>
      <meshPhysicalMaterial ref={mat} attach="material" flatShading />
    </mesh>
  )
}

export default function App() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 16], fov: 50 }}
      style={{ background: 'dimgray', height: '100vh', width: '100vw' }}
    >
      <OrbitControls />
      <directionalLight />
      <Mesh />
    </Canvas>
  )
}
