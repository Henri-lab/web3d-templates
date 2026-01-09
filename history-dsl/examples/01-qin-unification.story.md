#story 秦始皇统一六国
@id: qin-unification
@era: 公元前221年
@duration: 15min
@difficulty: medium
@tags: [古代史, 秦朝, 统一战争, 中央集权]
@thumbnail: /assets/images/qin/empire-map.jpg
@author: 历史教研组

穿越到公元前221年，见证秦始皇完成统一六国的伟业，
建立中国历史上第一个中央集权的封建王朝。

## 学习目标

- 了解秦国统一六国的历史进程
- 理解中央集权制度的建立
- 认识统一文字、货币、度量衡的意义
- 掌握秦朝的主要历史人物和事件

## 知识点

- 商鞅变法奠定基础
- 远交近攻的外交策略
- 郡县制取代分封制
- 书同文、车同轨、统一度量衡

---

#scene 咸阳宫大殿
@id: xianyang-palace
@environment: palace-interior
@lighting: dramatic
@mood: solemn
@camera:
position: [0, 3, 10]
target: [0, 1.5, 0]
fov: 50

## 环境描述

金碧辉煌的咸阳宫大殿，巨大的立柱撑起高耸的屋顶。
正中央是秦始皇的龙椅，大殿两侧站立着文武百官。
阳光透过高窗洒下，在地面形成斑驳的光影。

## 3D资源

@model: /assets/models/buildings/xianyang-palace.glb
@skybox: /assets/textures/palace-env.hdr
@music: /assets/audio/music/ancient-palace.mp3
@ambient: /assets/audio/effects/palace-atmosphere.mp3

## 初始入场动画

@camera-animation:
from:
position: [0, 15, 20]
fov: 70
to:
position: [0, 3, 10]
fov: 50
duration: 3s
ease: power2.inOut

---

#narration 开场白
@trigger: scene-enter
@voice: /assets/audio/narration/intro.mp3
@speaker: narrator-male
@subtitle: true
@avatar: /assets/images/ui/narrator.png

公元前221年，这是一个改变中国历史的年份。

经过十年的征战，秦王政终于完成了统一六国的伟业。

@pause: 1.5s

从此，战国500年的分裂局面宣告结束，
一个统一的中央集权国家屹立在东方。

@pause: 1s

现在，让我们一起穿越历史，
见证这个伟大时刻的到来...

---

#character 秦始皇
@id: qin-shi-huang
@title: 秦王政 / 始皇帝
@role: emperor
@model: /assets/models/characters/qin-emperor.glb
@position: [0, 0, 0]
@rotation: [0, 0, 0]
@scale: 1.0
@animation: throne-sitting

## 基本信息

- **姓名**: 嬴政
- **出生**: 公元前259年
- **在位**: 公元前246年 - 公元前210年
- **主要成就**:
  - 统一六国
  - 建立中央集权制度
  - 统一文字、货币、度量衡
  - 修建万里长城
  - 修筑驰道，统一车轨

## 人物形象

身穿玄黑色龙袍，绣有金色龙纹。
头戴十二旒冕冠，威严肃穆。
面容刚毅，目光深邃，透露出帝王的威仪。

## 人物动画

@default: throne-sitting
@available:

- throne-sitting (坐在龙椅上)
- standing-majestic (威严站立)
- decree-reading (宣读诏书)
- map-pointing (指点江山)

## 语音旁白

@trigger: timeline-complete
@voice: /assets/audio/narration/emperor-speech-01.mp3

> 六国终于一统，天下从此太平。
> 朕为始皇帝，后世以计数，二世三世至于万世，传之无穷！

## 交互对话

### 点击询问

@trigger: click
@options:

- 为何要统一六国？
- 什么是郡县制？
- 为什么统一文字？

### 对话1: 统一动机

@voice: /assets/audio/dialog/emperor-answer-01.mp3
六国纷争数百年，战火不断，民不聊生。
唯有统一天下，方能百姓安居，国家昌盛。
这是历史的必然，也是朕的使命。

### 对话2: 郡县制

@voice: /assets/audio/dialog/emperor-answer-02.mp3
分封制度已成往事，诸侯割据必生祸乱。
郡县制度，由中央直接任免官员，
可保中央集权，永绝叛乱之患。

