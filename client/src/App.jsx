import { useState } from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import './App.css'

import Header from './components/header'

function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Header />} />
        {/* <Route path="*" element={<DivElemento />} />
        <Route path="*" element={<Footer />} /> */}
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
