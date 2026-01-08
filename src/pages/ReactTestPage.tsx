/**
 * ReactTestPage - React 技术实验室
 *
 * Vue 转 React 需要适应的技术小实验
 * 帮助理解 React 的核心概念和最佳实践
 */

import { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext, useReducer } from 'react'
import { Link } from 'react-router-dom'

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
            onClick={() => setCount(c => c + 1)}
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
const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} })

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
                className={`p-2 rounded-lg text-left transition-all ${
                  activeCategory === id
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
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  activeExperiment?.id === exp.id
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
