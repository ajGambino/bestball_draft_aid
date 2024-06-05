import React from 'react';
import matchupsData from './matchupsData';

const MatchupsTable = () => (
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
);

export default MatchupsTable;