### 对话3: 统一文字

@voice: /assets/audio/dialog/emperor-answer-03.mp3
六国文字各异，如何政令畅通？
书同文，车同轨，度量衡统一，
此乃长治久安之根本大计。

---

#character 李斯
@id: li-si
@title: 丞相
@role: scholar
@model: /assets/models/characters/li-si.glb
@position: [3, 0, 2]
@rotation: [0, -0.5, 0]
@animation: respectful-stand

## 基本信息

- **出生**: 约公元前284年
- **职位**: 秦朝丞相
- **主要贡献**:
  - 协助秦始皇统一六国
  - 主持统一文字(小篆)
  - 提出郡县制
  - 参与法律制定

## 人物形象

身穿朱红色官服，头戴进贤冠。
手持简牍，神态恭谨而不失威严。

## 互动内容

@trigger: click
@info-card:
李斯是秦朝著名政治家、文学家。
他建议秦始皇采用郡县制，统一文字和度量衡，
对秦朝的统一和巩固起到了重要作用。

---

#timeline 统一六国进程
@style: vertical
@interactive: true
@auto-play: true
@speed: 2s-per-event

## 公元前230年 - 灭韩国

@year: -230
@month: 3
@icon: sword
@color: #e74c3c
@location: [35, 113.7] # 郑州坐标

秦国首先攻灭韩国，拉开统一六国的序幕。

### 战役过程

秦军兵分两路进攻韩国:

- 北路由内史腾率领
- 南路由王翦指挥

韩国国力最弱，仅坚持数月便被攻破。

### 关键人物

- **秦方**: 内史腾、王翦
- **韩方**: 韩王安

### 地点

- **韩国都城**: 新郑（今河南新郑）
- **重要关隘**: 宜阳

### 结果

韩国灭亡，秦国在其故地设置**颍川郡**。

### 3D展示

@show-on-map: true
@map-animation:

- 显示韩国疆域（红色）
- 秦军进攻路线（箭头动画）
- 韩国疆域变为秦国（黑色）
- 标注"颍川郡"

### 音效

@sound: /assets/audio/effects/battle-start.mp3

---

## 公元前228年 - 灭赵国

@year: -228
@month: 10
@icon: shield
@color: #3498db
@location: [38.04, 114.5] # 邯郸坐标

秦军攻破邯郸，赵国灭亡。

### 战役过程

这是统一战争中最艰难的一战。
赵国虽经长平之战重创，但仍有相当实力。

#### 重要战役

1. **长平之战**（前期，公元前260年）
   - 白起大破赵军
   - 坑杀赵军40万
   - 赵国元气大伤

2. **邯郸之战**（决战）
   - 王翦率军围困邯郸
   - 历时数月攻破城池
   - 俘虏赵王迁

### 关键人物

- **秦方**: 王翦、杨端和
- **赵方**: 赵王迁、李牧（已被杀）

### 历史意义

赵国是山东六国中最强大的对手，
其灭亡标志着秦国统一大业已不可阻挡。

### 3D展示

@show-on-map: true
@show-battlefield: true
@camera-focus: [38.04, 114.5]

---

## 公元前225年 - 灭魏国

@year: -225
@month: 6
@icon: water-drop
@color: #1abc9c
@location: [34.8, 114.3] # 开封坐标

秦军用水攻之计攻破大梁，魏国灭亡。

### 战役特点

著名的水攻战例。

#### 战术创新

王贲引黄河、鸿沟之水灌大梁城:

- 挖掘引水渠道
- 决堤灌城
- 城墙崩塌
- 魏军投降

### 关键人物

- **秦方**: 王贲（王翦之子）
- **魏方**: 魏王假

### 战术分析

@interactive-diagram: true

1. 选址引水
2. 挖掘渠道
3. 决堤放水
4. 水淹大梁

### 历史启示

这次战役展示了古代战争中
兵法运用的重要性。

---

## 公元前223年 - 灭楚国

@year: -223
@month: 11
@icon: flame
@color: #e67e22
@location: [30.6, 114.3] # 武汉坐标

楚国疆域最大，秦军动用60万大军才将其攻灭。

