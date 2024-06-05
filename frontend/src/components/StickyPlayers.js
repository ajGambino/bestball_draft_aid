import React from 'react';

const StickyPlayers = ({ stickyPlayers, getRowClass, toggleStickyPlayer }) => {
  return (
    <div className="sticky-container">
      <h2>Compare Players</h2>
      <table>
        <thead>
          <tr>
            <th>Team</th>
            <th>Name</th>
            <th>Pos</th>
            <th>Rank</th>
            <th>ADP</th>
            <th>+/-</th>
            <th>Wk 17</th>
            <th>Exp.</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {stickyPlayers.map((player, index) => (
            <tr key={`sticky-${index}`} className={`sticky-row ${getRowClass(player.Position)}`}>
              <td>{player.Team}</td>
              <td>{player.Name}</td>
              <td>{player.Position}</td>
              <td>{player.Rank}</td>
              <td>{player.ADP}</td>
              <td>{player['ADP Differential']}</td>
              <td>{player['Week 17']}</td>
              <td>{player.Exposure + "%"}</td>
              <td>
                <button onClick={() => toggleStickyPlayer(player)}>-</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StickyPlayers;
