export enum MessageTypesGameRoom {
  create_room = 'create_room',
  update_room = 'update_room',
  add_user_to_room = 'add_user_to_room',
  start_game = 'start_game',
  create_game = 'create_game',
  add_ships = 'add_ships',
  turn = 'turn',
  attack = 'attack',
  randomAttack = 'randomAttack',
  finish = 'finish',
  single_play = 'single_play',
}

export enum MessageTypesPersonal {
  reg = 'reg',
}

export enum MessageTypesForAll {
  update_room = 'update_room',
  update_winners = 'update_winners',
}

export enum MessageAddress {
  ALL,
  BOT,
}

export enum SHIP_STATE {
  NO_SHIP,
  SHIP,
  SHOT,
}
