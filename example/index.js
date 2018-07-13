const postcss = require('postcss');
const selectors = require('../lib');
const { join } = require('path');

postcss([
  selectors(),
])
  .process('.foo {color: red}', { from: join('expample', 'in.css'), to: join('expample', 'out.css') })
  .then((result) => {
    console.log(result.toString()); // eslint-disabled-line
  })