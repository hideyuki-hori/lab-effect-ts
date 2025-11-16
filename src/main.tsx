import { Effect, Console } from 'effect'
import './reset.css'

main()

function main() {
  const program = Console.log('a')
  Effect.runSync(program)
}