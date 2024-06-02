import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [selectedDivisions, setSelectedDivisions] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });

  useEffect(() => {
    fetch(process.env.REACT_APP_API_URL)
      .then(response => response.json())
      .then(data => {
        setData(data);
        setFilteredData(data);
      });
  }, []);

  const clearFilters = () => {
    setSelectedTeams([]);
    setSelectedPositions([]);
    setSelectedDivisions([]);
    setSearchTerm('');
    filterData('', [], [], []);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    filterData(e.target.value, selectedTeams, selectedPositions, selectedDivisions);
  };

  const handleCheckboxChange = (e, setSelected, selectedList) => {
    const value = e.target.value;
    if (e.target.checked) {
      setSelected([...selectedList, value]);
    } else {
      setSelected(selectedList.filter(item => item !== value));
    }
  };

  const filterData = useCallback((searchTerm, teams, positions, divisions) => {
    let filtered = data.filter(item =>
      (item.Name.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === '') &&
      (teams.length === 0 || teams.includes(item.Team)) &&
      (positions.length === 0 || positions.includes(item.Position)) &&
      (divisions.length === 0 || divisions.includes(item.Division) || (item.Division === null && divisions.includes('FA')))
    );
    setFilteredData(filtered);
  }, [data]);

  useEffect(() => {
    filterData(searchTerm, selectedTeams, selectedPositions, selectedDivisions);
  }, [searchTerm, selectedTeams, selectedPositions, selectedDivisions, filterData]);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    sortData(key, direction);
  };

  const sortData = (key, direction) => {
    const sortedData = [...filteredData].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });
    setFilteredData(sortedData);
  };

  return (
    <div className="App">
      <h1>Draft Caddy</h1>
      {/* Search bar */}
      <input
        type="text"
        placeholder="Search by player name"
        value={searchTerm}
        onChange={handleSearch}
      />
      <button onClick={clearFilters}>Clear Filters</button>
      {/* Filter checkboxes */}
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
        <div className="filter">
          <label>Divisions:</label>
          <div className="filter-items">
            {Array.from(new Set(data.filter(item => item.Division !== null).map(item => item.Division))).map((division, index) => (
              <div key={index}>
                <input
                  type="checkbox"
                  value={division}
                  checked={selectedDivisions.includes(division)}
                  onChange={(e) => handleCheckboxChange(e, setSelectedDivisions, selectedDivisions)}
                />
                <span>{division}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Team</th>
              <th>Name</th>
              <th>Pos</th>
              <th onClick={() => handleSort('Rank')}>Rank</th>
              <th onClick={() => handleSort('ADP')}>ADP</th>
              <th onClick={() => handleSort('ADP Differential')}>+/-</th>
              <th>Wk 17</th>
              <th>Wk 16</th>
              <th>Wk 15</th>
              <th>Div</th>
              <th onClick={() => handleSort('Exposure')}>Exposure</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index}>
                <td>{item.Team}</td>
                <td>{item.Name}</td>
                <td>{item.Position}</td>
                <td>{item.Rank}</td>
                <td>{item.ADP}</td>
                <td>{item['ADP Differential']}</td>
                <td>{item['Week 17']}</td>
                <td>{item['Week 16']}</td>
                <td>{item['Week 15']}</td>
                <td>{item.Division}</td>
                <td>{item.Exposure + "%"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
