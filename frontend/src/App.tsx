import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import './App.css'

function App() {
    const [count, setCount] = useState(0)

    return (
        <Router>
            <div className="App">
                <header className="App-header">
                    <h1>AI旅行规划师</h1>
                    <p>欢迎使用AI旅行规划师应用</p>
                    <div className="card">
                        <button onClick={() => setCount((count) => count + 1)}>
                            点击次数: {count}
                        </button>
                        <p>
                            编辑 <code>src/App.tsx</code> 并保存以测试热重载
                        </p>
                    </div>
                </header>

                <Routes>
                    <Route path="/" element={
                        <main>
                            <p>这是主页内容</p>
                        </main>
                    } />
                </Routes>
            </div>
        </Router>
    )
}

export default App