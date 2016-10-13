# maze-generator-dev
Development support library for maze-generator plugins

This library supplies useful functions for developing plugins for the
[@sbj42/maze-generator](https://www.npmjs.com/package/@sbj42/maze-generator)
library.

## testAlgorithm

`testAlgorithm(algorithmName, algorithmFunc, options)`

Call this to run a standard set of tests on the algorithm.

## benchmarkAlgorithm

`benchmarkAlgorithm(algorithmName, algorithmFunc, options)`

Call this to run a standard set of performance benchmarks on the algorithm.

## cliDemoAlgorithm

`cliDemoAlgorithm(algorithmName, algorithmFunc, width, height, options)`

Call this from a command-line program, to print a sample maze for the algorithm.

## webDemoAlgorithm

`webDemoAlgorithm(algorithmName, algorithmModulePath, outPath)`

Call this to generate a static web page that demonstrates the algorithm.
