import React from 'react'
import { useAnimini } from '@animini/three'
import { useControls, button } from 'leva'
import { Canvas } from 'react-three-fiber'
import { OrbitControls } from '@react-three/drei'

import * as THREE from 'three'

const torusknot = new THREE.TorusKnotBufferGeometry(3, 0.8, 256, 16)

const Mesh = () => {
  const [mat, apiMat] = useAnimini()
  const [ref, api] = useAnimini()
  useControls({
    changeColor: button(() => apiMat.start({ color: '#f00' })),
    changeScale: button(() => api.start({ scale: { x: 2, y: 1, z: 2 } })),
  })
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
      style={{ background: 'dimgray', height: '100vh', width: '100vw' }}>
      <OrbitControls />
      <directionalLight />
      <Mesh />
    </Canvas>
  )
}