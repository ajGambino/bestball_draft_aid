import React from 'react';

const SearchBar = ({ searchTerm, handleSearch, clearFilters, excludeZeroExposure, setExcludeZeroExposure }) => (
  <div>
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
  </div>
);

export default SearchBar;
