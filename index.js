import React from 'react';
import ReactDOM from 'react-dom';
import { map, range, curry, find } from 'ramda';


const character = {
  x: 5,
  y: 10,
  actions: 2,
  movementRange: 5,
  sightRange: 5
};

const characters = [character];

const grassTile = {
  backgroundColor: 'green',
  borderWidth: '1px',
  borderColor: 'black',
  borderStyle: 'solid'
};

const generateMap = (width, height) => {
  const column = x => map(y => Object.assign({}, {x: x, y: y}, grassTile), range(0, height));
  return map(column, range(0, width));
};


const tileSize = 40;
const tilePx = tileSize + 'px';
const mapHeight = 10;
const mapWidth = 20;
const widthPx = (tileSize * mapWidth) + 'px';
const heightPx = (tileSize * mapHeight) + 'px';

const sameCoordinates = curry((a, b) => {
  return a.x === b.x && a.y === b.y;
});

const findOnCoordinates = (coordinates, collection) => {
  return find(sameCoordinates(coordinates), collection);
};

const Tile = ({ tile}) => {
  const style = Object.assign({}, {width: tilePx, height: tilePx}, tile);
  const character = findOnCoordinates({x: tile.x, y: tile.y}, characters);
  if (character) {
    console.log();
    console.log(character);
  }
  return (
      <div style={style}>
      { character ? <Character character={character}/> : null }
      </div>
  );
};

const Character = ({ character }) => {
  const defaultStyle = {
    backgroundColor: 'yellow',
    borderRadius: '20px'
  };
  const style = Object.assign({}, defaultStyle, character.style);
  return (
      <div style={style}></div>
  );
};

const placeCharacters = (world, worldMap, characters) => {
  characters.forEach(c => {
    worldMap[c.x][c.y] = (<Tile tile={world[c.x][c.y]} character={c}/>);
  });
};

const App = () => {
  const world = generateMap(mapWidth, mapHeight);
  console.log(world);
  const makeTileRow = row => {
    return map(tile => {
      return (<Tile tile={tile}/>);
    }, row);
  };
  const Map = map(row => {
    return (
        <div>
        {makeTileRow(row)}
        </div>
    );
  }, world);
  console.log(Map);
  return (
      <div style={{display: 'flex', height: heightPx, width: widthPx}}>
      {Map}
      </div>
  );
};

ReactDOM.render(<App/>, document.getElementById('app'));
