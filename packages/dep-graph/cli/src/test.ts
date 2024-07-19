import { Command } from 'commander'

const program = new Command()

program
  .name('dep-cli')
  .description('CLI to parse node modules dependencies')
  .version('1.0.0')

program
  .command('analyze')
  .argument('<path>', 'path to analyze node project dependencies')
  .option('--depth', 'set the depth of parse')
