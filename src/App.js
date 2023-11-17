import './App.css';
import Menu from './Menu';
import GetDeck from './decks';
import {Routes, Route} from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path='/' element={<Menu />} />
      <Route path='/game' element={<GetDeck />} />
    </Routes>
  );
}

export default App;