### 战役规模

这是统一战争中规模最大的一战。

#### 兵力对比

- **秦军**: 60万（王翦统帅）
- **楚军**: 40万（项燕统帅）

### 战役过程

1. **初战失利**
   - 秦将李信率20万军队
   - 轻敌冒进
   - 被项燕击败

2. **王翦请兵**
   - 王翦要求60万大军
   - 秦始皇允准
   - 举国之力攻楚

3. **持久战略**
   - 王翦坚壁不出
   - 等待战机
   - 最终决战获胜

### 关键战役

- **城父之战**: 决定性会战
- **项燕战死**: 楚国失去主帅
- **攻克寿春**: 楚国灭亡

### 历史影响

楚国灭亡后，秦国控制了
长江流域的广大地区。

---

## 公元前222年 - 灭燕国

@year: -222
@month: 4
@icon: mountain
@color: #9b59b6
@location: [39.9, 116.4] # 北京坐标

秦军攻克蓟城，燕国灭亡。

### 背景

燕国太子丹曾派荆轲刺杀秦王，
秦始皇对燕国深恶痛绝。

#### 荆轲刺秦

@related-story: jingke-assassination

- 公元前227年
- "风萧萧兮易水寒"
- 刺杀失败
- 激怒秦王

### 战役过程

1. 攻取燕都蓟城
2. 燕王迁都辽东
3. 秦军继续追击
4. 燕王喜被俘

### 地理特点

燕国地处北方，
靠近匈奴，地势险要。

---

## 公元前221年 - 灭齐国

@year: -221
@month: 2
@icon: crown
@color: #f39c12
@location: [36.7, 117] # 济南坐标
@highlight: true
@celebration: true

最后攻灭齐国，秦始皇完成统一大业！

### 战役特点

齐国因采取中立政策，
成为最后被灭的国家。

#### 不战而降

- 齐国不援助其他五国
- 希望通过中立自保
- 秦军兵临城下
- 齐王建不战而降

### 统一完成

@special-effect: fireworks
@animation: celebration

天下一统！

六国归秦，分裂500年的局面终于结束。
秦始皇建立了中国历史上第一个
统一的中央集权制封建王朝。

### 庆祝动画

@trigger: automatic
@effects:

- 地图全部染为秦黑色
- 烟花绽放
- 钟鼓齐鸣
- 文字浮现："大一统"

### 成就解锁

@achievement: "见证统一"
@points: +500
@badge: unity-witness

---

#narration 统一意义
@trigger: timeline-complete
@voice: /assets/audio/narration/conclusion.mp3
@subtitle: true

统一六国，不仅仅是疆域的合并，
更是制度、文化、经济的全面统一。

@pause: 1s

秦始皇建立了郡县制，
中央政府可以直接管理全国，
这是中国古代政治制度的重大变革。

@pause: 1s

统一文字，使用小篆作为标准字体，
便利了政令传达和文化交流。

统一货币，以秦半两钱为标准，
促进了商业发展。

统一度量衡，规范了计量标准，
有利于经济交往。

@pause: 1.5s

这些措施，奠定了中国
两千多年封建社会的基础...

---

#location 长城
@id: great-wall
@type: architecture
@model: /assets/models/buildings/great-wall.glb
@position: [0, 0, -100]
@scale: 20
@visible: false

## 历史背景

为了防御北方匈奴，秦始皇下令
连接并扩建战国时期各国修筑的长城，
形成了西起临洮、东至辽东的万里长城。

## 建造信息

- **开始时间**: 公元前221年
- **主持人**: 大将蒙恬
- **动用人力**: 约30万人
- **长度**: 约5000公里（秦长城）
- **用途**: 防御北方匈奴侵扰

## 展示模式

@mode: progressive-reveal
@trigger: after-timeline

### 阶段1 - 战国长城

@year: -300
@description: 显示战国时期各国分散的防御工事
@duration: 3s

### 阶段2 - 连接修建

@year: -215
@description: 展示秦朝连接扩建工程
@animation: construction-progress
@duration: 5s

### 阶段3 - 完整形态

@year: -210
@description: 展示完整的秦长城
@camera-flyover: true
@duration: 8s

## 交互热点

@hotspots:

