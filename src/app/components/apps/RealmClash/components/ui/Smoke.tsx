import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

const SmokeAura: React.FC<{ src: string; intensity?: number }> = ({
  src,
  intensity = 1,
}) => {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let camera: THREE.PerspectiveCamera,
      scene: THREE.Scene,
      renderer: THREE.WebGLRenderer,
      smokeParticles: THREE.Mesh[],
      clock: THREE.Clock

    function init() {
      clock = new THREE.Clock()

      renderer = new THREE.WebGLRenderer()
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setClearColor(0x000000, 0)

      scene = new THREE.Scene()

      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        1,
        10000
      )
      camera.position.z = 1000
      scene.add(camera)

      // Character (plane with image)
      const characterTexture = new THREE.TextureLoader().load(src)
      const characterMaterial = new THREE.MeshBasicMaterial({
        map: characterTexture,
        transparent: true,
      })
      const characterGeo = new THREE.PlaneGeometry(200, 200)
      const character = new THREE.Mesh(characterGeo, characterMaterial)
      character.position.set(0, 0, 0)
      scene.add(character)

      // Light
      const light = new THREE.DirectionalLight(0xffffff, 0.5)
      light.position.set(-1, 0, 1)
      scene.add(light)

      // Smoke texture for aura
      const smokeTexture = new THREE.TextureLoader().load(
        'https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png'
      )
      const smokeMaterial = new THREE.MeshLambertMaterial({
        color: 0x00dddd,
        map: smokeTexture,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      })
      const smokeGeo = new THREE.PlaneGeometry(300, 300)

      // Create smoke particles for aura
      smokeParticles = []
      const particleCount = 200
      for (let p = 0; p < particleCount; p++) {
        const particle = new THREE.Mesh(smokeGeo, smokeMaterial)
        const angle = (p / particleCount) * Math.PI * 2
        const radius = 300 + Math.random() * 100
        const height = Math.random() * 100 - 50
        particle.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius + height,
          0
        )
        particle.rotation.z = Math.random() * Math.PI * 2
        particle.scale.set(
          0.5 + Math.random() * 0.5,
          0.5 + Math.random() * 0.5,
          1
        )
        scene.add(particle)
        smokeParticles.push(particle)
      }

      if (mountRef.current) {
        mountRef.current.appendChild(renderer.domElement)
      }

      window.addEventListener('resize', onWindowResize, false)
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    function animate() {
      requestAnimationFrame(animate)
      const delta = clock.getDelta()
      evolveSmoke(delta)
      render()
    }

    function evolveSmoke(delta: number) {
      const particleCount = smokeParticles.length
      for (let sp = 0; sp < particleCount; sp++) {
        const particle = smokeParticles[sp]
        const angle = (sp / particleCount) * Math.PI * 2
        const radius =
          300 + Math.sin(Date.now() * 0.001 + angle) * 50 * intensity
        const height = Math.sin(Date.now() * 0.002 + sp * 0.1) * 50
        particle.position.x = Math.cos(angle) * radius
        particle.position.y = Math.sin(angle) * radius + height
        particle.rotation.z += delta * 0.2 * intensity
        if (
          particle.material &&
          typeof particle.material === 'object' &&
          'opacity' in particle.material
        ) {
          particle.material.opacity =
            0.6 + Math.sin(Date.now() * 0.003 + sp * 0.2) * 0.2
        }
        particle.scale.set(
          0.5 + Math.sin(Date.now() * 0.004 + sp * 0.3) * 0.1 * intensity,
          0.5 + Math.sin(Date.now() * 0.004 + sp * 0.3) * 0.1 * intensity,
          1
        )
      }
    }

    function render() {
      renderer.render(scene, camera)
    }

    init()
    animate()

    return () => {
      // Cleanup
      if (
        mountRef.current &&
        renderer.domElement.parentNode === mountRef.current
      ) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
      scene.clear()
      window.removeEventListener('resize', onWindowResize)
    }
  }, [src, intensity])

  return <div ref={mountRef} className="w-full h-full" />
}

export default SmokeAura
