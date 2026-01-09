import { gsap } from './gsap.config'

type AnimationTarget = HTMLElement | string | null

interface ScrollOptions {
  // 这里用 any 简化 ScrollTrigger 配置类型，避免引入额外类型依赖
  scrollTrigger?: any
  [key: string]: unknown
}

export const scrollPresets = {
  // 滚动淡入
  scrollFadeIn: (element: AnimationTarget, options: ScrollOptions = {}) => {
    if (!element) return null
    const { scrollTrigger: scrollTriggerOpts, ...rest } = options

    return gsap.from(element, {
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
        ...scrollTriggerOpts,
      },
      opacity: 0,
      y: 60,
      duration: 0.8,
      ease: 'power2.out',
      ...rest,
    })
  },

  // 视差效果
  parallax: (element: AnimationTarget, options: ScrollOptions & { distance?: number } = {}) => {
    if (!element) return null
    const { scrollTrigger: scrollTriggerOpts, distance = -100, ...rest } = options

    return gsap.to(element, {
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        ...scrollTriggerOpts,
      },
      y: distance,
      ease: 'none',
      ...rest,
    })
  },

  // 水平滚动
  horizontalScroll: (container: AnimationTarget, options: ScrollOptions = {}) => {
    if (!container) return null
    const containerEl = typeof container === 'string' ? document.querySelector(container) : container
    if (!containerEl) return null

    const sections = gsap.utils.toArray(`${container} > *`)
    const { scrollTrigger: scrollTriggerOpts, ...rest } = options

    return gsap.to(sections, {
      xPercent: -100 * (sections.length - 1),
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        pin: true,
        scrub: 1,
        snap: 1 / (sections.length - 1),
        end: () => '+=' + (containerEl as HTMLElement).scrollWidth,
        ...scrollTriggerOpts,
      },
      ...rest,
    })
  },

  // 进度条动画
  progressBar: (element: AnimationTarget) => {
    if (!element) return null
    return gsap.to(element, {
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      },
      scaleX: 1,
      transformOrigin: 'left center',
      ease: 'none',
    })
  },

  // 固定元素渐变
  pinWithFade: (element: AnimationTarget, options: ScrollOptions = {}) => {
    if (!element) return null
    const { scrollTrigger: scrollTriggerOpts, ...rest } = options

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: 'top top',
        end: '+=200%',
        pin: true,
        scrub: 1,
        ...scrollTriggerOpts,
      },
    })

    tl.to(element, { opacity: 1, duration: 0.5, ...rest })
      .to(element, { opacity: 1, duration: 1 })
      .to(element, { opacity: 0, duration: 0.5 })

    return tl
  },

  // 时间轴滚动联动
  timelineScrub: (container: AnimationTarget, items: AnimationTarget) => {
    if (!container || !items) return null
    const elements = typeof items === 'string' ? gsap.utils.toArray(items) : items

    return gsap.to(elements, {
      scrollTrigger: {
        trigger: container,
        start: 'top center',
        end: 'bottom center',
        scrub: 1,
      },
      opacity: 1,
      y: 0,
      stagger: 0.2,
    })
  },

  // 滚动缩放效果
  scrollScale: (element: AnimationTarget, options: ScrollOptions = {}) => {
    if (!element) return null
    const { scrollTrigger: scrollTriggerOpts, ...rest } = options

    return gsap.fromTo(
      element,
      { scale: 0.8, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          end: 'top 50%',
          scrub: 1,
          ...scrollTriggerOpts,
        },
        ...rest,
      }
    )
  },

  // 文字揭示效果
  textRevealOnScroll: (element: AnimationTarget) => {
    if (!element) return null
    const target = typeof element === 'string' ? document.querySelector(element) : element
    if (!target) return null

    const text = target.textContent || ''
    target.innerHTML = text
      .split(' ')
      .map((word) => `<span class="word">${word}</span>`)
      .join(' ')

    return gsap.from(target.querySelectorAll('.word'), {
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        end: 'top 50%',
        scrub: 1,
      },
      opacity: 0,
      y: 20,
      stagger: 0.1,
    })
  },
}
