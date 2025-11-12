// 主应用组件
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { configureAppStore, persistor } from './core/store';
import RouterConfig from './core/router/RouterConfig';
import { initializeVoiceRecognition } from './features/voice-recognition';
import './App.css';

// 配置Redux store
const store = configureAppStore();

const App: React.FC = () => {
    useEffect(() => {
        // 初始化语音识别模块
        const initVoiceRecognition = async () => {
            try {
                const success = await initializeVoiceRecognition();

                if (success) {
                    console.log('语音识别模块初始化成功');
                } else {
                    console.warn('语音识别模块初始化失败，相关功能将不可用');
                }
            } catch (error) {
                console.error('语音识别模块初始化异常:', error);
            }
        };

        initVoiceRecognition();
    }, []);

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <div className="App">
                    <RouterConfig />
                </div>
            </PersistGate>
        </Provider>
    );
};

export default App;