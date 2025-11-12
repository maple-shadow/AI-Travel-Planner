import React from 'react';
import { Route, Routes } from 'react-router-dom';
import VoiceRecognitionTest from '../components/VoiceRecognitionTest';

const VoiceRecognitionRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/voice-test" element={<VoiceRecognitionTest />} />
        </Routes>
    );
};

export default VoiceRecognitionRoutes;