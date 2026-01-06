import { gsap } from './gsap.config'

type AnimationTarget = HTMLElement | null

export const hoverPresets = {
  // 缩放悬停
  scaleHover: (element: AnimationTarget) => {
    if (!element) return () => {}

    const handleEnter = () => {
      gsap.to(element, { scale: 1.05, duration: 0.3, ease: 'power2.out' })
    }

    const handleLeave = () => {
      gsap.to(element, { scale: 1, duration: 0.3, ease: 'power2.out' })
    }

    element.addEventListener('mouseenter', handleEnter)
    element.addEventListener('mouseleave', handleLeave)

    return () => {
      element.removeEventListener('mouseenter', handleEnter)
      element.removeEventListener('mouseleave', handleLeave)
    }
  },

  // 发光悬停
  glowHover: (element: AnimationTarget, color = 'rgba(255, 200, 100, 0.5)') => {
    if (!element) return () => {}

    const handleEnter = () => {
      gsap.to(element, {
        boxShadow: `0 0 30px ${color}`,
        duration: 0.3,
      })
    }

    const handleLeave = () => {
      gsap.to(element, {
        boxShadow: '0 0 0px rgba(255, 200, 100, 0)',
        duration: 0.3,
      })
    }

    element.addEventListener('mouseenter', handleEnter)
    element.addEventListener('mouseleave', handleLeave)

    return () => {
      element.removeEventListener('mouseenter', handleEnter)
      element.removeEventListener('mouseleave', handleLeave)
    }
  },

  // 3D 倾斜效果
  tiltHover: (element: AnimationTarget, intensity = 10) => {
    if (!element) return () => {}

    const handleMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const rotateX = (y - centerY) / intensity
      const rotateY = (centerX - x) / intensity

      gsap.to(element, {
        rotateX,
        rotateY,
        duration: 0.3,
        ease: 'power2.out',
        transformPerspective: 1000,
      })
    }

    const handleLeave = () => {
      gsap.to(element, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: 'power2.out',
      })
    }

    element.addEventListener('mousemove', handleMove)
    element.addEventListener('mouseleave', handleLeave)

    return () => {
      element.removeEventListener('mousemove', handleMove)
      element.removeEventListener('mouseleave', handleLeave)
    }
  },

  // 磁性吸附效果
  magneticHover: (element: AnimationTarget, strength = 0.3) => {
    if (!element) return () => {}

    const handleMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2

      gsap.to(element, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    const handleLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)',
      })
    }

    element.addEventListener('mousemove', handleMove)
    element.addEventListener('mouseleave', handleLeave)

    return () => {
      element.removeEventListener('mousemove', handleMove)
      element.removeEventListener('mouseleave', handleLeave)
    }
  },

  // 边框动画
  borderHover: (element: AnimationTarget) => {
    if (!element) return () => {}

    const handleEnter = () => {
      gsap.to(element, {
        borderColor: 'var(--color-primary-500)',
        duration: 0.3,
      })
    }

    const handleLeave = () => {
      gsap.to(element, {
        borderColor: 'var(--color-neutral-200)',
        duration: 0.3,
      })
    }

    element.addEventListener('mouseenter', handleEnter)
    element.addEventListener('mouseleave', handleLeave)

    return () => {
      element.removeEventListener('mouseenter', handleEnter)
      element.removeEventListener('mouseleave', handleLeave)
    }
  },

  // 颜色变化
  colorHover: (element: AnimationTarget, hoverColor = 'var(--color-primary-500)') => {
    if (!element) return () => {}

    const originalColor = getComputedStyle(element).color

    const handleEnter = () => {
      gsap.to(element, { color: hoverColor, duration: 0.3 })
    }

    const handleLeave = () => {
      gsap.to(element, { color: originalColor, duration: 0.3 })
    }

    element.addEventListener('mouseenter', handleEnter)
    element.addEventListener('mouseleave', handleLeave)

    return () => {
      element.removeEventListener('mouseenter', handleEnter)
      element.removeEventListener('mouseleave', handleLeave)
    }
  },

  // 上浮效果
  liftHover: (element: AnimationTarget) => {
    if (!element) return () => {}

    const handleEnter = () => {
      gsap.to(element, {
        y: -5,
        boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    const handleLeave = () => {
      gsap.to(element, {
        y: 0,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    element.addEventListener('mouseenter', handleEnter)
    element.addEventListener('mouseleave', handleLeave)

    return () => {
      element.removeEventListener('mouseenter', handleEnter)
      element.removeEventListener('mouseleave', handleLeave)
    }
  },
}
