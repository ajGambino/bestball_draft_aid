import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [minADP, setMinADP] = useState('');
  const [maxADP, setMaxADP] = useState('');
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedPositions, setSelectedPositions] = useState([]);
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
    setSearchTerm('');
    setMinADP('');
    setMaxADP('');
    filterData('', [], '');
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

  const filterData = useCallback((searchTerm, teams, positions, minADP, maxADP) => {
    let filtered = data.filter(item =>
      (item.Name.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === '') &&
      (teams.length === 0 || teams.includes(item.Team)) &&
      (positions.length === 0 || positions.includes(item.Position)) &&
      (minADP === '' || Number(item.ADP) >= Number(minADP)) &&
      (maxADP === '' || Number(item.ADP) <= Number(maxADP))
    );
    setFilteredData(filtered);
  }, [data]);

  useEffect(() => {
    filterData(searchTerm, selectedTeams, selectedPositions, minADP, maxADP);
  }, [searchTerm, selectedTeams, selectedPositions, minADP, maxADP, filterData]);

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
      {/* Min and Max ADP inputs */}
      <div className="adp-filter-container">
        <input
          type="number"
          placeholder="Min. ADP"
          value={minADP}
          onChange={handleMinADPChange}
          style={{ width: '80px' }} // Adjust width here
        />
        <input
          type="number"
          placeholder="Max. ADP"
          value={maxADP}
          onChange={handleMaxADPChange}
          style={{ width: '80px' }} // Adjust width here
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
{/* Table */}
<div className="table-container">
  <table>
    <thead>
      <tr>
        <th>Team</th>
        <th>Name</th>
        <th>Pos</th>
        <th className={sortConfig.key === 'Rank' ? (sortConfig.direction === 'ascending' ? 'sorted-asc' : 'sorted-desc') : ''} onClick={() => handleSort('Rank')}>Rank</th>
        <th className={sortConfig.key === 'ADP' ? (sortConfig.direction === 'ascending' ? 'sorted-asc' : 'sorted-desc') : ''} onClick={() => handleSort('ADP')}>ADP</th>
        <th className={sortConfig.key === 'ADP Differential' ? (sortConfig.direction === 'ascending' ? 'sorted-asc' : 'sorted-desc') : ''} onClick={() => handleSort('ADP Differential')}>+/-</th>
        <th>Wk 17</th>
        <th>Wk 16</th>
        <th>Wk 15</th>
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
        </tr>
      ))}
    </tbody>
  </table>
</div>
</div>
);
}

export default App;
