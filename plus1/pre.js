const css = `
$ib inline-block
$borderColor lightgreen
div
  p
    border 1px solid $borderColor
  color darkkhaki
  .a-b
    background-color lightyellow
    [data]
      padding 15px
      font-size 12px
.d-ib
  display $ib
`
/*
最终编译结果：
div { color:darkkhaki; }
div p { border:1px solid lightgreen; }
div .a-b { background-color:lightyellow; }
div .a-b [data] { font-size:12px; }
.d-ib { display:inline-block; }
 */
/**
 * ============================================================================
 *                            步骤1：词法分析
 * 将源代码字符串分解成为token数组，每个token是一个json对象，结构如下：
 * {
 *   type: "variableDef" | "variableRef" | "selector" | "property" | "value", //枚举值，分别对应变量定义、变量引用、选择器、属性、值
 *   value: string, // token字符值，即被分解的字符串
 *   indent: number // 缩进空格数，需要根据它判断从属关系
 * }
 * ============================================================================
 */
function tokenize(text) {
  // 去除多余的空格，逐行解析
  return text.trim().split(/\n|\r\n/).reduce((tokens, line, idx) => {
    // 计算缩进空格数
    const spaces = line.match(/^\s+/) || ['']
    const indent = spaces[0].length
    // 将字符串去首尾空给
    const input = line.trim()
    // 通过空格分割字符串成数组
    const words = input.split(/\s/)
    let value = words.shift()
    // 选择器为单个单词
    if (words.length === 0) {
      tokens.push({
        type: 'selector',
        value,
        indent
      })
    } else {
      //  这里对变量定义和变量引用做一下区分，方便后面语法分析
      let type = ''
      if (/^\$/.test(value)) {
        type = 'variableDef'
      } else if (/^[a-zA-Z-]+$/.test(value)) {
        type = 'property'
      } else {
        throw new Error(`Tokenize error:Line ${idx} "${value}" is not a vairable or property!`)
      }
      tokens.push({
        type,
        value,
        indent
      })
      while (value = words.shift()) {
        tokens.push({
          type: /^\$/.test(value) ? 'variableRef' : 'value',
          value,
          indent: 0
        })
      }
    }
    return tokens;
  }, [])
}

/**
 * ============================================================================
 *                             步骤2：语法分析（Parse）
 * {
 *   type: 'root',
 *   children: [{
 *     type: 'selector',
 *     rules: [{
 *       property: string,
 *       value: string[],
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
    if (node.type === 'variableDef') {
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
          property: node.value,
          value: []
        })
      } else {
        let parent = path.pop()
        while (node.indent <= parent.indent) {
          parent = path.pop()
        }
        parent.rules.push({
          property: node.value,
          value: []
        })
        preNode = parent
        path.push(parent)
      }
      continue;
    }
    if (node.type === 'value') {
      try {
        preNode.rules[preNode.rules.length - 1].value.push(node.value);
      } catch (e) {
        console.error(preNode)
      }
      continue;
    }
    if (node.type === 'variableRef') {
      preNode.rules[preNode.rules.length - 1].value.push(vDict[node.value]);
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
 *                             步骤3：转换
 * ============================================================================
 */

function transform(ast) {
  let newAst = [];

  function traverse(node, result, prefix) {
    let selector = ''
    if (node.type === 'selector') {
      selector = [...prefix, node.value];
      result.push({
        selector: selector.join(' '),
        rules: node.rules.reduce((acc, rule) => {
          acc.push({
            property: rule.property,
            value: rule.value.join(' ')
          })
          return acc;
        }, [])
      })
    }
    for (let i = 0; i < node.children.length; i++) {
      traverse(node.children[i], result, selector)
    }
  }
  traverse(ast, newAst, [])
  return newAst;
}

/**
 * ============================================================================
 *                         步骤4：代码生成
 * ============================================================================
 */

function generate(nodes) {
  return nodes.map(n => {
    let rules = n.rules.reduce((acc, item) => acc += `${item.property}:${item.value};`, '')
    return `${n.selector} {${rules}}`
  }).join('\n')
}

function log(...args) {
  Array.prototype.forEach.call(args, o => {
    typeof o === 'object' ? console.log(JSON.stringify(o, null, 2)) : console.log(o)
  })
}
const pre = {
  tokenize: tokenize,
  parse: parse,
  transform: transform,
  generate: generate
};
const token = pre.tokenize(css)
log('token:', token)
const ast = pre.parse(token)
log('ast:', ast)
const na = pre.transform(ast);
log('newAst:', na)
const code = pre.generate(na);
log('code:', code)
const node = document.createTextNode(code);
const style = document.createElement('style');
style.appendChild(node);
document.head.appendChild(style);