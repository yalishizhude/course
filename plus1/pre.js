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
      // 这里对变量定义和变量引用做一下区分，方便后面语法分析
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
      // 为了后面解析方便这里对变量引用和值进行区分
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
 *                            步骤2：语法分析（Parse）
 * 最终AST结构如下：
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
  // 记录当前遍历路径
  let path = [ast]
  // 指针，指向上一个选择器结点
  let preNode = ast
  // 便利到的当前结点
  let node
  // 用来存储变量值的对象
  let vDict = {}
  while (node = tokens.shift()) {
    // 对于变量引用，直接存储到vDict中
    if (node.type === 'variableDef') {
      if (tokens[0] && tokens[0].type === 'value') {
        const vNode = tokens.shift()
        vDict[node.value] = vNode.value
      } else {
        preNode.rules[preNode.rules.length - 1].value = vDict[node.value]
      }
      continue;
    }
    // 对于属性，在指针指向的结点rules属性中添加属性
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
    // 对于值，添加到value数组中
    if (node.type === 'value') {
      try {
        preNode.rules[preNode.rules.length - 1].value.push(node.value);
      } catch (e) {
        console.error(preNode)
      }
      continue;
    }
    // 对于变量引用，直接替换成对应的值
    if (node.type === 'variableRef') {
      preNode.rules[preNode.rules.length - 1].value.push(vDict[node.value]);
      continue;
    }
    // 对于选择器需要创建新的结点，并将指针
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
 * 为了方便代码生成，转换成下面的数组结构
 * {
 *   selector: string,
 *   rules: {
 *     property: string,
 *     value: string
 *   }[]
 * }[]
 * ============================================================================
 */
function transform(ast) {
  let newAst = [];
  /**
   * 遍历AST转换成数组，同时将选择器和值拼接起来
   * @param node AST结点
   * @param result 抽象语法数组
   * @param prefix 当前遍历路径上的选择器名称组成的数组
   */
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
 * 生成CSS样式规则：
 * div { color:darkkhaki; }
 * ...
 * ============================================================================
 */
function generate(nodes) {
  // 遍历抽象语法数组，拼接成CSS代码
  return nodes.map(n => {
    let rules = n.rules.reduce((acc, item) => acc += `${item.property}:${item.value};`, '')
    return `${n.selector} {${rules}}`
  }).join('\n')
}