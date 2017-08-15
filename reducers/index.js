import { mapWidth, mapHeight } from '../constants';
import { map, range, assoc, update, indexOf, remove } from 'ramda';
import { randomInRange } from '../lib';

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

const character = {
  x: 5,
  y: 6,
  actions: 2,
  movementRange: 5,
  sightRange: 8,
  hp: 10,
  armor: 0,
  accuracy: 0.8,
  friendly: true,
  isMoving: false,
  weapon: {
    name: 'bow',
    minDamage: 3,
    maxDamage: 5,
    accuracy: 0.7
  }
};

const enemy = {
  x: 8,
  y: 9,
  actions: 2,
  movementRange: 5,
  sightRange: 8,
  hp: 7,
  armor: 0,
  accuracy: 0.7,
  friendly: false,
  weapon: {
    name: 'bow',
    minDamage: 3,
    maxDamage: 5,
    accuracy: 0.7
  }  
};

const initialState = {
  moveTo: null,
  selected: null,
  characters: [character, enemy],
  world: generateMap(mapWidth, mapHeight),
  projectile: {
    source: {
      x: 8,
      y: 8
    },
    target: {
      x: 0,
      y: 0
    }
  }
};

const reducer = (state=initialState, action) => {
  switch(action.type) {
  case 'SELECT_OBJECT':
    return Object.assign({}, state, {selected: action.object});
  case 'MOVE_OBJECT':
    return move(state, action.object, action.coordinates);
  case 'ATTACK':
    return attack(state, action.source, action.target);
  case 'FINISH_MOVE':
    return finishMove(state);
  case 'FINISH_PROJECTILE':
    return Object.assign({}, state, {projectile: null});
  default:
    return state;
  }
};

const attack = (state, source, target) => {
  const hitChance = source.accuracy * source.weapon.accuracy;
  if (hitChance >= Math.random()) {
    console.log('Hit the target');
    const damage = randomInRange(source.weapon.minDamage, source.weapon.maxDamage);
    const newTarget = assoc('hp', target.hp - damage, target);
    console.log(`dealt ${damage} damage`);
    let newCharacters;
    if (newTarget.hp <= 0) {
      console.log('target died!');
      newCharacters = remove(indexOf(target, state.characters), 1, state.characters);
    } else {
      newCharacters = update(indexOf(target, state.characters), newTarget, state.characters);
      console.log(`target has ${target.hp - damage} hp left`);
    }
    return Object.assign({}, state, {
      characters: newCharacters,
      projectile: {
        source: source,
        target: target
      }
    });
  } else {
    console.log('missed!');
    return Object.assign({}, state, {
      projectile: {
        source: source,
        target: target
      }
    });
  }
};

const finishMove = state => {
  const newObject = assoc('x', state.moveTo.x, assoc('y', state.moveTo.y, state.selected));
  return Object.assign({}, state, {
    moveTo: null,
    characters: update(indexOf(state.selected, state.characters), newObject, state.characters),
    selected: newObject
  });
};

const move = (state, object, coordinates) => {
  console.log(`moving to ${coordinates.x}, ${coordinates.y}`);
  const newObject = assoc('isMoving', true, object);
  return Object.assign({}, state, {
    moveTo: {x: coordinates.x, y: coordinates.y},
    characters: update(indexOf(state.selected, state.characters), newObject, state.characters),
    selected: newObject
  });
};

export default reducer;
