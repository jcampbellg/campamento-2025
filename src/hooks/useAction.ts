import { useActionState, useTransition } from 'react'

export type ServerAction<State, Payload> = (state: State, payload: Payload) => State | Promise<State>

export default function useAction<State, Payload>(serverAction: ServerAction<State, Payload>, initialState: Awaited<State>) {
  const [data, send] = useActionState<State, Payload>(serverAction, initialState)
  const [isPending, startTransition] = useTransition()

  const run = async (data: Payload) => {
    startTransition(() => {
      send(data)
    })
  }

  return {
    data, isPending, run
  }
}