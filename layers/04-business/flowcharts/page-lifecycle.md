---
id: flowchart-page-lifecycle
title: 页面生命周期流程图
version: 1.0.0
status: published
layer: 4
created: 2024-01-05
updated: 2024-01-05
---

# 页面生命周期流程图

> 定义用户从进入网站到完成学习的完整页面生命周期

---

## 概述

本文档使用 Mermaid 流程图详细描述页面各阶段的状态变化和数据流。

---

## 完整页面生命周期

```mermaid
flowchart TD
    subgraph 初始化阶段
        A[用户打开网站] --> B[显示加载动画]
        B --> C{检测设备性能}
        C -->|高性能| D1[设置高画质]
        C -->|中等性能| D2[设置中画质]
        C -->|低性能| D3[设置低画质]
        D1 --> E[加载核心资源]
        D2 --> E
        D3 --> E
    end

    subgraph 资源加载阶段
        E --> F[加载 React 应用]
        F --> G[初始化 Three.js]
        G --> H[加载字体/图标]
        H --> I[预加载首屏 3D 资源]
        I --> J{加载完成?}
        J -->|是| K[隐藏加载动画]
        J -->|否, 重试| I
    end

    subgraph 欢迎页阶段
        K --> L[播放入场动画]
        L --> M[显示欢迎页面]
        M --> N{用户操作}
        N -->|点击开始| O[进入故事选择]
        N -->|点击设置| P[打开设置面板]
        N -->|查看成就| Q[打开成就页面]
        P --> M
        Q --> M
    end

    subgraph 故事选择阶段
        O --> R[加载故事列表]
        R --> S[渲染故事卡片]
        S --> T[显示时代分类]
        T --> U{用户选择}
        U -->|选择故事| V[预览故事信息]
        U -->|切换时代| T
        V --> W{确认学习?}
        W -->|是| X[进入故事加载]
        W -->|否| S
    end

    subgraph 故事加载阶段
        X --> Y[解析 story.md]
        Y --> Z[生成场景配置]
        Z --> AA[加载 3D 模型]
        AA --> AB[加载纹理贴图]
        AB --> AC[加载音频资源]
        AC --> AD[初始化场景]
        AD --> AE[设置相机位置]
        AE --> AF{准备完成?}
        AF -->|是| AG[播放开场动画]
        AF -->|否| AD
    end

    subgraph 故事播放阶段
        AG --> AH[显示 3D 场景]
        AH --> AI[开始旁白]
        AI --> AJ{用户交互}
        AJ -->|点击物体| AK[显示物体信息]
        AJ -->|拖拽旋转| AL[旋转相机]
        AJ -->|滚动页面| AM[触发时间轴]
        AJ -->|点击下一步| AN[场景转场]
        AK --> AJ
        AL --> AJ
        AM --> AJ
        AN --> AO{是最后场景?}
        AO -->|否| AH
        AO -->|是| AP[触发测验]
    end

    subgraph 测验阶段
        AP --> AQ[显示测验题目]
        AQ --> AR{作答中}
        AR -->|提交答案| AS[计算得分]
        AS --> AT{是否通过?}
        AT -->|是| AU[显示成功动画]
        AT -->|否| AV[显示正确答案]
        AU --> AW[解锁成就]
        AV --> AW
    end

    subgraph 完成阶段
        AW --> AX[显示学习报告]
        AX --> AY{用户选择}
        AY -->|继续学习| O
        AY -->|分享成绩| AZ[打开分享面板]
        AY -->|返回首页| M
        AZ --> AX
    end
```

---

## 🎬 场景内交互流程

```mermaid
flowchart LR
    subgraph 输入层
        I1[鼠标点击]
        I2[鼠标移动]
        I3[鼠标滚轮]
        I4[触摸点击]
        I5[触摸滑动]
        I6[键盘按键]
    end

    subgraph 检测层
        D1[射线检测 Raycaster]
        D2[轨道控制 OrbitControls]
        D3[缩放控制 ZoomControls]
        D4[手势识别 GestureRecognizer]
        D5[快捷键映射 KeyboardMap]
    end

    subgraph 业务层
        B1[选中 3D 物体]
        B2[旋转相机视角]
        B3[调整观察距离]
        B4[切换场景]
        B5[打开信息面板]
        B6[播放/暂停]
    end

    subgraph 动画层
        A1[物体高亮效果]
        A2[相机移动动画]
        A3[FOV 变化动画]
        A4[场景转场动画]
        A5[面板弹出动画]
        A6[播放状态动画]
    end

    subgraph 渲染层
        R1[更新场景]
        R2[重绘画面]
    end

    I1 --> D1 --> B1 --> A1 --> R1
    I2 --> D2 --> B2 --> A2 --> R2
    I3 --> D3 --> B3 --> A3 --> R2
    I4 --> D4 --> B4 --> A4 --> R1
    I5 --> D4
    I6 --> D5 --> B5 --> A5 --> R2
    I6 --> D5 --> B6 --> A6 --> R2
```

