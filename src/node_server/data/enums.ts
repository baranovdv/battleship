export enum MessageTypesGameRoom {
  create_room = 'create_room',
  update_room = 'update_room',
  add_user_to_room = 'add_user_to_room',
  start_game = 'start_game',
  turn = 'turn',
  randomAttack = 'randomAttack',
  finish = 'finish',
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
  SELF,
}
