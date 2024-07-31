import { MessageTypesForAll, MessageTypesPersonal } from './enums';

export interface LoginOrCreateRequest {
  type: MessageTypesPersonal.reg;
  data: string;
  id: number;
}

export interface LoginOrCreateResponse {
  type: MessageTypesPersonal.reg;
  data: string;
  id: number;
}

export interface UpdateWinnersResponse {
  type: MessageTypesForAll.update_winners;
  data: string;
  id: number;
}

export interface UpdateRoomResponse {
  type: MessageTypesForAll.update_room;
  data: string;
  id: 0;
}
