import './nodeMenu.less'
import './icons/iconfont.js'
import i18n from './i18n.js'
import type { MindElixirInstance, Topic } from 'mind-elixir'

const createDiv = (id, innerHTML) => {
  const div = document.createElement('div')
  div.id = id
  div.innerHTML = innerHTML
  return div
}

const colorList = [
  '#2c3e50',
  '#34495e',
  '#7f8c8d',
  '#94a5a6',
  '#bdc3c7',
  '#ecf0f1',
  '#8e44ad',
  '#9b59b6',
  '#2980b9',
  '#3298db',
  '#c0392c',
  '#e74c3c',
  '#d35400',
  '#f39c11',
  '#f1c40e',
  '#17a085',
  '#27ae61',
  '#2ecc71',
]

export default function (mind: MindElixirInstance) {
  console.log('install node menu')
  // Prevent current node is unselected during onchange event
  let lastNode:Topic|null = null
  function clearSelect(klass, remove) {
    const elems = mind.container.querySelectorAll(klass)
    ;[].forEach.call(elems, function (el) {
      el.classList.remove(remove)
    })
  }

  // create element
  const locale = i18n[mind.locale] ? mind.locale : 'en'
  const styleDiv = createDiv(
    'nm-style',
    `
  <div class="nm-fontsize-container">
    ${['15', '24', '32']
      .map((size) => {
        return `<div class="size"  data-size="${size}">
    <svg class="icon" style="width: ${size}px;height: ${size}px" aria-hidden="true">
      <use xlink:href="#icon-a"></use>
    </svg></div>`
      })
      .join('')}<div class="bold"><svg class="icon" aria-hidden="true">
<use xlink:href="#icon-B"></use>
</svg></div>
  </div>
  <div class="nm-fontcolor-container">
    ${colorList
      .map((color) => {
        return `<div class="split6"><div class="palette" data-color="${color}" style="background-color: ${color};"></div></div>`
      })
      .join('')}
  </div>
  <div class="bof">
  <span class="font">${i18n[locale].font}</span>
  <span class="background">${i18n[locale].background}</span>
  </div>`
  )
  const tagDiv = createDiv(
    'nm-tag',
    `${i18n[locale].tag}<input class="nm-tag" tabindex="-1" placeholder="${i18n[locale].tagsSeparate}" />`
  )
  const iconDiv = createDiv(
    'nm-icon',
    `${i18n[locale].icon}<input class="nm-icon" tabindex="-1" placeholder="${i18n[locale].iconsSeparate}" />`
  )
  const urlDiv = createDiv(
    'nm-url',
    `${i18n[locale].url}<input class="nm-url" tabindex="-1" />`
  )
  const memoDiv = createDiv(
    'nm-memo',
    `${
      i18n[locale].memo || 'Memo'
    }<textarea class="nm-memo" rows="5" tabindex="-1" />`
  )

  // create container
  const menuContainer = document.createElement('div')
  menuContainer.className = 'node-menu'
  menuContainer.innerHTML = `
  <div class="button-container"><svg class="icon" aria-hidden="true">
  <use xlink:href="#icon-close"></use>
  </svg></div>
  `

  // prevent unselect node
  menuContainer.addEventListener('mousedown', (e) => {
    e.stopPropagation()
  })
  // workaround for mind elixir onkeydown e.preventDefault()
  menuContainer.addEventListener('keydown', (e) => {
    e.stopPropagation()
  })

  menuContainer.appendChild(styleDiv)
  menuContainer.appendChild(tagDiv)
  menuContainer.appendChild(iconDiv)
  menuContainer.appendChild(urlDiv)
  menuContainer.appendChild(memoDiv)
  menuContainer.hidden = true
  mind.container.append(menuContainer)

  // query input element
  const sizeSelector = menuContainer.querySelectorAll('.size')
  const bold: HTMLElement = menuContainer.querySelector('.bold')!
  const buttonContainer: HTMLElement =
    menuContainer.querySelector('.button-container')!
  const fontBtn: HTMLElement = menuContainer.querySelector('.font')!
  const tagInput: HTMLInputElement = menuContainer.querySelector('.nm-tag')!
  const iconInput: HTMLInputElement = menuContainer.querySelector('.nm-icon')!
  const urlInput: HTMLInputElement = menuContainer.querySelector('.nm-url')!
  const memoInput: HTMLInputElement = menuContainer.querySelector('.nm-memo')!

  // handle input and button click
  let bgOrFont
  menuContainer.onclick = (e) => {
    if (!mind.currentNode) return
    const nodeObj = mind.currentNode.nodeObj
    const target = e.target as HTMLElement
    if (target.className === 'palette') {
      clearSelect('.palette', 'nmenu-selected')
      target.className = 'palette nmenu-selected'
      const color = target.dataset.color
      const patch = { style: {} as any }
      if (bgOrFont === 'font') {
        patch.style.color = color
      } else if (bgOrFont === 'background') {
        patch.style.background = color
      }
      console.log(patch)
      mind.reshapeNode(mind.currentNode, patch)
    } else if (target.className === 'background') {
      clearSelect('.palette', 'nmenu-selected')
      bgOrFont = 'background'
      target.className = 'background selected'
      target.previousElementSibling!.className = 'font'
      if (nodeObj.style && nodeObj.style.background) {
        menuContainer.querySelector(
          '.palette[data-color="' + nodeObj.style.background + '"]'
        )!.className = 'palette nmenu-selected'
      }
    } else if (target.className === 'font') {
      clearSelect('.palette', 'nmenu-selected')
      bgOrFont = 'font'
      target.className = 'font selected'
      target.nextElementSibling!.className = 'background'
      if (nodeObj.style && nodeObj.style.color) {
        menuContainer.querySelector(
          '.palette[data-color="' + nodeObj.style.color + '"]'
        )!.className = 'palette nmenu-selected'
      }
    }
  }
  Array.from(sizeSelector).map((dom) => {
    ;(dom as HTMLElement).onclick = (e) => {
      if(!lastNode) return 
      clearSelect('.size', 'size-selected')
      const size = e.currentTarget as HTMLElement
      size.className = 'size size-selected'
      mind.reshapeNode(lastNode, {
        style: { fontSize: size.dataset.size + 'px' },
      })
    }
  })
  bold.onclick = (e: MouseEvent & { currentTarget: Element }) => {
    if (!lastNode) return
    let fontWeight = ''
    if (lastNode.nodeObj?.style?.fontWeight === 'bold') {
      e.currentTarget.className = 'bold'
    } else {
      fontWeight = 'bold'
      e.currentTarget.className = 'bold size-selected'
    }
    mind.reshapeNode(lastNode, { style: { fontWeight } })
  }
  tagInput.onchange = (e: InputEvent & { target: HTMLInputElement }) => {
    if (!lastNode) return
    if (typeof e.target.value === 'string') {
      const newTags = e.target.value.split(',')
      mind.reshapeNode(lastNode, { tags: newTags.filter((tag) => tag) })
    }
  }
  iconInput.onchange = (e: InputEvent & { target: HTMLInputElement }) => {
    if (!lastNode) return
    if (typeof e.target.value === 'string') {
      const newIcons = e.target.value.split(',')
      mind.reshapeNode(lastNode, {
        icons: newIcons.filter((icon) => icon),
      })
    }
  }
  urlInput.onchange = (e: InputEvent & { target: HTMLInputElement }) => {
    if (!lastNode) return
    mind.reshapeNode(lastNode, { hyperLink: e.target.value })
  }
  memoInput.onchange = (e: InputEvent & { target: HTMLInputElement }) => {
    if (!lastNode) return
    lastNode.nodeObj.memo = e.target.value
    mind.bus.fire('operation', {
      name: 'updateMemo',
      obj: lastNode.nodeObj,
    })
  }
  let state = 'open'
  buttonContainer.onclick = (e) => {
    menuContainer.classList.toggle('close')
    if (state === 'open') {
      state = 'close'
      buttonContainer.innerHTML = `<svg class="icon" aria-hidden="true"><use xlink:href="#icon-menu"></use></svg>`
    } else {
      state = 'open'
      buttonContainer.innerHTML = `<svg class="icon" aria-hidden="true"><use xlink:href="#icon-close"></use></svg>`
    }
  }

  // handle node selection
  mind.bus.addListener('unselectNodes', function () {
    menuContainer.hidden = true
  })
  mind.bus.addListener('selectNodes', function (nodeObjs) {
    // if (!clickEvent) return
    if(nodeObjs.length !== 1) return 
    const nodeObj = nodeObjs[0]
    lastNode = mind.currentNode
    menuContainer.hidden = false
    clearSelect('.palette', 'nmenu-selected')
    clearSelect('.size', 'size-selected')
    clearSelect('.bold', 'size-selected')
    bgOrFont = 'font'
    fontBtn.className = 'font selected'
    fontBtn.nextElementSibling!.className = 'background'
    if (nodeObj.style) {
      if (nodeObj.style.fontSize) {
        menuContainer.querySelector(
          '.size[data-size="' + nodeObj.style.fontSize + '"]'
        )!.className = 'size size-selected'
      }
      if (nodeObj.style.fontWeight) {
        menuContainer.querySelector('.bold')!.className = 'bold size-selected'
      }
      if (nodeObj.style.color) {
        menuContainer.querySelector(
          '.palette[data-color="' + nodeObj.style.color + '"]'
        )!.className = 'palette nmenu-selected'
      }
    }
    if (nodeObj.tags) {
      tagInput.value = nodeObj.tags.join(',')
    } else {
      tagInput.value = ''
    }
    if (nodeObj.icons) {
      iconInput.value = nodeObj.icons.join(',')
    } else {
      iconInput.value = ''
    }
    urlInput.value = nodeObj.hyperLink || ''
    memoInput.value = nodeObj.memo || ''
  })
}
