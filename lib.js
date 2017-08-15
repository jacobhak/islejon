import { curry, find, reduce, filter, prop } from 'ramda';
import { tileSize } from './constants';
export const sameCoordinates = curry((a, b) => {
  return a.x === b.x && a.y === b.y;
});

export const findOnCoordinates = (coordinates, collection) => {
  return find(sameCoordinates(coordinates), collection);
};

export const distance = (a, b) => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

export const distanceInPx = (a, b) => {
  return (b - a) * (tileSize + 2);
};

export const inRange = (a, b, range) => {
  return distance(a, b) <= range;
};

export const friendlyCharacters = filter(prop('friendly'));

export const isVisible = (tile, characters) => {
  const friendlies = friendlyCharacters(characters);
  return reduce((acc, character) => {
    return acc || inRange(character, tile, character.sightRange);
  }, false, friendlies);
};

export const randomInRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
