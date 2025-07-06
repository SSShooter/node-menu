import MindElixir from 'mind-elixir'
import example from 'mind-elixir/example'
import 'mind-elixir/style'

import nodeMenu from './nodeMenu'
// import nodeMenu from '@mind-elixir/plugin-name'

const app = document.querySelector('#app')
app.style.marginTop = '50px'
app.style.height = '800px'
app.style.width = '100%'

const options = {
  el: app,
  newTopicName: '子节点',
  direction: MindElixir.SIDE,
  // direction: MindElixir.RIGHT,
  locale: 'en',
  draggable: true,
  editable: true,
  contextMenu: true,
  contextMenuOption: {
    focus: true,
    link: true,
    extend: [
      {
        name: 'Node edit',
        onclick: () => {
          alert('extend menu')
        },
      },
    ],
  },
  toolBar: true,
  keypress: true,
  allowUndo: false,
  before: {
    moveDownNode() {
      return false
    },
    insertSibling(el, obj) {
      console.log('insertSibling', el, obj)
      return true
    },
    async addChild(el, obj) {
      console.log('addChild', el, obj)
      // await sleep()
      return true
    },
  },
  primaryLinkStyle: 1,
  primaryNodeVerticalGap: 15, // 25
  primaryNodeHorizontalGap: 15, // 65
}

const mind = new MindElixir(options)
mind.install(nodeMenu)
const data = MindElixir.new('new topic')
mind.init(example) // or try `example`
function sleep() {
  return new Promise((res, rej) => {
    setTimeout(() => res(), 1000)
  })
}
window.currentOperation = null
mind.bus.addListener('operation', (operation) => {
  console.log(operation)
  if (operation.name !== 'finishEdit') window.currentOperation = operation
  // return {
  //   name: action name,
  //   obj: target object
  // }

  // name: [insertSibling|addChild|removeNode|beginEdit|finishEdit]
  // obj: target

  // name: moveNode
  // obj: {from:target1,to:target2}
})
mind.bus.addListener('selectNode', (node) => {
  console.log(node)
})
mind.bus.addListener('expandNode', (node) => {
  console.log('expandNode: ', node)
})
window.m = mind
window.M = MindElixir
