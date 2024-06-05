import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import matchupsData from './matchupsData';

function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [minADP, setMinADP] = useState('');
  const [maxADP, setMaxADP] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [excludeZeroExposure, setExcludeZeroExposure] = useState(false);


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
    setSearchTerm('');
    setMinADP('');
    setMaxADP('');
    filterData('', [], [], '', '');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    filterData(e.target.value, selectedTeams, selectedPositions, minADP, maxADP);
  };

  const handleMinADPChange = (e) => {
    setMinADP(e.target.value);
    filterData(searchTerm, selectedTeams, selectedPositions, e.target.value, maxADP);
  };

  const handleMaxADPChange = (e) => {
    setMaxADP(e.target.value);
    filterData(searchTerm, selectedTeams, selectedPositions, minADP, e.target.value);
  };

  const handleCheckboxChange = (e, setSelected, selectedList) => {
    const value = e.target.value;
    if (e.target.checked) {
      setSelected([...selectedList, value]);
    } else {
      setSelected(selectedList.filter(item => item !== value));
    }
  };

  const filterData = useCallback((searchTerm, teams, positions, minADP, maxADP, excludeZeroExposure) => {
    let filtered = data.filter(item =>
      (item.Name.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === '') &&
      (teams.length === 0 || teams.includes(item.Team)) &&
      (positions.length === 0 || positions.includes(item.Position)) &&
      (minADP === '' || item.ADP >= parseFloat(minADP)) &&
      (maxADP === '' || item.ADP <= parseFloat(maxADP)) &&
      (!excludeZeroExposure || item.Exposure !== 0)
    );
    setFilteredData(filtered);
  }, [data]);
  

  useEffect(() => {
    filterData(searchTerm, selectedTeams, selectedPositions, minADP, maxADP, excludeZeroExposure);
  }, [searchTerm, selectedTeams, selectedPositions, minADP, maxADP, excludeZeroExposure, filterData]);
  

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    sortData(key, direction);
  };

  const sortData = (key, direction) => {
    let sorted = [...filteredData].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    setFilteredData(sorted);
  };

  const getRowClass = (position) => {
    switch (position) {
      case 'RB':
        return 'row-rb';
      case 'QB':
        return 'row-qb';
      case 'WR':
        return 'row-wr';
      case 'TE':
        return 'row-te';
      default:
        return '';
    }
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
      <div className="checkbox-container">
        <input
          type="checkbox"
          id="excludeZeroExposure"
          checked={excludeZeroExposure}
          onChange={() => setExcludeZeroExposure(!excludeZeroExposure)}
        />
        <label htmlFor="excludeZeroExposure">Exclude 0% players</label>
      </div>
      {/* Min and Max ADP inputs */}
      <div className="adp-filter-container">
        <input
          type="number"
          placeholder="Min ADP"
          value={minADP}
          onChange={handleMinADPChange}
          className="adp-input"
        />
        <input
          type="number"
          placeholder="Max ADP"
          value={maxADP}
          onChange={handleMaxADPChange}
          className="adp-input"
        />
      </div>
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
      </div>
      {/* First Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Team</th>
              <th>Name</th>
              <th>Pos</th>
              <th className={sortConfig.key === 'Rank' ? (sortConfig.direction === 'ascending' ? 'sorted-asc' : 'sorted-desc') : ''} onClick={() => handleSort('Rank')}>
                Rank
                <span className="arrow">{sortConfig.key === 'Rank' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '↕'}</span>
              </th>
              <th className={sortConfig.key === 'ADP' ? (sortConfig.direction === 'ascending' ? 'sorted-asc' : 'sorted-desc') : ''} onClick={() => handleSort('ADP')}>
                ADP
                <span className="arrow">{sortConfig.key === 'ADP' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '↕'}</span>
              </th>
              <th className={sortConfig.key === 'ADP Differential' ? (sortConfig.direction === 'ascending' ? 'sorted-asc' : 'sorted-desc') : ''} onClick={() => handleSort('ADP Differential')}>
                +/-
                <span className="arrow">{sortConfig.key === 'ADP Differential' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '↕'}</span>
              </th>
              <th>Wk 17</th>
              <th className={sortConfig.key === 'Exposure' ? (sortConfig.direction === 'ascending' ? 'sorted-asc' : 'sorted-desc') : ''} onClick={() => handleSort('Exposure')}>
                Exp.
                <span className="arrow">{sortConfig.key === 'Exposure' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '↕'}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index} className={getRowClass(item.Position)}>
                <td>{item.Team}</td>
                <td>{item.Name}</td>
                <td>{item.Position}</td>
                <td>{item.Rank}</td>
                <td>{item.ADP}</td>
                <td>{item['ADP Differential']}</td>
                <td>{item['Week 17']}</td>
                <td>{item.Exposure + "%"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Second Table */}
      <h2>Matchups</h2>
      <div className="table-container alternate-rows">
        <table>
          <thead>
            <tr>
              <th>Team</th>
              <th>Week 17</th>
              <th>Week 16</th>
              <th>Week 15</th>
              <th>Division</th>
            </tr>
          </thead>
          <tbody>
            {matchupsData.map((item, index) => (
              <tr key={index}>
                <td>{item.Team}</td>
                <td>{item['Week 17']}</td>
                <td>{item['Week 16']}</td>
                <td>{item['Week 15']}</td>
                <td>{item.Division}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
