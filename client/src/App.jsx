import { useState } from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import './App.css'

import Header from './components/header'
import Footer from './components/footer'
import TituloTela from './components/tituloTela'
import DefaultCard from './components/cards/DefaultCard'

function App() {

  return (
    <BrowserRouter>
        <Header />
        <TituloTela title="Olá, Motorista!" subtitle="Sexta-feira, 12 de setembro" />
        <main>
          <DefaultCard title="Card 1" />
        </main>
        <Footer />
    </BrowserRouter>
  )
}

export default App
