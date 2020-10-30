import GridModel from './GridModel';
import TileModel from './TileModel';

export default class GameManager {
    constructor(size) {
        this.size = size;
        this.startTiles = 2;

        this.setup();
    }

    restart() {
        this.setup();
    }

    isGameTerminated() {
        return this.over;
    }

    setup() {

        this.grid = new GridModel(this.size);
        this.score = 0;
        this.over = false;

        this.addStartTiles();
    }

    addStartTiles() {
        for (var i = 0; i < this.startTiles; i++) {
            this.addRandomTile();
        }
    }

    addRandomTile() {
        if (this.grid.cellsAvailable()) {
            var value = Math.random() < 0.9 ? 2 : 4;
            var tile = new TileModel(this.grid.randomAvailableCell(), value);

            this.grid.insertTile(tile);
        }
    }

    prepareTiles() {
        this.grid.eachCell(function (x, y, tile) {
            if (tile) {
                tile.mergedFrom = null;
                tile.savePosition();
            }
        });
    }

    moveTile(tile, cell) {
        this.grid.cells[tile.x][tile.y] = null;
        this.grid.cells[cell.x][cell.y] = tile;
        tile.updatePosition(cell);
    }

    move(direction) {
        var self = this;

        if (this.isGameTerminated())
          return;
        
        var cell, tile;

        var vector = this.getVector(direction);
        var traversals = this.buildTraversals(vector);
        var moved = false;

        this.prepareTiles();

        traversals.x.forEach(function (x) {
            traversals.y.forEach(function (y) {
                cell = { x: x, y: y };
                tile = self.grid.cellContent(cell);

                if (tile) {
                    var positions = self.findFarthestPosition(cell, vector);
                    var next = self.grid.cellContent(positions.next);

                    if (next && next.value === tile.value && !next.mergedFrom) {
                        var merged = new TileModel(positions.next, tile.value * 2);
                        merged.mergedFrom = [tile, next];

                        self.grid.insertTile(merged);
                        self.grid.removeTile(tile);

                        tile.updatePosition(positions.next);

                        self.score += merged.value;
                    } else {
                        self.moveTile(tile, positions.farthest);
                    }

                    if (!self.positionsEqual(cell, tile)) {
                        moved = true;
                    }
                }
            });
        });

        if (moved) {
            this.addRandomTile();

            if (!this.movesAvailable()) {
                this.over = true;
            }
        }
    }

    getVector(direction) {
        //movement
        var map = {
            0: { x: 0, y: -1}, // up
            1: { x: 1, y: 0}, // right
            2: { x: 0, y: 1}, // down
            3: { x: -1, y: 0}, // left
        };
        return map[direction];
    }

    buildTraversals(vector) {
        var traversals = { x: [], y: [] };

        for (var pos = 0; pos < this.size; pos++) {
            traversals.x.push(pos);
            traversals.y.push(pos);
        }

        if (vector.x === 1) traversals.x = traversals.x.reverse();
        if (vector.y === 1) traversals.y = traversals.y.reverse();

        return traversals;
    }

    findFarthestPosition(cell, vector) {
        var previous;
    
        // Progress towards the vector direction until an obstacle is found
        do {
          previous = cell;
          cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
        } while (this.grid.withinBounds(cell) &&
                 this.grid.cellAvailable(cell));
    
        return {
          farthest: previous,
          next: cell // Used to check if a merge is required
        };
    }
    
    movesAvailable() {
        return this.grid.cellsAvailable() || this.tileMatchesAvailable();
    }
    
      // Check for available matches between tiles (more expensive check)
    tileMatchesAvailable() {
        var self = this;
    
        var tile;
    
        for (var x = 0; x < this.size; x++) {
          for (var y = 0; y < this.size; y++) {
            tile = this.grid.cellContent({ x: x, y: y });
    
            if (tile) {
              for (var direction = 0; direction < 4; direction++) {
                var vector = self.getVector(direction);
                var cell   = { x: x + vector.x, y: y + vector.y };
    
                var other  = self.grid.cellContent(cell);
    
                if (other && other.value === tile.value) {
                  return true; // These two tiles can be merged
                }
              }
            }
          }
        }
    
        return false;
    }
    
    positionsEqual(first, second) {
        return first.x === second.x && first.y === second.y;
    }
}