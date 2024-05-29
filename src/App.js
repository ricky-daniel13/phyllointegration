import React from 'react';
import './App.css';
import Header from './Header';
import CreatorPage from './CreatorPage';
import useScript from './Hooks/useScript';

function App() {
    useScript("https://cdn.getphyllo.com/connect/v2/phyllo-connect.js");

    return (
        <div className="app-container">
            <Header />
            <div className="header-line"></div>
            <CreatorPage />
        </div>
    );
}

export default App;