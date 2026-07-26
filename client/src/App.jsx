import { useState } from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import './App.css'

import Header from './components/header'
import Footer from './components/footer'
import TituloTela from './components/tituloTela'
import CardHorarios from './components/cards/CardHorarios'
import CardRotas from './components/cards/CardRotas'
import CardMensali from './components/cards/CardMensali'

function App() {

  return (
    <BrowserRouter>
        <Header />
        <TituloTela title="Olá, Motorista!" subtitle="Sexta-feira, 12 de setembro" />
        <main>
          <CardHorarios />
          <CardRotas />
          <CardMensali />
        </main>
        <Footer />
    </BrowserRouter>
  )
}

export default App
