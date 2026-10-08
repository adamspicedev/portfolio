import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

export function createComputer() {
  const group = new THREE.Group()
  const shell = new THREE.MeshStandardMaterial({
    color: '#dad4f6',
    roughness: 0.55,
  })
  const pale = new THREE.MeshStandardMaterial({
    color: '#faf8ff',
    roughness: 0.5,
  })
  const orange = new THREE.MeshStandardMaterial({
    color: '#ff784f',
    roughness: 0.4,
  })
  const blue = new THREE.MeshStandardMaterial({
    color: '#2835e7',
    roughness: 0.45,
  })
  const dark = new THREE.MeshStandardMaterial({
    color: '#191938',
    roughness: 0.8,
  })
  const pink = new THREE.MeshStandardMaterial({
    color: '#ffd7e8',
    roughness: 0.45,
  })
  function box(
    size: [number, number, number],
    position: [number, number, number],
    material: THREE.Material,
    radius = 0.08,
  ) {
    const mesh = new THREE.Mesh(
      new RoundedBoxGeometry(...size, 3, radius),
      material,
    )
    mesh.position.set(...position)
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add(mesh)
    return mesh
  }
  box([3.15, 2.5, 1.15], [0, 1.7, 0], shell, 0.18)
  box([2.82, 2.13, 0.12], [0, 1.78, 0.59], pale, 0.15)
  box([2.4, 1.58, 0.1], [0, 1.9, 0.69], dark, 0.14)
  box([0.42, 0.44, 0.65], [0, 0.38, -0.1], shell)
  box([2.5, 0.2, 1.35], [0, 0.07, 0], shell)
  box([2.9, 0.27, 1.04], [0, -0.11, 1.4], shell)
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 10; col++) {
      const material = row === 0 && col === 0 ? orange : col === 9 ? pink : pale
      box(
        [0.21, 0.12, 0.16],
        [-1.22 + col * 0.27, 0.08, 1.04 + row * 0.21],
        material,
        0.025,
      )
    }
  }
  box([1.16, 0.12, 0.14], [0, 0.08, 1.91], pale, 0.025)
  box([0.18, 0.075, 0.045], [1.07, 0.91, 0.68], orange, 0.015)
  for (let i = 0; i < 5; i++)
    box([0.26, 0.025, 0.022], [-1.05, 0.88 + i * 0.065, 0.68], shell, 0.005)
  box([0.13, 0.07, 0.025], [-0.53, 0.91, 0.68], blue, 0.01)
  const mouse = box([0.51, 0.27, 0.8], [1.95, -0.08, 1.4], orange, 0.12)
  mouse.rotation.y = -0.15
  box([0.022, 0.014, 0.3], [1.95, 0.065, 1.27], dark, 0.005)

  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 640
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas unavailable')
  context.fillStyle = '#2835e7'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#ffd7e8'
  context.fillRect(38, 36, 948, 54)
  context.fillStyle = '#191938'
  context.font = '22px monospace'
  context.fillText('SPICEY OS', 64, 72)
  context.fillText('—  □  ×', 830, 72)
  context.fillStyle = '#f5efff'
  context.font = 'bold 73px monospace'
  context.fillText('HELLO,', 80, 238)
  context.fillText('WORLD_', 80, 324)
  context.font = '27px monospace'
  context.fillText('I MAKE THINGS FOR THE WEB.', 82, 411)
  context.fillStyle = '#ff9b77'
  context.fillRect(82, 464, 282, 56)
  context.fillStyle = '#191938'
  context.font = '23px monospace'
  context.fillText("LET'S BUILD →", 108, 501)
  for (let i = 0; i < 7; i++) {
    context.fillStyle = i % 2 === 0 ? '#8d99ff' : '#bac2ff'
    context.fillRect(730 + Math.sin(i) * 35, 177 + i * 42, 110, 26)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(2.27, 1.44),
    new THREE.MeshBasicMaterial({ map: texture }),
  )
  screen.position.set(0, 1.9, 0.749)
  group.add(screen)
  return { group, texture }
}