- position: [0, 10, -90]
  name: 烽火台
  info: 烽火台用于传递军情，白天举烟，夜晚点火
  model: /assets/models/buildings/beacon-tower.glb

- position: [20, 0, -85]
  name: 关隘
  info: 山海关是长城东端重要关隘
  model: /assets/models/buildings/gate.glb

---

#artifact 秦简
@id: bamboo-slip
@model: /assets/models/artifacts/bamboo-slip.glb
@position: [4, 1.2, 2]
@rotation: [0, 0.5, 0]
@scale: 0.8
@interactive: true
@rarity: common

## 文物信息

秦代使用的竹简，用于书写法律、政令、文书。

## 详细描述

竹简是将竹片削薄、烤干后用绳串连而成。
每片竹简宽约1厘米，长度不等。
这是秦朝最重要的书写载体。

## 3D展示

@rotation-speed: 0.3
@highlight-on-hover: true
@scale-on-select: 1.5
@show-info-card: true

## 制作工艺

### 步骤

1. **选竹** - 选择3年生的竹子
2. **削片** - 削成均匀的薄片
3. **烤干** - 用火烤去水分，防虫蛀
4. **磨光** - 打磨光滑，便于书写
5. **编连** - 用丝绳或麻绳串连

## 历史价值

睡虎地秦简、里耶秦简等出土的竹简，
记录了秦代法律、行政文书，
是研究秦朝制度的重要实物资料。

## 知识卡片

@trigger: select
@card-type: info-panel
@content:

### 秦简与秦律

- 记载了详细的法律条文
- 反映了秦朝严密的法制
- 包含行政、军事、农业等内容

---

#artifact 秦半两钱
@id: qin-coin
@model: /assets/models/artifacts/qin-coin.glb
@position: [5, 1.2, 1]
@interactive: true
@rarity: common

## 文物信息

秦朝统一后使用的标准货币。

## 外观特征

- 圆形，中间有方孔
- 正面铸有"半两"二字
- 重约8克（汉代半两）
- 铜质

## 历史意义

结束了战国时期各国货币形制不一的局面，
统一了全国货币，便利了商品交换。

### 互动

@trigger: click
@effect: flip-and-enlarge
@show-both-sides: true

---

#artifact 兵马俑
@id: terracotta-warrior
@model: /assets/models/artifacts/warrior-01.glb
@position: [-4, 0, 3]
@scale: 1.0
@interactive: true
@rarity: legendary

## 文物信息

秦始皇陵陪葬坑中的陶制兵马俑，
被誉为"世界第八大奇迹"。

## 发现历史

- **发现时间**: 1974年
- **发现地点**: 陕西西安临潼
- **规模**: 约8000件陶俑，130辆战车

## 艺术价值

每个兵马俑的面部表情、发型、服饰都不相同，
展现了秦代高超的雕塑艺术和铸造工艺。

## 3D展示

@allow-rotation: true
@show-details: true
@comparison-mode: true

### 细节热点

@hotspots:

- face: 观察面部表情
- armor: 观察铠甲细节
- weapon: 观察武器（已失）
- shoes: 观察鞋履样式

---

#interaction 开启宝箱
@type: click
@target: treasure-chest
@position: [-5, 0, 5]
@icon: hand
@model: /assets/models/props/treasure-chest.glb

## 触发条件

@require:

- timeline-completed: true
- quiz-passed: true

## 动作序列

1. **播放开箱动画**
   @animation: chest-open
   @duration: 2s
   @sound: /assets/audio/effects/chest-open.mp3

2. **显示诏书**
   @show-object: imperial-decree
   @effect: golden-light
   @duration: 1s

3. **朗读诏书**
   @voice: /assets/audio/narration/decree.mp3
   @text: "朕统六国，天下归一。今颁此诏..."

4. **奖励**
   @points: +200
   @achievement: "考古学家"
   @unlock: special-outfit

## 反馈

你发现了秦始皇统一度量衡的诏书！

这份诏书记载了秦朝推行统一标准的命令，
是研究秦代制度的重要文献。

---

#quiz 统一顺序测验
@type: multiple-choice
@trigger: timeline-complete
@points: 100
@required: false

## 问题

秦国统一六国的正确顺序是？

