import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './store';
import { connect } from 'react-redux';
import { map } from 'ramda';
import { Motion, spring } from 'react-motion';

import { tileSize, tilePx, heightPx, widthPx } from './constants';
import { findOnCoordinates, inRange, isVisible, distanceInPx } from './lib';


const tile = ({ tile, characters, selected, select, move, attack }) => {
  const style = Object.assign({}, {width: tilePx, height: tilePx}, tile);
  const character = findOnCoordinates(tile, characters);
  let onClick;
  if (character && character.friendly) {
    onClick = () => select(character);
  } else if (character && !character.friendly && selected) {
    onClick = () => attack(selected, character);
  } else {
    onClick = () => select(null);
  }
  if (selected && selected.movementRange && !character) {
    if (inRange(tile, selected, selected.movementRange)) {
      style.backgroundColor = 'blue';
      onClick = () => move(selected, tile);
    }
  }
  if (!isVisible(tile, characters)) {
    style.backgroundColor = 'gray';
  }
  return (
      <div style={style} onClick={onClick}>
      { character ? <Character character={character}/> : null }
      </div>
  );
};

const tileStateToProps = (state) => {
  return {
    characters: state.characters,
    selected: state.selected
  };
};

const tileDispatchToProps = dispatch => {
  return {
    select: value => {
      console.log('selecting', value);
      dispatch({
        type: 'SELECT_OBJECT',
        object: value
      });
    },
    move: (object, coordinates) => {
      dispatch({
        type: 'MOVE_OBJECT',
        object: object,
        coordinates: coordinates
      });
    },
    attack: (source, target) => {
      dispatch({
        type: 'ATTACK',
        target: target,
        source: source
      });
    }
  };
};

const Tile = connect(tileStateToProps, tileDispatchToProps)(tile);

const character = ({ character, finishMove, moveTo }) => {
  const size = tileSize / 2;
  const sizePx = size + 'px';
  const defaultStyle = {
    backgroundColor: character.friendly ? 'yellow' : 'red',
    borderRadius: '20px',
    height: sizePx,
    width: sizePx,
    marginLeft: (size / 2) + 'px',
    marginTop: (size / 2) + 'px'
  };
  const style = Object.assign({}, defaultStyle, character.style);
  if (character.isMoving && moveTo) {
    const springConf = {stiffness: 170, damping: 26, precision: 2};
    return (
        <Motion defaultStyle={{x: 0, y: 0}}
      style={{x: spring(distanceInPx(character.x, moveTo.x), springConf), y: spring(distanceInPx(character.y, moveTo.y), springConf)}}
      onRest={finishMove}>
        {({x, y}) =>
         <div style={Object.assign({}, style, {
           transform: `translate3d(${x}px, ${y}px, 0)`
         })}>
         </div>}
      </Motion>
    );
  } else {
    return (<div style={style}></div>);
  }
};

const characterDispatch = dispatch => {
  return {
    select: character => {
      dispatch({
        type: 'SELECT_OBJECT',
        object: character
      });
    },
    finishMove: () => {
      dispatch({
        type: 'FINISH_MOVE'
      });
    }
  };
};

const characterState = state => {
  return {
    moveTo: state.moveTo
  };
};

const Character = connect(characterState, characterDispatch)(character);

const projectile = ({projectile, finish}) => {
  const { source, target } = projectile;
  const width = 20;
  const style = {position: 'absolute', width: width + 'px', height: '4px', backgroundColor: 'brown'};
  const sourceXPx = source.x * (tileSize +2) + (tileSize/2);
  const sourceYPx = source.y * (tileSize +2)  + (tileSize/2);
  const springConf = { stiffness: 300, damping: 30, precision: 3};
  return (
      <Motion defaultStyle={{x: sourceXPx, y: sourceYPx}}
    style={{x: spring(sourceXPx + distanceInPx(source.x, target.x) - width, springConf), y: spring(sourceYPx + distanceInPx(source.y, target.y), springConf)}}
    onRest={finish}>
    {({x, y}) =>
     <div style={Object.assign({}, style, {
       transform: `translate3d(${x}px, ${y}px, 0)`
     })}>
     </div>}
      </Motion>
  );
};

const projectileDispatch = dispatch => {
  return {
    finish: () => {
      dispatch({
        type: 'FINISH_PROJECTILE'
      });
    }
  };
};

const Projectile = connect(null, projectileDispatch)(projectile);


const worldMap = ({world, projectile}) => {
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
  return (
      <div style={{display: 'flex', height: heightPx, width: widthPx}}>
      {projectile ? <Projectile projectile={projectile}/> : null}
      {Map}
    </div>
  );
};

const mapStateToProps = state => {
  return {
    world: state.world,
    projectile: state.projectile
  };
};

const Map = connect(mapStateToProps, null)(worldMap);

const App = () => {
  return (
      <Provider store={store}>
      <Map/>
      </Provider>
  );
};


ReactDOM.render(<App/>, document.getElementById('app'));
