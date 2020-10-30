import React, { Component } from 'react';
import Tile from './Tile';
import GridModel from '../GridModel';
import TileModel from '../TileModel';

export default class TileContainer extends Component {
    render() {
        return (
            <div className="tile-container">
                {this.renderTiles()}
            </div>
        );
    }

    renderTiles() {
        var cells = [];

        this.props.board.cells.forEach(function (column) {
            column.forEach(function (cell) {
              if (cell)
                cells.push(<Tile model={cell} merged={false} key={cell.key} />);
            });
          });

        return cells;
    }
}