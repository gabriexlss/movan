import { useState } from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import './App.css'

import Header from './components/header'
import Footer from './components/footer'
import TituloTela from './components/tituloTela'
import CardHorarios from './components/cards/CardHorarios'
import CardRotas from './components/cards/CardRotas'
import CardMensali from './components/cards/CardMensali'
import CardFinanc from './components/cards/CardFinanc'
import CardAluno from './components/cards/CardAluno'

function App() {

  return (
    <BrowserRouter>
        <Header />
        <TituloTela title="Olá, Motorista!" />
        <main>
          <CardHorarios />
          <CardRotas />
          <CardMensali />
          <CardFinanc />
          <CardAluno />
        </main>
        <Footer />
    </BrowserRouter>
  )
}

export default App
