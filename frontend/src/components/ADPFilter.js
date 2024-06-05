import React from 'react';

const ADPFilter = ({ minADP, maxADP, handleMinADPChange, handleMaxADPChange }) => (
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
);

export default ADPFilter;
