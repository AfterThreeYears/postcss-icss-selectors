/* eslint-env jest */
import postcss from "postcss";
import plugin from "./src";

const tests = [
  {
    should: "scope selectors",
    input: ".foobar {}",
    expected: ":local(.foobar) {}"
  },
  {
    should: "scope ids",
    input: "#foobar {}",
    expected: ":local(#foobar) {}"
  },
  {
    should: "scope multiple selectors",
    input: ".foo, .baz {}",
    expected: ":local(.foo), :local(.baz) {}"
  },
  {
    should: "scope sibling selectors",
    input: ".foo ~ .baz {}",
    expected: ":local(.foo) ~ :local(.baz) {}"
  },
  {
    should: "scope psuedo elements",
    input: ".foo:after {}",
    expected: ":local(.foo):after {}"
  },
  {
    should: "scope media queries",
    input: "@media only screen { .foo {} }",
    expected: "@media only screen { :local(.foo) {} }"
  },
  {
    should: "allow narrow global selectors",
    input: ":global(.foo .bar) {}",
    expected: ".foo .bar {}"
  },
  {
    should: "allow narrow local selectors",
    input: ":local(.foo .bar) {}",
    expected: ":local(.foo) :local(.bar) {}"
  },
  {
    should: "allow broad global selectors",
    input: ":global .foo .bar {}",
    expected: ".foo .bar {}"
  },
  {
    should: "allow broad local selectors",
    input: ":local .foo .bar {}",
    expected: ":local(.foo) :local(.bar) {}"
  },
  {
    should: "allow multiple narrow global selectors",
    input: ":global(.foo), :global(.bar) {}",
    expected: ".foo, .bar {}"
  },
  {
    should: "allow multiple broad global selectors",
    input: ":global .foo, :global .bar {}",
    expected: ".foo, .bar {}"
  },
  {
    should: "allow multiple broad local selectors",
    input: ":local .foo, :local .bar {}",
    expected: ":local(.foo), :local(.bar) {}"
  },
  {
    should: "allow narrow global selectors nested inside local styles",
    input: ".foo :global(.foo .bar) {}",
    expected: ":local(.foo) .foo .bar {}"
  },
  {
    should: "allow broad global selectors nested inside local styles",
    input: ".foo :global .foo .bar {}",
    expected: ":local(.foo) .foo .bar {}"
  },
  {
    should: "allow parentheses inside narrow global selectors",
    input: ".foo :global(.foo:not(.bar)) {}",
    expected: ":local(.foo) .foo:not(.bar) {}"
  },
  {
    should: "allow parentheses inside narrow local selectors",
    input: ".foo :local(.foo:not(.bar)) {}",
    expected: ":local(.foo) :local(.foo):not(:local(.bar)) {}"
  },
  {
    should: "allow narrow global selectors appended to local styles",
    input: ".foo:global(.foo.bar) {}",
    expected: ":local(.foo).foo.bar {}"
  },
  {
    should: "ignore selectors that are already local",
    input: ":local(.foobar) {}",
    expected: ":local(.foobar) {}"
  },
  {
    should: "ignore nested selectors that are already local",
    input: ":local(.foo) :local(.bar) {}",
    expected: ":local(.foo) :local(.bar) {}"
  },
  {
    should: "ignore multiple selectors that are already local",
    input: ":local(.foo), :local(.bar) {}",
    expected: ":local(.foo), :local(.bar) {}"
  },
  {
    should: "ignore sibling selectors that are already local",
    input: ":local(.foo) ~ :local(.bar) {}",
    expected: ":local(.foo) ~ :local(.bar) {}"
  },
  {
    should: "ignore psuedo elements that are already local",
    input: ":local(.foo):after {}",
    expected: ":local(.foo):after {}"
  },
  {
    should: "broad global should be limited to selector",
    input: ":global .foo, .bar :global, .foobar :global {}",
    expected: ".foo, :local(.bar), :local(.foobar) {}"
  },
  {
    should: "broad global should be limited to nested selector",
    input: ".foo:not(:global .bar).foobar {}",
    expected: ":local(.foo):not(.bar):local(.foobar) {}"
  },
  {
    should: "broad global and local should allow switching",
    input: ".foo :global .bar :local .foobar :local .barfoo {}",
    expected: ":local(.foo) .bar :local(.foobar) :local(.barfoo) {}"
  },
  {
    should: "default to global when mode provided",
    input: ".foo {}",
    options: { mode: "global" },
    expected: ".foo {}"
  },
  {
    should: "default to local when mode provided",
    input: ".foo {}",
    options: { mode: "local" },
    expected: ":local(.foo) {}"
  },
  {
    should: "use correct spacing",
    input: [
      ".a :local .b {}",
      ".a:local.b {}",
      ".a:local(.b) {}",
      ".a:local( .b ) {}",
      ".a :local(.b) {}",
      ".a :local( .b ) {}",
      ":local(.a).b {}",
      ":local( .a ).b {}",
      ":local(.a) .b {}",
      ":local( .a ) .b {}"
    ].join("\n"),
    options: { mode: "global" },
    expected: [
      ".a :local(.b) {}",
      ".a:local(.b) {}",
      ".a:local(.b) {}",
      ".a:local(.b) {}",
      ".a :local(.b) {}",
      ".a :local(.b) {}",
      ":local(.a).b {}",
      ":local(.a).b {}",
      ":local(.a) .b {}",
      ":local(.a) .b {}"
    ].join("\n")
  },
  {
    should: "ignore :export statements",
    input: ":export { foo: __foo; }",
    expected: ":export { foo: __foo; }"
  },
  {
    should: "ignore :import statemtents",
    input: ':import("~/lol.css") { foo: __foo; }',
    expected: ':import("~/lol.css") { foo: __foo; }'
  },
  {
    should: "compile in pure mode",
    input: ':global(.foo).bar, [type="radio"] ~ .label, :not(.foo), #bar {}',
    options: { mode: "pure" },
    expected: '.foo:local(.bar), [type="radio"] ~ :local(.label), :not(:local(.foo)), :local(#bar) {}'
  },
  {
    should: "compile explict global element",
    input: ":global(input) {}",
    expected: "input {}"
  },
  {
    should: "compile explict global attribute",
    input: ':global([type="radio"]), :not(:global [type="radio"]) {}',
    expected: '[type="radio"], :not([type="radio"]) {}'
  },

  {
    should: "throw on invalid mode",
    input: "",
    options: { mode: "???" },
    error: /"global", "local" or "pure"/
  },
  {
    should: "throw on inconsistent selector result",
    input: ":global .foo, .bar {}",
    error: /Inconsistent/
  },
  {
    should: "throw on nested :locals",
    input: ":local(:local(.foo)) {}",
    error: /is not allowed inside/
  },
  {
    should: "throw on nested :globals",
    input: ":global(:global(.foo)) {}",
    error: /is not allowed inside/
  },
  {
    should: "throw on nested mixed",
    input: ":local(:global(.foo)) {}",
    error: /is not allowed inside/
  },
  {
    should: "throw on nested broad :local",
    input: ":global(:local .foo) {}",
    error: /is not allowed inside/
  },
  {
    should: "throw on incorrect spacing with broad :global",
    input: ".foo :global.bar {}",
    error: /Missing whitespace after :global/
  },
  {
    should: "throw on incorrect spacing with broad :local",
    input: ".foo:local .bar {}",
    error: /Missing whitespace before :local/
  },
  {
    should: "throw on not pure selector (global class)",
    input: ":global(.foo) {}",
    options: { mode: "pure" },
    error: /":global\(\.foo\)" is not pure/
  },
  {
    should: "throw on not pure selector (with multiple 1)",
    input: ".foo, :global(.bar) {}",
    options: { mode: "pure" },
    error: /".foo, :global\(\.bar\)" is not pure/
  },
  {
    should: "throw on not pure selector (with multiple 2)",
    input: ":global(.bar), .foo {}",
    options: { mode: "pure" },
    error: /":global\(\.bar\), .foo" is not pure/
  },
  {
    should: "throw on not pure selector (element)",
    input: "input {}",
    options: { mode: "pure" },
    error: /"input" is not pure/
  },
  {
    should: "throw on not pure selector (attribute)",
    input: '[type="radio"] {}',
    options: { mode: "pure" },
    error: /"\[type="radio"\]" is not pure/
  },
  {
    should: "pass through global element",
    input: "input {}",
    expected: "input {}"
  },
  {
    should: "localise class and pass through element",
    input: ".foo input {}",
    expected: ":local(.foo) input {}"
  },
  {
    should: "pass through attribute selector",
    input: '[type="radio"] {}',
    expected: '[type="radio"] {}'
  },
  {
    should: "not crash on atrule without nodes",
    input: '@charset "utf-8";',
    expected: '@charset "utf-8";'
  },
  {
    should: "not crash on a rule without nodes",
    input: (() => {
      var inner = postcss.rule({ selector: ".b", ruleWithoutBody: true });
      var outer = postcss.rule({ selector: ".a" }).push(inner);
      var root = postcss.root().push(outer);
      inner.nodes = undefined;
      return root;
    })(),
    // postcss-less's stringify would honor `ruleWithoutBody` and omit the trailing `{}`
    expected: ":local(.a) {\n    :local(.b) {}\n}"
  },
  {
    should: "not localize keyframes rules",
    input: "@keyframes foo { from {} to {} }",
    expected: "@keyframes foo { from {} to {} }"
  }
];

const run = (css, options) =>
  postcss(plugin(options))
    .process(css)
    .then(result => result.css)
    .catch(e => Promise.reject(e.message));

tests.forEach(testCase => {
  test(testCase.should, () => {
    if (testCase.error) {
      return expect(run(testCase.input, testCase.options)).rejects.toMatch(
        RegExp(testCase.error)
      );
    } else {
      return expect(run(testCase.input, testCase.options)).resolves.toEqual(
        testCase.expected
      );
    }
  });
});
