import React from 'react';

const Filters = ({ data, selectedTeams, setSelectedTeams, selectedPositions, setSelectedPositions, handleCheckboxChange }) => (
  <div className="filters-container">
    <div className="filter">
      <label>Teams:</label>
      <div className="filter-items">
        {Array.from(new Set(data.map(item => item.Team))).sort().map((team, index) => (
          <div key={index}>
            <input
              type="checkbox"
              value={team}
              checked={selectedTeams.includes(team)}
              onChange={(e) => handleCheckboxChange(e, setSelectedTeams, selectedTeams)}
            />
            <span>{team}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="filter">
      <label>Positions:</label>
      <div className="filter-items">
        {Array.from(new Set(data.map(item => item.Position))).map((position, index) => (
          <div key={index}>
            <input
              type="checkbox"
              value={position}
              checked={selectedPositions.includes(position)}
              onChange={(e) => handleCheckboxChange(e, setSelectedPositions, selectedPositions)}
            />
            <span>{position}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Filters;
