/**
 * ReactTestPage - React 技术实验室
 *
 * Vue 转 React 需要适应的技术小实验
 * 帮助理解 React 的核心概念和最佳实践
 */

import { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext, useReducer } from 'react'
import { Link } from 'react-router-dom'

// 暴露 React 内部 API 到全局，方便调试
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {}
  // @ts-ignore
  window.React = { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext, useReducer }
}

// 实验项目类型
interface Experiment {
  id: string
  name: string
  description: string
  category: 'hooks' | 'patterns' | 'state' | 'performance'
}

// 实验列表
const EXPERIMENTS: Experiment[] = [
  // Hooks
  { id: 'use-state', name: 'useState', description: '基础状态管理，对比 Vue 的 ref/reactive', category: 'hooks' },
  { id: 'use-effect', name: 'useEffect', description: '副作用处理，对比 Vue 的 watch/watchEffect', category: 'hooks' },
  { id: 'use-ref', name: 'useRef', description: 'DOM 引用和持久化值，对比 Vue 的 ref', category: 'hooks' },
  { id: 'use-memo', name: 'useMemo', description: '计算属性缓存，对比 Vue 的 computed', category: 'hooks' },
  { id: 'use-callback', name: 'useCallback', description: '函数缓存，避免不必要的重渲染', category: 'hooks' },
  { id: 'react-debug', name: 'React 源码调试', description: '在浏览器 DevTools 中调试 React 源码', category: 'hooks' },

  // 模式
  { id: 'context', name: 'Context', description: '跨组件状态共享，对比 Vue 的 provide/inject', category: 'patterns' },
  { id: 'render-props', name: 'Render Props', description: '组件逻辑复用模式', category: 'patterns' },
  { id: 'compound', name: '复合组件', description: '组件组合模式，类似 Vue 的插槽', category: 'patterns' },

  // 状态管理
  { id: 'use-reducer', name: 'useReducer', description: '复杂状态管理，类似 Vuex 的 mutations', category: 'state' },
  { id: 'lifting-state', name: '状态提升', description: '父子组件通信，对比 Vue 的 emit', category: 'state' },

  // 性能
  { id: 'memo', name: 'React.memo', description: '组件记忆化，避免不必要渲染', category: 'performance' },
  { id: 'virtual-list', name: '虚拟列表', description: '大数据列表优化', category: 'performance' },
]

const CATEGORIES = {
  hooks: { name: 'React Hooks', icon: '🪝' },
  patterns: { name: '设计模式', icon: '🏗️' },
  state: { name: '状态管理', icon: '📦' },
  performance: { name: '性能优化', icon: '⚡' },
}

// ============ 实验组件 ============

