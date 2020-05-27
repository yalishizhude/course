const css = `
$ib inline-block
div
  p
    transition zoom(1.4) translateX(10px)
  display $ib
  .a-b
    color red
    #user
      font-size 12px
.d-ib
  display inline-block
`
/*
最终编译结果：
div {
  display: inline-block;
}
div p{
  transition: zoom(1.4) translateX(10px);
}
div .a-b {
  color: red;
}
.d-ib {
  display: inline-block;
}
 */
/**
 * ============================================================================
 *                            词法分析器（Tokenize）!
 * type: 
 *   variable
 *   selector
 *   propertbb
 *   value
 * ============================================================================
 */
function tokenize(text) {
  let tokens = [];
  text.trim().split(/\n|\r\n/).forEach(line => {
    const spaces = line.match(/^\s+/) || ['']
    const indent = spaces[0].length
    const input = line.trim()
    let current = 0;
    while (current < input.length) {
      const char = input[current];
      const WHITESPACE = /\s/;
      const SELECTOR = /\.|#/
      let value = ''
      if (WHITESPACE.test(char)) {
        current++;
        continue;
      }
      // 变量
      if (char === '$') {
        value = char
        current++
        while (/[a-zA-Z0-9]/.test(input[current]) && current < input.length) {
          value += input[current];
          current++;
        }
        tokens.push({
          type: 'variable',
          value,
          indent
        })
        // 跳过空格
        value = ''
        current++
        // 值
        while (/[a-zA-Z0-9\-]/.test(input[current]) && current < input.length) {
          value += input[current];
          current++;
        }
        tokens.push({
          type: 'value',
          value,
          indent
        })
        value = ''
        continue;
      }
      // 选择器
      if (!WHITESPACE.test(input)) {
        let value = char
        current++
        while (/[a-zA-Z0-9\-]/.test(input[current]) && current < input.length) {
          value += input[current];
          current++;
        }
        tokens.push({
          type: 'selector',
          value,
          indent
        })
      } else {
        // 属性和值（变量）
        let words = input.split(/\s/)
        tokens.push({
          type: 'property',
          value: words.shift(),
          indent
        })
        const name = words.join(' ')
        if (/^\$/.test(name)) {
          tokens.push({
            type: 'variable',
            value: name,
            indent: 0
          })
        } else {
          tokens.push({
            type: 'value',
            value: name,
            indent: 0
          })
        }
      }
      break;
    }
  })
  return tokens;
}

/**
 * ============================================================================
 *                             语法分析器（Parse）!!!
 * {
 *   type: 'root',
 *   children: [{
 *     type: 'selector',
 *     rules: [{
 *       property: string,
 *       value: string,
 *     }],
 *     indent: number,
 *     children: []
 *   }]
 * } 
 * ============================================================================
 */
function parse(tokens) {
  var ast = {
    type: 'root',
    children: [],
    indent: -1
  };
  let path = [ast]
  let preNode = ast
  let node
  let vDict = {}
  while (node = tokens.shift()) {
    if (node.type === 'variable') {
      if (tokens[0] && tokens[0].type === 'value') {
        const vNode = tokens.shift()
        vDict[node.value] = vNode.value
      } else {
        preNode.rules[preNode.rules.length - 1].value = vDict[node.value]
      }
      continue;
    }
    if (node.type === 'property') {
      if (node.indent > preNode.indent) {
        preNode.rules.push({
          property: node.value
        })
      } else {
        let parent = path.pop()
        while (node.indent <= parent.indent) {
          parent = path.pop()
        }
        parent.rules.push({
          property: node.value
        })
        preNode = parent
        path.push(parent)
      }
      continue;
    }
    if (node.type === 'value') {
      preNode.rules[preNode.rules.length - 1].value = node.value
      continue;
    }
    if (node.type === 'selector') {
      const item = {
        type: 'selector',
        value: node.value,
        indent: node.indent,
        rules: [],
        children: []
      }
      if (node.indent > preNode.indent) {
        path[path.length - 1].indent === node.indent && path.pop()
        path.push(item)
        preNode.children.push(item);
        preNode = item;
      } else {
        let parent = path.pop()
        while (node.indent <= parent.indent) {
          parent = path.pop()
        }
        parent.children.push(item)
        path.push(item)
      }
    }
  }
  return ast;
}

/**
 * ============================================================================
 *                                   转换器!!!
 * ============================================================================
 */

function transform(ast) {
  let newAst = [];
  function traverse(node, result, prefix) {
    let selector = ''
    if(node.type === 'selector') {
      selector = prefix + ' ' + node.value;
      result.push({
        selector,
        rules: node.rules
      })
    }
    for(let i=0;i<node.children.length;i++) {
      traverse(node.children[i], result, selector)
    }
  } 
  traverse(ast, newAst, '')
  return newAst;
}

/**
 * ============================================================================
 *                         !!!!!!!!!!!!编译器!!!!!!!!!!!
 * ============================================================================
 */

function compile(nodes) {
  return nodes.map(n => {
    let rules = n.rules.reduce((acc,item) => acc+=`${item.property}:${item.value};`, '')
    return `${n.selector} { ${rules} }`
  }).join('\n')
}

function log(o) {
  typeof o === 'object' ? console.log(JSON.stringify(o, null, 2)) : console.log(o)
}
const pre = {
  tokenize: tokenize,
  parse: parse,
  transform: transform,
  compile: compile
};
const token = pre.tokenize(css)
// log(token)
const ast = pre.parse(token)
// log(ast)
const na = pre.transform(ast);
// log(na)
const code = pre.compile(na);
log(code);