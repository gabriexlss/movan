import { useState } from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import './App.css'

import Header from './components/header'
import Footer from './components/footer'

function App() {

  return (
    <BrowserRouter>
        <Header />
        <Footer />
    </BrowserRouter>
  )
}

export default App
