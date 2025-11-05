// 主应用组件
import React from 'react';
import { Provider } from 'react-redux';
import { configureAppStore } from './core/store';
import RouterConfig from './core/router/RouterConfig';
import './App.css';

// 配置Redux store
const store = configureAppStore();

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <div className="App">
                <RouterConfig />
            </div>
        </Provider>
    );
};

export default App;