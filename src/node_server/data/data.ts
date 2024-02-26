import { ShipData } from './types';

export const ERROR_COMMAND_MESSAGE = 'No such command';

export const BOT_SHIPS_LAYOUTS: ShipData[][] = [
  [
    { position: { x: 9, y: 1 }, direction: true, type: 'huge', length: 4 },
    { position: { x: 5, y: 0 }, direction: true, type: 'large', length: 3 },
    { position: { x: 0, y: 0 }, direction: true, type: 'large', length: 3 },
    { position: { x: 2, y: 2 }, direction: false, type: 'medium', length: 2 },
    { position: { x: 4, y: 7 }, direction: false, type: 'medium', length: 2 },
    { position: { x: 0, y: 8 }, direction: false, type: 'medium', length: 2 },
    { position: { x: 7, y: 1 }, direction: false, type: 'small', length: 1 },
    { position: { x: 0, y: 5 }, direction: true, type: 'small', length: 1 },
    { position: { x: 5, y: 4 }, direction: true, type: 'small', length: 1 },
    { position: { x: 3, y: 0 }, direction: true, type: 'small', length: 1 },
  ],
  [
    { position: { x: 2, y: 3 }, direction: false, type: 'huge', length: 4 },
    { position: { x: 7, y: 4 }, direction: true, type: 'large', length: 3 },
    { position: { x: 0, y: 1 }, direction: true, type: 'large', length: 3 },
    { position: { x: 5, y: 0 }, direction: true, type: 'medium', length: 2 },
    { position: { x: 9, y: 4 }, direction: true, type: 'medium', length: 2 },
    { position: { x: 9, y: 0 }, direction: true, type: 'medium', length: 2 },
    { position: { x: 2, y: 8 }, direction: false, type: 'small', length: 1 },
    { position: { x: 2, y: 1 }, direction: false, type: 'small', length: 1 },
    { position: { x: 0, y: 7 }, direction: false, type: 'small', length: 1 },
    { position: { x: 7, y: 2 }, direction: false, type: 'small', length: 1 },
  ],
  [
    { position: { x: 5, y: 7 }, direction: false, type: 'huge', length: 4 },
    { position: { x: 0, y: 1 }, direction: false, type: 'large', length: 3 },
    { position: { x: 7, y: 0 }, direction: true, type: 'large', length: 3 },
    { position: { x: 0, y: 6 }, direction: false, type: 'medium', length: 2 },
    { position: { x: 9, y: 3 }, direction: true, type: 'medium', length: 2 },
    { position: { x: 4, y: 2 }, direction: false, type: 'medium', length: 2 },
    { position: { x: 3, y: 7 }, direction: false, type: 'small', length: 1 },
    { position: { x: 7, y: 4 }, direction: true, type: 'small', length: 1 },
    { position: { x: 5, y: 0 }, direction: true, type: 'small', length: 1 },
    { position: { x: 6, y: 9 }, direction: true, type: 'small', length: 1 },
  ],
];
