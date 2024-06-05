import React from 'react';

const PlayerTable = ({ filteredData, sortConfig, handleSort, getRowClass, toggleStickyPlayer }) => {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Team</th>
            <th>Compare</th>
            <th>Name</th>
            <th>Pos</th>
            <th
              className={sortConfig.key === 'Rank' ? (sortConfig.direction === 'ascending' ? 'sorted-asc' : 'sorted-desc') : ''}
              onClick={() => handleSort('Rank')}
            >
              Rank
              <span className="arrow">{sortConfig.key === 'Rank' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '↕'}</span>
            </th>
            <th
              className={sortConfig.key === 'ADP' ? (sortConfig.direction === 'ascending' ? 'sorted-asc' : 'sorted-desc') : ''}
              onClick={() => handleSort('ADP')}
            >
              ADP
              <span className="arrow">{sortConfig.key === 'ADP' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '↕'}</span>
            </th>
            <th
              className={sortConfig.key === 'ADP Differential' ? (sortConfig.direction === 'ascending' ? 'sorted-asc' : 'sorted-desc') : ''}
              onClick={() => handleSort('ADP Differential')}
            >
              +/-
              <span className="arrow">{sortConfig.key === 'ADP Differential' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '↕'}</span>
            </th>
            <th>Wk 17</th>
            <th
              className={sortConfig.key === 'Exposure' ? (sortConfig.direction === 'ascending' ? 'sorted-asc' : 'sorted-desc') : ''}
              onClick={() => handleSort('Exposure')}
            >
              Exp.
              <span className="arrow">{sortConfig.key === 'Exposure' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '↕'}</span>
            </th>
           
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index} className={getRowClass(item.Position)}>
              <td>{item.Team}</td>
              <td>
                <button onClick={() => toggleStickyPlayer(item)}>+</button>
              </td>
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
  );
};

export default PlayerTable;
