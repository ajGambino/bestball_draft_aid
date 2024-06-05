import React from 'react';


const Navbar = () => {
  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="navbar">
      <ul>
        <li onClick={() => scrollToSection('home')}>Home</li>
        <li onClick={() => scrollToSection('players')}>Players</li>
        <li onClick={() => scrollToSection('matchups')}>Matchups</li>
        <li onClick={() => scrollToSection('picks')}>Picks</li>
      </ul>
    </nav>
  );
};

export default Navbar;
