#!/usr/bin/env node

const path = require('path')
const command = process.argv[2]

require(path.resolve(__dirname, 'command', command))
