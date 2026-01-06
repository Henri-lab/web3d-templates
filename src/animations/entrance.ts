import { gsap } from './gsap.config'

type AnimationTarget = HTMLElement | string | null

export const entrancePresets = {
  // 淡入上移
  fadeInUp: (element: AnimationTarget, options = {}) => {
    if (!element) return null
    return gsap.from(element, {
      opacity: 0,
      y: 60,
      duration: 0.8,
      ease: 'smoothOut',
      ...options,
    })
  },

  // 淡入缩放
  fadeInScale: (element: AnimationTarget, options = {}) => {
    if (!element) return null
    return gsap.from(element, {
      opacity: 0,
      scale: 0.8,
      duration: 0.6,
      ease: 'back.out(1.7)',
      ...options,
    })
  },

  // 从左侧滑入
  slideInLeft: (element: AnimationTarget, options = {}) => {
    if (!element) return null
    return gsap.from(element, {
      opacity: 0,
      x: -100,
      duration: 0.7,
      ease: 'power3.out',
      ...options,
    })
  },

  // 从右侧滑入
  slideInRight: (element: AnimationTarget, options = {}) => {
    if (!element) return null
    return gsap.from(element, {
      opacity: 0,
      x: 100,
      duration: 0.7,
      ease: 'power3.out',
      ...options,
    })
  },

  // 弹性缩放
  popIn: (element: AnimationTarget, options = {}) => {
    if (!element) return null
    return gsap.from(element, {
      opacity: 0,
      scale: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)',
      ...options,
    })
  },

  // 旋转入场
  rotateIn: (element: AnimationTarget, options = {}) => {
    if (!element) return null
    return gsap.from(element, {
      opacity: 0,
      rotation: -180,
      scale: 0.5,
      duration: 0.8,
      ease: 'back.out(1.7)',
      ...options,
    })
  },

  // 模糊淡入
  blurIn: (element: AnimationTarget, options = {}) => {
    if (!element) return null
    return gsap.from(element, {
      opacity: 0,
      filter: 'blur(20px)',
      duration: 0.8,
      ease: 'power2.out',
      ...options,
    })
  },

  // 文字逐字显示
  textReveal: (element: AnimationTarget, options = {}) => {
    const target = typeof element === 'string' ? document.querySelector(element) : element
    if (!target) return null

    const text = target.textContent || ''
    target.innerHTML = text
      .split('')
      .map((char) => `<span class="char">${char === ' ' ? '&nbsp;' : char}</span>`)
      .join('')

    return gsap.from(target.querySelectorAll('.char'), {
      opacity: 0,
      y: 20,
      stagger: 0.03,
      duration: 0.4,
      ease: 'power2.out',
      ...options,
    })
  },

  // 分组交错入场
  staggerIn: (elements: AnimationTarget, options = {}) => {
    if (!elements) return null
    return gsap.from(elements, {
      opacity: 0,
      y: 40,
      stagger: {
        amount: 0.6,
        from: 'start',
      },
      duration: 0.6,
      ease: 'power3.out',
      ...options,
    })
  },
}

// 退场动画
export const exitPresets = {
  fadeOutDown: (element: AnimationTarget, options = {}) => {
    if (!element) return null
    return gsap.to(element, {
      opacity: 0,
      y: 60,
      duration: 0.5,
      ease: 'power2.in',
      ...options,
    })
  },

  fadeOutScale: (element: AnimationTarget, options = {}) => {
    if (!element) return null
    return gsap.to(element, {
      opacity: 0,
      scale: 0.8,
      duration: 0.4,
      ease: 'power2.in',
      ...options,
    })
  },

  slideOutLeft: (element: AnimationTarget, options = {}) => {
    if (!element) return null
    return gsap.to(element, {
      opacity: 0,
      x: -100,
      duration: 0.5,
      ease: 'power3.in',
      ...options,
    })
  },

  slideOutRight: (element: AnimationTarget, options = {}) => {
    if (!element) return null
    return gsap.to(element, {
      opacity: 0,
      x: 100,
      duration: 0.5,
      ease: 'power3.in',
      ...options,
    })
  },
}
