import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import ADPFilter from './components/ADPFilter';
import Filters from './components/Filters';
import PlayerTable from './components/PlayerTable';
import MatchupsTable from './components/MatchupsTable';

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
    fetch("https://bestball-draft-aid.onrender.com/api/draft-table")
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
      <div className="banner">
      <h1>Draft Caddy</h1>
      <SearchBar
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        clearFilters={clearFilters}
        excludeZeroExposure={excludeZeroExposure}
        setExcludeZeroExposure={setExcludeZeroExposure}
      />
      <ADPFilter
        minADP={minADP}
        maxADP={maxADP}
        handleMinADPChange={handleMinADPChange}
        handleMaxADPChange={handleMaxADPChange}
      />
      <Filters
        data={data}
        selectedTeams={selectedTeams}
        setSelectedTeams={setSelectedTeams}
        selectedPositions={selectedPositions}
        setSelectedPositions={setSelectedPositions}
        handleCheckboxChange={handleCheckboxChange}
      />
      </div>
      <PlayerTable
        filteredData={filteredData}
        sortConfig={sortConfig}
        handleSort={handleSort}
        getRowClass={getRowClass}
      />
      <h2>Matchups</h2>
      <MatchupsTable />
    </div>
  );
}

export default App;
