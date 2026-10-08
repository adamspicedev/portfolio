import * as THREE from 'three'
import { createComputer } from './computer-model'

export type ComputerScene = {
  spin: () => void
  setPaused: (paused: boolean) => void
  dispose: () => void
}
export function mountComputer(
  host: HTMLElement,
  initiallyPaused: boolean,
  onLost: () => void,
): ComputerScene {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setClearColor(0x000000, 0)
  renderer.domElement.setAttribute('aria-hidden', 'true')
  host.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-3.4, 3.4, 3.4, -3.4, 0.1, 100)
  camera.position.set(5.8, 4.5, 8)
  camera.lookAt(0, 1.1, 0.6)
  scene.add(new THREE.HemisphereLight('#ffffff', '#7773b3', 2.6))
  const light = new THREE.DirectionalLight('#ffffff', 4)
  light.position.set(-3, 7, 5)
  light.castShadow = true
  light.shadow.mapSize.set(1024, 1024)
  light.shadow.camera.left = -5
  light.shadow.camera.right = 5
  light.shadow.camera.top = 5
  light.shadow.camera.bottom = -5
  light.shadow.normalBias = 0.035
  scene.add(light)
  const rim = new THREE.DirectionalLight('#bbaaff', 2.5)
  rim.position.set(5, 3, -4)
  scene.add(rim)
  const { group, texture } = createComputer()
  group.rotation.y = -0.25
  scene.add(group)
  const shadowCanvas = document.createElement('canvas')
  shadowCanvas.width = 256
  shadowCanvas.height = 256
  const shadowContext = shadowCanvas.getContext('2d')
  if (shadowContext) {
    const gradient = shadowContext.createRadialGradient(
      128,
      128,
      10,
      128,
      128,
      128,
    )
    gradient.addColorStop(0, 'rgba(108, 86, 161, 0.24)')
    gradient.addColorStop(0.5, 'rgba(108, 86, 161, 0.12)')
    gradient.addColorStop(1, 'rgba(108, 86, 161, 0)')
    shadowContext.fillStyle = gradient
    shadowContext.fillRect(0, 0, 256, 256)
  }
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas)
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 4.5),
    new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
    }),
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.set(0.3, -0.28, 0.7)
  scene.add(floor)

  let paused = initiallyPaused
  let visible = true
  let disposed = false
  let frame = 0
  let time = 0
  let previous = 0
  let pointerX = 0
  let pointerY = 0
  let spinStart: number | undefined
  let spinAngle = 0
  let baseAngle = -0.25
  const render = () => {
    if (!disposed) renderer.render(scene, camera)
  }
  const stop = () => {
    cancelAnimationFrame(frame)
    frame = 0
    previous = 0
  }
  const shouldAnimate = () =>
    visible && !document.hidden && (!paused || spinStart !== undefined)
  function animate(timestamp: number) {
    frame = 0
    if (!shouldAnimate() || disposed) return
    time += previous ? Math.min((timestamp - previous) / 1000, 0.05) : 0
    previous = timestamp
    if (spinStart !== undefined) {
      const progress = Math.min((timestamp - spinStart) / 1300, 1)
      spinAngle = (1 - Math.pow(1 - progress, 3)) * Math.PI * 2
      if (progress >= 1) {
        spinStart = undefined
        spinAngle = 0
      }
    }
    const targetY = baseAngle + pointerX * 0.23
    group.rotation.y = targetY + spinAngle
    group.rotation.x = pointerY * 0.07
    group.position.y = paused ? 0 : Math.sin(time * 1.2) * 0.055
    render()
    if (shouldAnimate()) frame = requestAnimationFrame(animate)
  }
  function start() {
    if (!frame && !disposed && shouldAnimate())
      frame = requestAnimationFrame(animate)
  }
  function resize() {
    const { width, height } = host.getBoundingClientRect()
    if (!width || !height) return
    renderer.setSize(width, height, false)
    const aspect = width / height
    const scale = aspect < 1 ? 3.2 / aspect : 3.2
    camera.left = -scale * aspect
    camera.right = scale * aspect
    camera.top = scale
    camera.bottom = -scale
    camera.updateProjectionMatrix()
    render()
  }
  function pointerMove(event: PointerEvent) {
    if (paused || event.pointerType === 'touch') return
    const bounds = host.getBoundingClientRect()
    pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
    pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2
  }
  function pointerLeave() {
    pointerX = 0
    pointerY = 0
  }
  function visibility() {
    if (document.hidden) stop()
    else start()
  }
  function contextLost(event: Event) {
    event.preventDefault()
    stop()
    onLost()
  }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(host)
  const intersection = new IntersectionObserver(
    ([entry]) => {
      visible = entry?.isIntersecting ?? false
      if (visible) start()
      else stop()
    },
    { threshold: 0.05 },
  )
  intersection.observe(host)
  host.addEventListener('pointermove', pointerMove)
  host.addEventListener('pointerleave', pointerLeave)
  renderer.domElement.addEventListener('webglcontextlost', contextLost)
  document.addEventListener('visibilitychange', visibility)
  resize()
  start()
  return {
    spin() {
      if (paused) {
        baseAngle += Math.PI / 4
        group.rotation.y = baseAngle
        render()
      } else {
        spinStart = performance.now()
        start()
      }
    },
    setPaused(value) {
      paused = value
      if (paused) {
        spinStart = undefined
        spinAngle = 0
        pointerX = 0
        pointerY = 0
        group.position.y = 0
        group.rotation.set(0, baseAngle, 0)
        stop()
        render()
      } else start()
    },
    dispose() {
      disposed = true
      stop()
      resizeObserver.disconnect()
      intersection.disconnect()
      host.removeEventListener('pointermove', pointerMove)
      host.removeEventListener('pointerleave', pointerLeave)
      renderer.domElement.removeEventListener('webglcontextlost', contextLost)
      document.removeEventListener('visibilitychange', visibility)
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material]
          materials.forEach((material) => material.dispose())
        }
      })
      texture.dispose()
      shadowTexture.dispose()
      light.shadow.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    },
  }
}