// 1. useState 实验
function UseStateDemo() {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')
  const [items, setItems] = useState<string[]>([])

  const addItem = () => {
    if (text.trim()) {
      setItems([...items, text])
      setText('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-neutral-800 rounded-lg">
        <h4 className="font-medium mb-2">计数器</h4>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCount(c => c - 1)}
            className="px-3 py-1 bg-red-600 rounded hover:bg-red-500"
          >
            -
          </button>
          <span className="text-2xl font-bold">{count}</span>
          <button
            onClick={() => { debugger; setCount(c => c + 1) }}
            className="px-3 py-1 bg-green-600 rounded hover:bg-green-500"
          >
            +
          </button>
        </div>
      </div>

      <div className="p-4 bg-neutral-800 rounded-lg">
        <h4 className="font-medium mb-2">列表管理</h4>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder="输入内容..."
            className="flex-1 px-3 py-1 bg-neutral-700 rounded"
          />
          <button
            onClick={addItem}
            className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-500"
          >
            添加
          </button>
        </div>
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li key={i} className="flex justify-between items-center p-2 bg-neutral-700 rounded">
              <span>{item}</span>
              <button
                onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                className="text-red-400 hover:text-red-300"
              >
                删除
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-3 bg-blue-900/30 rounded text-sm">
        <p className="text-blue-400">💡 Vue 对比：</p>
        <p className="text-neutral-400">useState 类似 Vue 3 的 ref()，但更新时需要调用 setter 函数</p>
      </div>
    </div>
  )
}

// 2. useEffect 实验
function UseEffectDemo() {
  const [count, setCount] = useState(0)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${msg}`])
  }

  // 组件挂载/卸载
  useEffect(() => {
    addLog('组件挂载 (mounted)')
    return () => {
      console.log('组件卸载 (unmounted)')
    }
  }, [])

  // 监听 count 变化
  useEffect(() => {
    addLog(`count 变化: ${count}`)
  }, [count])

  return (
    <div className="space-y-4">
      <div className="p-4 bg-neutral-800 rounded-lg">
        <h4 className="font-medium mb-2">触发 Effect</h4>
        <button
          onClick={() => setCount(c => c + 1)}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
        >
          增加计数 ({count})
        </button>
      </div>

      <div className="p-4 bg-neutral-800 rounded-lg">
        <h4 className="font-medium mb-2">Effect 日志</h4>
        <div className="space-y-1 font-mono text-sm">
          {logs.map((log, i) => (
            <div key={i} className="text-neutral-400">{log}</div>
          ))}
        </div>
      </div>

      <div className="p-3 bg-blue-900/30 rounded text-sm">
        <p className="text-blue-400">💡 Vue 对比：</p>
        <p className="text-neutral-400">useEffect 类似 Vue 的 watch + onMounted + onUnmounted 的组合</p>
      </div>
    </div>
  )
}

// 3. useRef 实验
function UseRefDemo() {
  const inputRef = useRef<HTMLInputElement>(null)
  const renderCount = useRef(0)
  const [, forceUpdate] = useState({})

  renderCount.current++

  const focusInput = () => {
    inputRef.current?.focus()
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-neutral-800 rounded-lg">
        <h4 className="font-medium mb-2">DOM 引用</h4>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="点击按钮聚焦..."
            className="flex-1 px-3 py-1 bg-neutral-700 rounded"
          />
          <button
            onClick={focusInput}
            className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-500"
          >
            聚焦
          </button>
        </div>
      </div>

      <div className="p-4 bg-neutral-800 rounded-lg">
        <h4 className="font-medium mb-2">持久化值（不触发重渲染）</h4>
        <p className="text-neutral-400 mb-2">渲染次数: {renderCount.current}</p>
        <button
          onClick={() => forceUpdate({})}
          className="px-3 py-1 bg-green-600 rounded hover:bg-green-500"
        >
          强制重渲染
        </button>
      </div>

      <div className="p-3 bg-blue-900/30 rounded text-sm">
        <p className="text-blue-400">💡 Vue 对比：</p>
        <p className="text-neutral-400">useRef 用于 DOM 引用时类似 Vue 的 ref，但也可存储不触发渲染的值</p>
      </div>
    </div>
  )
}

// 4. useMemo 实验
function UseMemoDemo() {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')

  // 模拟耗时计算
  const expensiveValue = useMemo(() => {
    console.log('执行耗时计算...')
    let result = 0
    for (let i = 0; i < count * 1000000; i++) {
      result += i
    }
    return result
  }, [count])

  return (
    <div className="space-y-4">
      <div className="p-4 bg-neutral-800 rounded-lg">
        <h4 className="font-medium mb-2">计算属性缓存</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <span>计算因子:</span>
            <button
              onClick={() => setCount(c => Math.max(0, c - 1))}
              className="px-2 py-1 bg-neutral-700 rounded"
            >
              -
            </button>
            <span className="font-bold">{count}</span>
            <button
              onClick={() => setCount(c => c + 1)}
              className="px-2 py-1 bg-neutral-700 rounded"
            >
              +
            </button>
          </div>
          <p className="text-neutral-400">计算结果: {expensiveValue.toLocaleString()}</p>
        </div>
      </div>

      <div className="p-4 bg-neutral-800 rounded-lg">
        <h4 className="font-medium mb-2">不影响缓存的状态</h4>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入不会触发重新计算..."
          className="w-full px-3 py-1 bg-neutral-700 rounded"
        />
        <p className="text-xs text-neutral-500 mt-1">修改此输入不会重新执行耗时计算</p>
      </div>

      <div className="p-3 bg-blue-900/30 rounded text-sm">
        <p className="text-blue-400">💡 Vue 对比：</p>
        <p className="text-neutral-400">useMemo 类似 Vue 的 computed，但需要手动指定依赖数组</p>
      </div>
    </div>
  )
}

// 5. Context 实验
const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => { } })

function ContextDemo() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  const contextValue = useMemo(() => ({
    theme,
    toggleTheme: () => setTheme(t => t === 'dark' ? 'light' : 'dark'),
  }), [theme])

  return (
    <ThemeContext.Provider value={contextValue}>
      <div className="space-y-4">
        <div className="p-4 bg-neutral-800 rounded-lg">
          <h4 className="font-medium mb-2">Context Provider</h4>
          <p className="text-neutral-400">当前主题: {theme}</p>
        </div>

        <ContextConsumer />

        <div className="p-3 bg-blue-900/30 rounded text-sm">
          <p className="text-blue-400">💡 Vue 对比：</p>
          <p className="text-neutral-400">Context 类似 Vue 的 provide/inject，用于跨层级传递数据</p>
        </div>
      </div>
    </ThemeContext.Provider>
  )
}

function ContextConsumer() {
  const { theme, toggleTheme } = useContext(ThemeContext)

  return (
    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-neutral-800' : 'bg-neutral-200 text-black'}`}>
      <h4 className="font-medium mb-2">Context Consumer</h4>
      <button
        onClick={toggleTheme}
        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500"
      >
        切换主题
      </button>
    </div>
  )
}

