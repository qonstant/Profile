"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export function SphericalNetwork() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    group: THREE.Group
    pointCloud: THREE.Points
    linesMesh: THREE.LineSegments
    particlePositions: Float32Array
    positions: Float32Array
    colors: Float32Array
    particlesData: { velocity: THREE.Vector3; numConnections: number }[]
    isDragging: boolean
    previousMousePosition: { x: number; y: number }
    rotationVelocity: { x: number; y: number }
    targetRotationDelta: { x: number; y: number }
    currentRotationDelta: { x: number; y: number }
    animationId: number
  } | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const maxParticleCount = 500
    const particleCount = 500
    const sphereRadius = 400
    const animationSpeed = 1.0
    const damping = 0.92
    const smoothing = 0.15
    const config = {
      minDistance: 200,
      maxConnections: 10,
    }

    // Scene setup
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x000000, 0.0008)

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      1,
      4000
    )
    camera.position.z = 1000

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    const group = new THREE.Group()
    scene.add(group)

    // Sphere wireframe
    const sphereGeom = new THREE.SphereGeometry(sphereRadius, 32, 32)
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x1a1a1a,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    })
    const sphereMesh = new THREE.Mesh(sphereGeom, sphereMat)
    group.add(sphereMesh)

    // Particles
    const particlePositions = new Float32Array(maxParticleCount * 3)
    const particlesData: { velocity: THREE.Vector3; numConnections: number }[] = []

    for (let i = 0; i < maxParticleCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      const x = sphereRadius * Math.sin(phi) * Math.cos(theta)
      const y = sphereRadius * Math.sin(phi) * Math.sin(theta)
      const z = sphereRadius * Math.cos(phi)

      particlePositions[i * 3] = x
      particlePositions[i * 3 + 1] = y
      particlePositions[i * 3 + 2] = z

      const pos = new THREE.Vector3(x, y, z)
      const randomDir = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize()

      const velocity = randomDir.cross(pos).normalize().multiplyScalar(0.3)

      particlesData.push({
        velocity,
        numConnections: 0,
      })
    }

    const particles = new THREE.BufferGeometry()
    particles.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3).setUsage(THREE.DynamicDrawUsage)
    )
    particles.setDrawRange(0, particleCount)

    const pMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 5,
      blending: THREE.AdditiveBlending,
      transparent: true,
      sizeAttenuation: false,
    })

    const pointCloud = new THREE.Points(particles, pMaterial)
    group.add(pointCloud)

    // Lines
    const segments = maxParticleCount * maxParticleCount
    const positions = new Float32Array(segments * 3)
    const colors = new Float32Array(segments * 3)

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage)
    )
    geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage)
    )
    geometry.setDrawRange(0, 0)

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
    })

    const linesMesh = new THREE.LineSegments(geometry, material)
    group.add(linesMesh)

    // Mouse controls state
    let isDragging = false
    let previousMousePosition = { x: 0, y: 0 }
    let rotationVelocity = { x: 0, y: 0 }
    let targetRotationDelta = { x: 0, y: 0 }
    let currentRotationDelta = { x: 0, y: 0 }

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true
      previousMousePosition = { x: e.clientX, y: e.clientY }
      rotationVelocity = { x: 0, y: 0 }
      targetRotationDelta = { x: 0, y: 0 }
      currentRotationDelta = { x: 0, y: 0 }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x
        const deltaY = e.clientY - previousMousePosition.y
        const rotationSpeed = 0.005

        targetRotationDelta.x = deltaY * rotationSpeed
        targetRotationDelta.y = deltaX * rotationSpeed
        rotationVelocity.x = deltaY * rotationSpeed * 0.8
        rotationVelocity.y = deltaX * rotationSpeed * 0.8

        previousMousePosition = { x: e.clientX, y: e.clientY }
      }
    }

    const handleMouseUp = () => {
      isDragging = false
      targetRotationDelta = { x: 0, y: 0 }
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      camera.position.z += e.deltaY * 0.5
      camera.position.z = Math.max(600, Math.min(2000, camera.position.z))
    }

    // Touch controls
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true
        previousMousePosition = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        }
        rotationVelocity = { x: 0, y: 0 }
        targetRotationDelta = { x: 0, y: 0 }
        currentRotationDelta = { x: 0, y: 0 }
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - previousMousePosition.x
        const deltaY = e.touches[0].clientY - previousMousePosition.y
        const rotationSpeed = 0.005

        targetRotationDelta.x = deltaY * rotationSpeed
        targetRotationDelta.y = deltaX * rotationSpeed
        rotationVelocity.x = deltaY * rotationSpeed * 0.8
        rotationVelocity.y = deltaX * rotationSpeed * 0.8

        previousMousePosition = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        }
      }
    }

    const handleTouchEnd = () => {
      isDragging = false
      targetRotationDelta = { x: 0, y: 0 }
    }

    container.addEventListener("mousedown", handleMouseDown)
    container.addEventListener("mousemove", handleMouseMove)
    container.addEventListener("mouseup", handleMouseUp)
    container.addEventListener("mouseleave", handleMouseUp)
    container.addEventListener("wheel", handleWheel, { passive: false })
    container.addEventListener("touchstart", handleTouchStart)
    container.addEventListener("touchmove", handleTouchMove)
    container.addEventListener("touchend", handleTouchEnd)

    // Animation
    let animationId: number

    const animate = () => {
      animationId = requestAnimationFrame(animate)

      let vertexpos = 0
      let colorpos = 0
      let numConnected = 0

      for (let i = 0; i < particleCount; i++) {
        particlesData[i].numConnections = 0
      }

      // Animate particles
      for (let i = 0; i < particleCount; i++) {
        const particleData = particlesData[i]

        particlePositions[i * 3] += particleData.velocity.x * animationSpeed
        particlePositions[i * 3 + 1] += particleData.velocity.y * animationSpeed
        particlePositions[i * 3 + 2] += particleData.velocity.z * animationSpeed

        const currentRadius = Math.sqrt(
          particlePositions[i * 3] ** 2 +
            particlePositions[i * 3 + 1] ** 2 +
            particlePositions[i * 3 + 2] ** 2
        )

        const scale = sphereRadius / currentRadius
        particlePositions[i * 3] *= scale
        particlePositions[i * 3 + 1] *= scale
        particlePositions[i * 3 + 2] *= scale

        const pos = new THREE.Vector3(
          particlePositions[i * 3],
          particlePositions[i * 3 + 1],
          particlePositions[i * 3 + 2]
        )

        const vel = particleData.velocity
        const radialComponent = vel.dot(pos) / (sphereRadius * sphereRadius)
        vel.x -= radialComponent * pos.x
        vel.y -= radialComponent * pos.y
        vel.z -= radialComponent * pos.z
        vel.normalize().multiplyScalar(0.3)
      }

      // Check connections
      for (let i = 0; i < particleCount; i++) {
        const particleData = particlesData[i]

        if (particleData.numConnections >= config.maxConnections) continue

        for (let j = i + 1; j < particleCount; j++) {
          const particleDataB = particlesData[j]

          if (particleDataB.numConnections >= config.maxConnections) continue

          const dx = particlePositions[i * 3] - particlePositions[j * 3]
          const dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1]
          const dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2]
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

          if (dist < config.minDistance) {
            particleData.numConnections++
            particleDataB.numConnections++

            const alpha = 1.0 - dist / config.minDistance

            positions[vertexpos++] = particlePositions[i * 3]
            positions[vertexpos++] = particlePositions[i * 3 + 1]
            positions[vertexpos++] = particlePositions[i * 3 + 2]

            positions[vertexpos++] = particlePositions[j * 3]
            positions[vertexpos++] = particlePositions[j * 3 + 1]
            positions[vertexpos++] = particlePositions[j * 3 + 2]

            colors[colorpos++] = alpha * 0.5
            colors[colorpos++] = alpha
            colors[colorpos++] = alpha * 0.8

            colors[colorpos++] = alpha * 0.5
            colors[colorpos++] = alpha
            colors[colorpos++] = alpha * 0.8

            numConnected++
          }
        }
      }

      linesMesh.geometry.setDrawRange(0, numConnected * 2)
      linesMesh.geometry.attributes.position.needsUpdate = true
      linesMesh.geometry.attributes.color.needsUpdate = true
      pointCloud.geometry.attributes.position.needsUpdate = true

      // Rotation handling
      if (isDragging) {
        currentRotationDelta.x += (targetRotationDelta.x - currentRotationDelta.x) * smoothing
        currentRotationDelta.y += (targetRotationDelta.y - currentRotationDelta.y) * smoothing

        const quaternionY = new THREE.Quaternion()
        quaternionY.setFromAxisAngle(new THREE.Vector3(0, 1, 0), currentRotationDelta.y)

        const quaternionX = new THREE.Quaternion()
        const axis = new THREE.Vector3(1, 0, 0)
        axis.applyQuaternion(camera.quaternion)
        quaternionX.setFromAxisAngle(axis, currentRotationDelta.x)

        group.quaternion.multiplyQuaternions(quaternionY, group.quaternion)
        group.quaternion.multiplyQuaternions(quaternionX, group.quaternion)
        group.quaternion.normalize()
      } else if (Math.abs(rotationVelocity.x) > 0.0001 || Math.abs(rotationVelocity.y) > 0.0001) {
        const quaternionY = new THREE.Quaternion()
        quaternionY.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotationVelocity.y)

        const quaternionX = new THREE.Quaternion()
        const axis = new THREE.Vector3(1, 0, 0)
        axis.applyQuaternion(camera.quaternion)
        quaternionX.setFromAxisAngle(axis, rotationVelocity.x)

        group.quaternion.multiplyQuaternions(quaternionY, group.quaternion)
        group.quaternion.multiplyQuaternions(quaternionX, group.quaternion)
        group.quaternion.normalize()

        rotationVelocity.x *= damping
        rotationVelocity.y *= damping
      } else {
        const autoRotQuat = new THREE.Quaternion()
        autoRotQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.002)
        group.quaternion.multiplyQuaternions(autoRotQuat, group.quaternion)
      }

      renderer.render(scene, camera)
    }

    animate()

    // Resize handler
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }

    window.addEventListener("resize", handleResize)

    // Store refs for cleanup
    sceneRef.current = {
      scene,
      camera,
      renderer,
      group,
      pointCloud,
      linesMesh,
      particlePositions,
      positions,
      colors,
      particlesData,
      isDragging,
      previousMousePosition,
      rotationVelocity,
      targetRotationDelta,
      currentRotationDelta,
      animationId,
    }

    return () => {
      cancelAnimationFrame(animationId)
      container.removeEventListener("mousedown", handleMouseDown)
      container.removeEventListener("mousemove", handleMouseMove)
      container.removeEventListener("mouseup", handleMouseUp)
      container.removeEventListener("mouseleave", handleMouseUp)
      container.removeEventListener("wheel", handleWheel)
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
      window.removeEventListener("resize", handleResize)
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-[400px] md:h-[500px] cursor-grab active:cursor-grabbing"
    />
  )
}
