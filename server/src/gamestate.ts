import { broadcast, ID, send } from "./transport"
import { diff, applyChange } from 'deep-diff'

export enum GAMESTATE {
  INIT = 'gamestate-init',
  UPDATE = 'gamestate-update'
}

export interface State {
  clients: ID[]
  [key: string]: any
}
let current: State = { clients: [] }

export function state<T extends State>(): T {
  return current as T
}

export function init<T extends State>(state: Partial<T>) {
  current = JSON.parse(JSON.stringify(Object.assign({ clients: [] }, state)))
  broadcast(GAMESTATE.INIT, current)
}

export function update<T extends State>(state: Partial<State>) {
  state.clients = current.clients
  diff(current, state)?.map(d => {
    applyChange(current, state, d)
  })
  broadcast(GAMESTATE.UPDATE, current)
}

export function addClient(id: ID) {
  current.clients.push(id)
  send(id, GAMESTATE.INIT, current)
  update(current)
}

export function removeClient(id: ID) {
  current.clients.splice(current.clients.indexOf(id), 1)
  update(current)
}
