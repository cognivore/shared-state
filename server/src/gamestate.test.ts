import { broadcast, send } from "./transport"
import { init, update, state, GAMESTATE, addClient, removeClient, State, updateLag } from './gamestate'
jest.mock('./transport')

interface SomeState extends State {
  some: string
  another: string
}

describe('gamestate', () => {

  beforeEach(() => {
    init<SomeState>({some: 'state'})
  })

  it('should broadcast a new state on init', () => {
    expect(broadcast).toHaveBeenCalledWith(GAMESTATE.INIT, {some: 'state', clients: [], lagStatistics: {}})
  })

  it('should update values in the state', () => {
    update<SomeState>({some: 'new'})
    expect(state()).toMatchObject({some: 'new'})
  })

  it('should add fields to the state', () => {
    update<SomeState>({some: 'state', another: 'new'})
    expect(state()).toMatchObject({some: 'state', another: 'new'})
  })

  it('should remove fields from the state', () => {
    update({})
    expect(state()).not.toHaveProperty('some')
  })

  it('should broadcast diff on update', () => {
    update<SomeState>({some: 'new', another: 'state'})
    expect(broadcast).toHaveBeenLastCalledWith(GAMESTATE.UPDATE, {some: 'new', another: 'state', clients: [], lagStatistics: {}})
  })

  it('should send init on new client join', () => {
    addClient('1')
    expect(send).toHaveBeenCalledWith('1', GAMESTATE.INIT, {some: 'state', clients: ['1'], lagStatistics: { 1: Infinity }})
  })

  it('should send update on client removal', () => {
    addClient('1')
    removeClient('1')
    expect(broadcast).toHaveBeenCalledWith(GAMESTATE.UPDATE, {some: 'state', clients: [], lagStatistics: {}})
  })

  it('should update lagStatistics', () => {
    updateLag('1', 1)
    expect(state()).toMatchObject({lagStatistics: new Map([['1', 1]])})
    expect(send).toHaveBeenLastCalledWith('1', GAMESTATE.UPDATE, expect.objectContaining({lagStatistics: {1: 1}}))
  })
})