// 6. useReducer 实验
interface TodoState {
  todos: { id: number; text: string; done: boolean }[]
}

type TodoAction =
  | { type: 'ADD'; text: string }
  | { type: 'TOGGLE'; id: number }
  | { type: 'DELETE'; id: number }

function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'ADD':
      return {
        todos: [...state.todos, { id: Date.now(), text: action.text, done: false }],
      }
    case 'TOGGLE':
      return {
        todos: state.todos.map(t =>
          t.id === action.id ? { ...t, done: !t.done } : t
        ),
      }
    case 'DELETE':
      return {
        todos: state.todos.filter(t => t.id !== action.id),
      }
    default:
      return state
  }
}

function UseReducerDemo() {
  const [state, dispatch] = useReducer(todoReducer, { todos: [] })
  const [text, setText] = useState('')

  const addTodo = () => {
    if (text.trim()) {
      dispatch({ type: 'ADD', text })
      setText('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-neutral-800 rounded-lg">
        <h4 className="font-medium mb-2">Todo List (useReducer)</h4>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            placeholder="添加待办..."
            className="flex-1 px-3 py-1 bg-neutral-700 rounded"
          />
          <button
            onClick={addTodo}
            className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-500"
          >
            添加
          </button>
        </div>
        <ul className="space-y-1">
          {state.todos.map(todo => (
            <li
              key={todo.id}
              className="flex items-center gap-2 p-2 bg-neutral-700 rounded"
            >
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => dispatch({ type: 'TOGGLE', id: todo.id })}
              />
              <span className={todo.done ? 'line-through text-neutral-500' : ''}>
                {todo.text}
              </span>
              <button
                onClick={() => dispatch({ type: 'DELETE', id: todo.id })}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                删除
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-3 bg-blue-900/30 rounded text-sm">
        <p className="text-blue-400">💡 Vue 对比：</p>
        <p className="text-neutral-400">useReducer 类似 Vuex 的 mutations，适合复杂状态逻辑</p>
      </div>
    </div>
  )
}

// 7. React 源码调试实验 - 高效学习 React 内部机制
function ReactDebugDemo() {
  const [count, setCount] = useState(0)
  const [renderCount, setRenderCount] = useState(0)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [fiberInfo, setFiberInfo] = useState<any>(null)
  const componentRef = useRef<HTMLDivElement>(null)

  // 追踪渲染次数
  useEffect(() => {
    setRenderCount(prev => prev + 1)
  })

  // 添加调试信息
  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev.slice(-12), `[${new Date().toLocaleTimeString()}] ${info}`])
  }

  // 获取 Fiber 节点信息
  const inspectFiber = () => {
    if (componentRef.current) {
      // 通过 DOM 节点获取 Fiber 信息
      const fiberKey = Object.keys(componentRef.current).find(key =>
        key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance')
      )
      if (fiberKey) {
        const fiber = (componentRef.current as any)[fiberKey]
        setFiberInfo({
          type: fiber.type?.name || fiber.elementType?.name || 'Unknown',
          key: fiber.key,
          mode: fiber.mode,
          lanes: fiber.lanes,
          childLanes: fiber.childLanes,
          memoizedState: fiber.memoizedState ? 'Has State' : 'No State',
        })
        addDebugInfo('已提取 Fiber 节点信息')
        console.log('🔍 Fiber 节点详情:', fiber)
      }
    }
  }

  // 1. 调试 useState 更新队列
  const debugUseState = () => {
    console.log('=== useState 调试开始 ===')
    debugger // 断点1: 进入 useState 更新逻辑
    setCount(c => {
      console.log('当前值:', c, '→ 新值:', c + 1)
      addDebugInfo(`useState: ${c} → ${c + 1}`)
      return c + 1
    })
  }

  // 2. 调试批量更新机制
  const debugBatchUpdate = () => {
    console.log('=== 批量更新调试开始 ===')
    debugger // 断点2: 观察批量更新
    console.log('触发3次 setState，但只会渲染1次')
    setCount(c => c + 1)
    setCount(c => c + 1)
    setCount(c => c + 1)
    addDebugInfo('批量更新: 3次 setState → 1次渲染')
  }

  // 3. 调试 useEffect 依赖比较
  useEffect(() => {
    console.log('=== useEffect 执行 ===')
    console.log('依赖项 count 变化:', count)
    addDebugInfo(`useEffect 触发 (count=${count})`)

    return () => {
      console.log('=== useEffect 清理函数 ===')
    }
  }, [count])

  // 4. 调试 Fiber 调和过程
  const debugReconciliation = () => {
    console.log('=== Fiber 调和调试开始 ===')
    debugger // 断点3: 进入 Fiber 调和算法
    setCount(c => c + 1)
    addDebugInfo('触发 Fiber 调和过程')
  }

  // 5. 调试优先级调度
  const debugPriorityScheduling = () => {
    console.log('=== 优先级调度调试 ===')
    debugger // 断点4: 观察任务优先级
    // 同步更新
    setCount(c => c + 1)
    // 异步更新
    setTimeout(() => {
      setCount(c => c + 1)
    }, 0)
    addDebugInfo('同步 + 异步更新调度')
  }

  return (
    <div ref={componentRef} className="space-y-4">
      {/* 核心概念速查 */}
      <div className="p-4 bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-lg border border-blue-500/30">
        <h4 className="font-bold mb-3 text-lg">🎯 React 源码核心概念速查</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 bg-black/30 rounded">
            <p className="font-bold text-blue-400 mb-1">Fiber 架构</p>
            <p className="text-neutral-400 text-xs">可中断的协调算法，支持优先级调度</p>
          </div>
          <div className="p-3 bg-black/30 rounded">
            <p className="font-bold text-green-400 mb-1">双缓冲技术</p>
            <p className="text-neutral-400 text-xs">current 和 workInProgress 两棵树</p>
          </div>
          <div className="p-3 bg-black/30 rounded">
            <p className="font-bold text-purple-400 mb-1">Lane 模型</p>
            <p className="text-neutral-400 text-xs">基于二进制位的优先级系统</p>
          </div>
          <div className="p-3 bg-black/30 rounded">
            <p className="font-bold text-yellow-400 mb-1">Hooks 链表</p>
            <p className="text-neutral-400 text-xs">memoizedState 存储 Hook 状态</p>
          </div>
        </div>
      </div>

      {/* 实时状态监控 */}
      <div className="p-4 bg-neutral-800 rounded-lg">
        <h4 className="font-medium mb-3">📊 实时状态监控</h4>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="p-3 bg-neutral-700 rounded text-center">
            <p className="text-xs text-neutral-400 mb-1">Count</p>
            <p className="text-2xl font-bold text-blue-400">{count}</p>
          </div>
          <div className="p-3 bg-neutral-700 rounded text-center">
            <p className="text-xs text-neutral-400 mb-1">渲染次数</p>
            <p className="text-2xl font-bold text-green-400">{renderCount}</p>
          </div>
          <div className="p-3 bg-neutral-700 rounded text-center">
            <p className="text-xs text-neutral-400 mb-1">日志条数</p>
            <p className="text-2xl font-bold text-purple-400">{debugInfo.length}</p>
          </div>
        </div>

        <button
          onClick={inspectFiber}
          className="w-full px-4 py-2 bg-orange-600 rounded hover:bg-orange-500 text-sm font-medium"
        >
          🔍 检查当前组件的 Fiber 节点
        </button>

        {fiberInfo && (
          <div className="mt-3 p-3 bg-black/40 rounded font-mono text-xs">
            <p className="text-orange-400 font-bold mb-2">Fiber 节点信息:</p>
            {Object.entries(fiberInfo).map(([key, value]) => (
              <p key={key} className="text-neutral-300">
                <span className="text-blue-400">{key}:</span> {String(value)}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* 调试入口 */}
      <div className="p-4 bg-neutral-800 rounded-lg">
        <h4 className="font-medium mb-3">🐛 源码调试入口（含 debugger 断点）</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={debugUseState}
            className="px-4 py-3 bg-blue-600 rounded hover:bg-blue-500 text-sm font-medium"
          >
            1️⃣ useState 更新队列
          </button>
          <button
            onClick={debugBatchUpdate}
            className="px-4 py-3 bg-purple-600 rounded hover:bg-purple-500 text-sm font-medium"
          >
            2️⃣ 批量更新机制
          </button>
          <button
            onClick={debugReconciliation}
            className="px-4 py-3 bg-green-600 rounded hover:bg-green-500 text-sm font-medium"
          >
            3️⃣ Fiber 调和算法
          </button>
          <button
            onClick={debugPriorityScheduling}
            className="px-4 py-3 bg-yellow-600 rounded hover:bg-yellow-500 text-sm font-medium"
          >
            4️⃣ 优先级调度
          </button>
        </div>
        <p className="text-xs text-neutral-500 mt-3">
          💡 点击按钮后会触发 debugger 断点，打开 DevTools 后使用 F11 单步进入源码
        </p>
      </div>

      {/* 调试日志 */}
      <div className="p-4 bg-neutral-800 rounded-lg">
        <h5 className="font-medium mb-2">📝 调试日志（最近12条）</h5>
        <div className="space-y-1 font-mono text-xs max-h-64 overflow-y-auto bg-black/40 p-3 rounded">
          {debugInfo.length === 0 ? (
            <p className="text-neutral-500">等待调试操作...</p>
          ) : (
            debugInfo.map((info, i) => (
              <div key={i} className="text-green-400">{info}</div>
            ))
          )}
        </div>
        <button
          onClick={() => setDebugInfo([])}
          className="mt-2 px-3 py-1 bg-neutral-700 rounded hover:bg-neutral-600 text-xs"
        >
          清空日志
        </button>
      </div>

      {/* 源码学习路径 */}
      <div className="p-4 bg-neutral-800 rounded-lg">
        <h4 className="font-medium mb-3">🗺️ 高效源码学习路径</h4>
        <div className="space-y-2 text-sm">
          <div className="p-3 bg-gradient-to-r from-blue-900/30 to-transparent rounded border-l-4 border-blue-500">
            <p className="font-bold text-blue-400 mb-1">第1阶段: Hooks 实现</p>
            <p className="text-neutral-400 text-xs mb-2">理解 useState、useEffect 的底层机制</p>
            <p className="text-neutral-500 text-xs">关键文件: ReactFiberHooks.js → mountState / updateState</p>
          </div>
          <div className="p-3 bg-gradient-to-r from-green-900/30 to-transparent rounded border-l-4 border-green-500">
            <p className="font-bold text-green-400 mb-1">第2阶段: Fiber 架构</p>
            <p className="text-neutral-400 text-xs mb-2">掌握 Fiber 节点结构和遍历算法</p>
            <p className="text-neutral-500 text-xs">关键文件: ReactFiber.js → createFiber / beginWork / completeWork</p>
          </div>
          <div className="p-3 bg-gradient-to-r from-purple-900/30 to-transparent rounded border-l-4 border-purple-500">
            <p className="font-bold text-purple-400 mb-1">第3阶段: 调度器</p>
            <p className="text-neutral-400 text-xs mb-2">学习优先级调度和时间切片</p>
            <p className="text-neutral-500 text-xs">关键文件: Scheduler.js → scheduleCallback / workLoop</p>
          </div>
          <div className="p-3 bg-gradient-to-r from-yellow-900/30 to-transparent rounded border-l-4 border-yellow-500">
            <p className="font-bold text-yellow-400 mb-1">第4阶段: Diff 算法</p>
            <p className="text-neutral-400 text-xs mb-2">深入理解 reconcileChildren 的优化策略</p>
            <p className="text-neutral-500 text-xs">关键文件: ReactChildFiber.js → reconcileChildFibers</p>
          </div>
        </div>
      </div>

      {/* 关键源码位置 */}
      <div className="p-4 bg-neutral-800 rounded-lg">
        <h4 className="font-medium mb-3">📂 关键源码文件位置</h4>

        <div className="mb-3 p-3 bg-yellow-900/30 rounded border border-yellow-500/30">
          <p className="text-yellow-400 font-bold mb-2">⚠️ 重要说明</p>
          <p className="text-sm text-neutral-300 mb-2">
            浏览器中看到的 React 代码使用 <code className="text-red-400">var</code> 是正常的！
            这是编译后的产物。要看原始源码（使用 const/let），请访问 GitHub。
          </p>
          <div className="flex gap-2">
            <a
              href="https://github.com/facebook/react/tree/main/packages"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium"
            >
              🔗 GitHub 源码
            </a>
            <a
              href="/REACT_SOURCE_DEBUG.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-sm font-medium"
            >
              📚 本地调试指南
            </a>
          </div>
        </div>

        <div className="space-y-2 font-mono text-xs">
          <div className="p-2 bg-neutral-700 rounded">
            <div className="flex justify-between items-start mb-1">
              <p className="text-blue-400">react/src/ReactHooks.js</p>
              <a
                href="https://github.com/facebook/react/blob/main/packages/react/src/ReactHooks.js"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-xs"
              >
                GitHub →
              </a>
            </div>
            <p className="text-neutral-500">Hooks API 入口</p>
          </div>
          <div className="p-2 bg-neutral-700 rounded">
            <div className="flex justify-between items-start mb-1">
              <p className="text-green-400">react-reconciler/src/ReactFiberHooks.js</p>
              <a
                href="https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberHooks.js"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 text-xs"
              >
                GitHub →
              </a>
            </div>
            <p className="text-neutral-500">Hooks 实现核心（1800+ 行）</p>
          </div>
          <div className="p-2 bg-neutral-700 rounded">
            <div className="flex justify-between items-start mb-1">
              <p className="text-purple-400">react-reconciler/src/ReactFiberWorkLoop.js</p>
              <a
                href="https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberWorkLoop.js"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 text-xs"
              >
                GitHub →
              </a>
            </div>
            <p className="text-neutral-500">Fiber 工作循环（2500+ 行）</p>
          </div>
          <div className="p-2 bg-neutral-700 rounded">
            <div className="flex justify-between items-start mb-1">
              <p className="text-yellow-400">react-reconciler/src/ReactFiberBeginWork.js</p>
              <a
                href="https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberBeginWork.js"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400 hover:text-yellow-300 text-xs"
              >
                GitHub →
              </a>
            </div>
            <p className="text-neutral-500">Fiber 节点处理（3500+ 行）</p>
          </div>
        </div>
      </div>

      {/* 调试技巧 */}
      <div className="p-4 bg-neutral-800 rounded-lg">
        <h4 className="font-medium mb-3">💡 高效学习策略</h4>
        <div className="space-y-2 text-sm text-neutral-400">
          <div className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">1.</span>
            <div>
              <p className="font-medium text-white">双屏对照学习</p>
              <p className="text-xs">左屏：GitHub 源码（const/let，易读）| 右屏：浏览器调试（运行时行为）</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400 font-bold">2.</span>
            <div>
              <p className="font-medium text-white">理解编译流程</p>
              <p className="text-xs">原始源码（GitHub）→ Babel 编译 → 产物代码（浏览器）→ 运行时</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400 font-bold">3.</span>
            <div>
              <p className="font-medium text-white">关注核心逻辑</p>
              <p className="text-xs">不要纠结 var/let，重点理解算法：Fiber 遍历、Hook 链表、优先级调度</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-yellow-400 font-bold">4.</span>
            <div>
              <p className="font-medium text-white">使用调用栈追踪</p>
              <p className="text-xs">在 debugger 断点处，查看 Call Stack 了解函数调用链</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-orange-400 font-bold">5.</span>
            <div>
              <p className="font-medium text-white">监视关键变量</p>
              <p className="text-xs">Watch 面板添加：fiber.memoizedState、workInProgress、currentHook</p>
            </div>
          </div>
        </div>
      </div>

      {/* 为什么是 var */}
      <div className="p-4 bg-neutral-800 rounded-lg">
        <h4 className="font-medium mb-3">🤔 为什么浏览器中看到的是 var？</h4>
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-blue-900/20 rounded border-l-4 border-blue-500">
            <p className="font-bold text-blue-400 mb-1">原因 1: 编译产物</p>
            <p className="text-neutral-400 text-xs">
              React 源码经过 Babel 编译成 ES5，为了兼容性使用 var
            </p>
          </div>
          <div className="p-3 bg-green-900/20 rounded border-l-4 border-green-500">
            <p className="font-bold text-green-400 mb-1">原因 2: 性能优化</p>
            <p className="text-neutral-400 text-xs">
              var 在某些 JS 引擎中性能略优，React 团队选择性能而非现代语法
            </p>
          </div>
          <div className="p-3 bg-purple-900/20 rounded border-l-4 border-purple-500">
            <p className="font-bold text-purple-400 mb-1">原因 3: 历史遗留</p>
            <p className="text-neutral-400 text-xs">
              React 诞生于 ES6 普及前，保持 var 风格确保向后兼容
            </p>
          </div>
          <div className="p-3 bg-yellow-900/20 rounded border-l-4 border-yellow-500">
            <p className="font-bold text-yellow-400 mb-1">✅ 正确做法</p>
            <p className="text-neutral-400 text-xs">
              在 GitHub 阅读原始源码（现代语法），在浏览器调试运行时行为（编译后代码）
            </p>
          </div>
        </div>
      </div>

      {/* 本地源码调试 */}
      <div className="p-4 bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg border border-green-500/30">
        <h4 className="font-medium mb-3">🛠️ 想在浏览器中调试原始源码？</h4>
        <p className="text-sm text-neutral-300 mb-3">
          虽然浏览器中是编译后的代码，但你可以本地构建 React 源码并配置 Vite 使用它。
        </p>
        <div className="space-y-2 text-sm">
          <div className="p-3 bg-black/30 rounded">
            <p className="font-bold text-green-400 mb-2">快速设置（3 步）</p>
            <ol className="space-y-1 text-xs text-neutral-300 list-decimal list-inside">
              <li>运行设置脚本: <code className="text-blue-400">./setup-react-source.sh</code></li>
              <li>按照提示配置 vite.config.ts</li>
              <li>重启开发服务器: <code className="text-blue-400">npm run dev</code></li>
            </ol>
          </div>
          <div className="p-3 bg-black/30 rounded">
            <p className="font-bold text-blue-400 mb-2">详细文档</p>
            <p className="text-xs text-neutral-300">
              查看 <code className="text-green-400">REACT_SOURCE_DEBUG.md</code> 了解完整的设置步骤和 3 种调试方案
            </p>
          </div>
          <div className="p-3 bg-black/30 rounded">
            <p className="font-bold text-purple-400 mb-2">推荐方案</p>
            <p className="text-xs text-neutral-300">
              双屏学习法：左屏 GitHub 源码（理解算法），右屏浏览器调试（观察行为）
            </p>
          </div>
        </div>
      </div>

      {/* 快速参考 */}
      <div className="p-3 bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded text-sm border border-orange-500/30">
        <p className="font-bold text-orange-400 mb-2">⚡ 快捷键参考</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <p><kbd className="px-2 py-1 bg-black/40 rounded">F8</kbd> 继续执行</p>
          <p><kbd className="px-2 py-1 bg-black/40 rounded">F10</kbd> 单步跳过</p>
          <p><kbd className="px-2 py-1 bg-black/40 rounded">F11</kbd> 单步进入</p>
          <p><kbd className="px-2 py-1 bg-black/40 rounded">Shift+F11</kbd> 跳出函数</p>
        </div>
      </div>
    </div>
  )
}

// 默认占位组件
function PlaceholderDemo({ name }: { name: string }) {
  return (
    <div className="p-4 bg-neutral-800 rounded-lg">
      <h4 className="font-medium mb-2">{name}</h4>
      <p className="text-neutral-400">此实验正在开发中...</p>
    </div>
  )
}

// 实验组件映射
const EXPERIMENT_COMPONENTS: Record<string, React.ComponentType> = {
  'use-state': UseStateDemo,
  'use-effect': UseEffectDemo,
  'use-ref': UseRefDemo,
  'use-memo': UseMemoDemo,
  'context': ContextDemo,
  'use-reducer': UseReducerDemo,
  'react-debug': ReactDebugDemo,
}

export default function ReactTestPage() {
  const [activeCategory, setActiveCategory] = useState<keyof typeof CATEGORIES>('hooks')
  const [activeExperiment, setActiveExperiment] = useState<Experiment | null>(null)

  const categoryExperiments = EXPERIMENTS.filter((e) => e.category === activeCategory)

  useEffect(() => {
    if (!activeExperiment || activeExperiment.category !== activeCategory) {
      setActiveExperiment(categoryExperiments[0] || null)
    }
  }, [activeCategory])

  const ExperimentComponent = activeExperiment
    ? EXPERIMENT_COMPONENTS[activeExperiment.id] || (() => <PlaceholderDemo name={activeExperiment.name} />)
    : () => null

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      {/* 左侧边栏 */}
      <aside className="w-80 bg-neutral-900 border-r border-neutral-800 flex flex-col">
        {/* 头部 */}
        <div className="p-4 border-b border-neutral-800">
          <Link
            to="/"
            className="text-neutral-400 hover:text-white text-sm flex items-center gap-2 mb-3"
          >
            ← 返回首页
          </Link>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span>⚛️</span>
            React 技术实验室
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Vue 转 React 技术适应指南
          </p>
        </div>

        {/* 分类选择 */}
        <div className="p-4 border-b border-neutral-800">
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            实验分类
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(CATEGORIES) as [keyof typeof CATEGORIES, typeof CATEGORIES[keyof typeof CATEGORIES]][]).map(([id, cat]) => (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className={`p-2 rounded-lg text-left transition-all ${activeCategory === id
                  ? 'bg-blue-600/20 border border-blue-500/50 text-blue-400'
                  : 'bg-neutral-800/50 border border-transparent hover:bg-neutral-800 text-neutral-300'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-sm font-medium">{cat.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 实验列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            {CATEGORIES[activeCategory].name} ({categoryExperiments.length})
          </h2>
          <div className="space-y-2">
            {categoryExperiments.map((exp) => (
              <button
                key={exp.id}
                onClick={() => setActiveExperiment(exp)}
                className={`w-full text-left p-3 rounded-lg transition-all ${activeExperiment?.id === exp.id
                  ? 'bg-neutral-800 border border-neutral-700'
                  : 'hover:bg-neutral-800/50 border border-transparent'
                  }`}
              >
                <div className="font-medium mb-1">{exp.name}</div>
                <p className="text-xs text-neutral-400 line-clamp-2">
                  {exp.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 快速导航 */}
        <div className="p-4 border-t border-neutral-800">
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            其他实验室
          </h2>
          <div className="flex gap-2">
            <Link
              to="/lab"
              className="flex-1 text-center py-2 px-3 bg-neutral-800 hover:bg-neutral-700 rounded text-sm transition-colors"
            >
              🎨 Three.js
            </Link>
            <Link
              to="/earth"
              className="flex-1 text-center py-2 px-3 bg-neutral-800 hover:bg-neutral-700 rounded text-sm transition-colors"
            >
              🌍 Cesium
            </Link>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeExperiment && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{activeExperiment.name}</h2>
              <p className="text-neutral-400">{activeExperiment.description}</p>
            </div>

            <ExperimentComponent />
          </div>
        )}
      </main>
    </div>
  )
}