---

## 🔄 状态转换矩阵

```mermaid
stateDiagram-v2
    [*] --> Loading

    Loading --> Welcome: LOAD_COMPLETE

    Welcome --> StorySelection: START_CLICK
    Welcome --> Settings: SETTINGS_CLICK
    Welcome --> Achievement: ACHIEVEMENT_CLICK

    Settings --> Welcome: CLOSE
    Achievement --> Welcome: CLOSE

    StorySelection --> StoryPreview: SELECT_STORY
    StorySelection --> Welcome: BACK

    StoryPreview --> StoryLoading: CONFIRM
    StoryPreview --> StorySelection: CANCEL

    StoryLoading --> StoryPlaying: LOADED
    StoryLoading --> Error: LOAD_ERROR

    Error --> StorySelection: RETRY

    StoryPlaying --> SceneTransition: NEXT_SCENE
    StoryPlaying --> SceneTransition: PREV_SCENE
    StoryPlaying --> ObjectDetail: CLICK_OBJECT
    StoryPlaying --> Paused: PAUSE
    StoryPlaying --> Quiz: STORY_END

    SceneTransition --> StoryPlaying: TRANSITION_COMPLETE

    ObjectDetail --> StoryPlaying: CLOSE

    Paused --> StoryPlaying: RESUME
    Paused --> StorySelection: EXIT

    Quiz --> QuizResult: SUBMIT
    QuizResult --> StoryComplete: CONTINUE

    StoryComplete --> StorySelection: NEW_STORY
    StoryComplete --> Welcome: HOME
    StoryComplete --> Share: SHARE

    Share --> StoryComplete: CLOSE
```

---

## 📱 移动端手势流程

```mermaid
flowchart TD
    subgraph 手势识别
        G1[单指点击]
        G2[单指拖动]
        G3[双指捏合]
        G4[双指旋转]
        G5[长按]
        G6[左右滑动]
    end

    subgraph 动作映射
        A1[选中物体]
        A2[旋转视角]
        A3[缩放场景]
        A4[俯仰调整]
        A5[显示详情]
        A6[切换场景]
    end

    subgraph 反馈效果
        F1[点击波纹]
        F2[拖动轨迹]
        F3[缩放提示]
        F4[角度指示]
        F5[震动反馈]
        F6[滑动箭头]
    end

    G1 --> A1 --> F1
    G2 --> A2 --> F2
    G3 --> A3 --> F3
    G4 --> A4 --> F4
    G5 --> A5 --> F5
    G6 --> A6 --> F6
```

---

## 🎯 关键路径优化

### 首屏加载优化路径

```mermaid
flowchart LR
    subgraph 并行加载
        P1[HTML/CSS]
        P2[关键 JS]
        P3[首屏图片]
    end

    subgraph 延迟加载
        D1[非关键 JS]
        D2[3D 模型]
        D3[音频资源]
        D4[其他故事]
    end

    A[请求页面] --> P1
    A --> P2
    A --> P3

    P1 --> B[渲染骨架屏]
    P2 --> B
    P3 --> B

    B --> C[显示加载进度]

    C --> D1
    C --> D2
    C --> D3

    D1 --> E[初始化交互]
    D2 --> E
    D3 --> E

    E --> F[隐藏加载]
    F --> G[显示内容]

    G --> D4
```

### 故事切换优化路径

```mermaid
sequenceDiagram
    participant U as 用户
    participant UI as UI 层
    participant S as 状态管理
    participant L as 资源加载器
    participant C as 缓存系统
    participant R as 渲染器

    U->>UI: 选择新故事
    UI->>S: 更新当前故事 ID
    S->>C: 检查缓存

    alt 缓存命中
        C->>R: 直接渲染
        R->>UI: 显示场景
    else 缓存未命中
        S->>UI: 显示加载动画
        S->>L: 开始加载资源

        par 并行加载
            L->>L: 加载模型
            L->>L: 加载纹理
            L->>L: 加载音频
        end

        L->>C: 存入缓存
        L->>R: 初始化场景
        R->>UI: 隐藏加载动画
        R->>UI: 显示场景
    end

    UI->>U: 开始播放故事
```

---

## ✅ 流程图检查清单

- [ ] 页面生命周期完整定义
- [ ] 所有状态转换已覆盖
- [ ] 异常路径已处理
- [ ] 移动端手势已适配
- [ ] 性能优化路径已规划

---

**流程图是业务逻辑的蓝图，确保每个状态转换都有据可依！**