## 选项

A. 韩、赵、魏、楚、燕、齐 ✓
B. 赵、韩、魏、楚、齐、燕
C. 韩、魏、赵、楚、燕、齐
D. 魏、赵、韩、楚、燕、齐

## 正确答案

@correct: A

## 解析

秦国统一六国的顺序是：

- 韩国 (公元前230年)
- 赵国 (公元前228年)
- 魏国 (公元前225年)
- 楚国 (公元前223年)
- 燕国 (公元前222年)
- 齐国 (公元前221年)

口诀：韩赵魏楚燕齐

---

#quiz 文物识别
@type: drag-and-match
@trigger: artifacts-collected
@points: 150

## 问题

请将秦朝文物拖拽到正确的用途

## 文物列表

@items:

- id: bamboo-slip
  name: 竹简
  image: /assets/images/artifacts/slip.jpg

- id: qin-coin
  name: 秦半两钱
  image: /assets/images/artifacts/coin.jpg

- id: bronze-sword
  name: 青铜剑
  image: /assets/images/artifacts/sword.jpg

- id: weights
  name: 权（秤砣）
  image: /assets/images/artifacts/weight.jpg

## 用途列表

@categories:

- id: writing
  name: 书写工具
- id: currency
  name: 货币
- id: weapon
  name: 武器
- id: measurement
  name: 度量衡

## 正确答案

@matching:
bamboo-slip: writing
qin-coin: currency
bronze-sword: weapon
weights: measurement

## 反馈

@correct: 太棒了！你对秦朝文物有深入了解！
@incorrect: 再想想，这些文物在秦朝分别有什么用途？

---

#quiz 历史影响
@type: short-answer
@trigger: story-complete
@points: 200

## 问题

请简要说明秦始皇统一六国对中国历史的影响。
（至少列举3点）

## 评分标准

@keywords:

- 结束分裂
- 中央集权
- 统一文字
- 统一货币
- 统一度量衡
- 郡县制
- 奠定基础

@min-length: 50
@max-length: 300

## 参考答案

秦始皇统一六国的历史影响：

1. **政治上**: 结束了春秋战国500年分裂局面，
   建立了中央集权制度，实行郡县制

2. **文化上**: 统一文字（小篆），促进了
   文化交流和民族融合

3. **经济上**: 统一货币（半两钱）和度量衡，
   促进了商品经济发展

4. **历史意义**: 奠定了中国两千多年封建社会
   的基本格局，影响深远

---

#transition 结束转场
@from: xianyang-palace
@to: modern-museum
@type: time-travel
@trigger: story-complete
@duration: 4s

## 效果

@effects:

- fade-out: 1s
- particle-effect: time-portal-reverse
- camera-movement:
  from: [0, 3, 10]
  to: [0, 2, 5]
  spin: -360deg
- fade-in: 1s

## 旁白

@voice: /assets/audio/narration/ending.mp3
历史的车轮滚滚向前...

从秦朝到今天，两千多年过去了。

但秦始皇开创的统一格局，
一直延续至今，影响着中华文明的发展。

@pause: 1s

感谢你的学习，下次再见！

---

#media 统一战争地图
@type: interactive-map
@url: /assets/maps/warring-states.svg
@trigger: timeline-start
@position: overlay-fullscreen

## 地图图层

@layers:

- id: base
  name: 底图
  visible: true

- id: states
  name: 七国疆域
  visible: true
  interactive: true

- id: battles
  name: 重要战役
  visible: false
  toggle: true

- id: trade-routes
  name: 交通要道
  visible: false
  toggle: true

## 交互功能

@features:

- zoom: true
- pan: true
- layer-toggle: true
- time-slider: true

---

## 成就系统

#achievement 速学者
@condition: complete-time < 10min
@badge: /assets/images/badges/fast-learner.png
@points: 50

#achievement 考古学家
@condition: collect-all-artifacts
@badge: /assets/images/badges/archaeologist.png
@points: 100

#achievement 历史学家
@condition: quiz-score > 80%
@badge: /assets/images/badges/historian.png
@points: 150

#achievement 完美主义者
@condition: 100%-completion
@badge: /assets/images/badges/perfectionist.png
@points: 300
