#!/usr/bin/env node
import { Command } from 'commander'
import action from './action'

const program = new Command()

program
  .name('dep-cli')
  .description('CLI to parse node modules dependencies')
  .version('1.0.0')

program
  .argument('[path]', 'path to analyze node project dependencies', './')
  .option('--depth, -d <depth>', 'set the depth of parse')
  .option(
    '--json, -j <json>',
    'set the output as JSON file instead of opening a graph HTML file'
  )
  .action(action)

program.parse(process.argv)
