---
id: qin-unification-demo
title: 秦始皇统一六国
version: 1.0.0
status: published
layer: content
created: 2024-01-05
updated: 2024-01-05
---

#story 秦始皇统一六国
@id: qin-unification
@era: 公元前230年-公元前221年
@dynasty: 秦朝
@duration: 15min
@difficulty: medium
@thumbnail: /images/qin-unification.jpg
@tags: [古代史, 秦朝, 统一, 战国]

探索秦始皇嬴政如何结束战国纷争，建立中国历史上第一个统一的中央集权国家。

## 学习目标
- 了解战国七雄的格局
- 理解秦国统一的战略
- 认识统一对中国历史的意义

---

#timeline 统一进程
- 公元前230年 - 灭韩 - 秦国首先消灭韩国，打开东进大门
- 公元前228年 - 灭赵 - 王翦率军攻占赵国都城邯郸
- 公元前225年 - 灭魏 - 水淹大梁，魏国灭亡
- 公元前223年 - 灭楚 - 王翦率60万大军灭楚
- 公元前222年 - 灭燕 - 攻占燕都蓟城
- 公元前221年 - 灭齐 - 最后消灭齐国，完成统一

---

#scene 咸阳宫
@id: xianyang-palace
@environment: palace
@lighting: dramatic
@model: /models/xianyang-palace.glb
@camera: [0, 5, 15]
@target: [0, 2, 0]
@music: /audio/palace-bgm.mp3

秦国都城咸阳的宫殿，见证了统一六国的伟大决策。

#narration
@voice: male
@audio: /audio/narration-01.mp3

公元前221年，秦王嬴政站在咸阳宫的高台上，俯瞰这片广袤的土地。
历经十年征战，六国尽归秦土，中国历史上第一个统一的中央集权国家诞生了。

#interaction
@type: click
@target: throne
@action: showInfo
@feedback: 展示秦始皇龙椅信息

---

#scene 兵马俑坑
@id: terracotta-army
@environment: indoor
@lighting: dim
@model: /models/terracotta-army.glb
@camera: [0, 3, 10]

秦始皇陵兵马俑，展现了秦朝军队的威武雄壮。

#narration
@voice: male

这支沉睡了两千多年的地下军团，是秦始皇统一天下的见证。
每一个兵马俑都有独特的面容，代表着当年百万雄师中的一员。

---

#character 秦始皇
@id: qin-shi-huang
@title: 始皇帝
@dynasty: 秦朝
@lifespan: 公元前259年-公元前210年
@model: /models/qinshihuang.glb
@position: [0, 0, 0]
@significance: 中国历史上第一位皇帝

## 基本信息
嬴政，秦庄襄王之子，13岁即位为秦王，39岁完成统一大业。

## 历史功绩
- 统一六国，结束战国纷争
- 建立皇帝制度
- 统一文字、度量衡、货币
- 修建万里长城
- 建立郡县制

---

#character 李斯
@id: li-si
@title: 丞相
@dynasty: 秦朝
@lifespan: 公元前280年-公元前208年
@model: /models/lisi.glb
@significance: 秦朝著名政治家

## 基本信息
楚国上蔡人，师从荀子，后入秦为官。

## 主要贡献
- 提出统一六国战略
- 主持统一文字（小篆）
- 协助建立中央集权制度

---

#artifact 传国玉玺
@id: jade-seal
@era: 秦朝
@material: 和氏璧
@location: 秦始皇陵
@model: /models/jade-seal.glb
@position: [2, 1, 0]
@scale: 0.5
@interactable: true
@significance: 皇权象征

传国玉玺，由和氏璧雕刻而成，上刻"受命于天，既寿永昌"八字。
是中国古代皇帝的重要信物，象征着皇权的正统。

---

#artifact 秦半两
@id: qin-coin
@era: 秦朝
@material: 青铜
@dimensions: 直径约3厘米
@model: /models/qin-coin.glb
@interactable: true
@significance: 统一货币

秦始皇统一六国后，废除各国货币，统一使用圆形方孔的"半两"钱。
这一货币形制延续了两千多年，影响深远。

---

#quiz 知识测验
@id: qin-quiz
@passingScore: 60

## 秦始皇统一六国花了多少年？
- 8年
- 10年
- 12年
- 15年
@answer: 1

## 秦国最后灭亡的是哪个国家？
- 楚国
- 燕国
- 齐国
- 赵国
@answer: 2

## 传国玉玺上刻的是什么字？
- 天下归一
- 受命于天，既寿永昌
- 秦王万岁
- 一统天下
@answer: 1

---

**恭喜完成秦始皇统一六国的学习！**
