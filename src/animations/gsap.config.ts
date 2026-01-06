import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'

// 注册 GSAP 插件
gsap.registerPlugin(ScrollTrigger, CustomEase)

// 自定义缓动函数
CustomEase.create('smoothOut', 'M0,0 C0.25,0.1 0.25,1 1,1')
CustomEase.create('bounceOut', 'M0,0 C0.5,1.5 0.75,1 1,1')
CustomEase.create('elastic', 'M0,0 C0.5,1.8 0.75,0.9 1,1')
CustomEase.create('dramatic', 'M0,0 C0.7,0 0.3,1 1,1')

// 全局默认配置
gsap.defaults({
  duration: 0.8,
  ease: 'smoothOut',
})

// 性能配置
gsap.config({
  force3D: true,
  nullTargetWarn: false,
})

export { gsap, ScrollTrigger, CustomEase }
