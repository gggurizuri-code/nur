import { useState } from 'react';
import Home from './components/Home';
import Laboratory from './components/Laboratory';
import Videos from './components/Videos';
import Tasks from './components/Tasks';
import About from './components/About';

type Page = 'home' | 'laboratory' | 'videos' | 'tasks' | 'about';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  return (
    <>
      {currentPage === 'home' && <Home onNavigate={handleNavigate} />}
      {currentPage === 'laboratory' && <Laboratory onNavigate={handleNavigate} />}
      {currentPage === 'videos' && <Videos onNavigate={handleNavigate} />}
      {currentPage === 'tasks' && <Tasks onNavigate={handleNavigate} />}
      {currentPage === 'about' && <About onNavigate={handleNavigate} />}
    </>
  );
}

export default App;
