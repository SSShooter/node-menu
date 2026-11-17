import './nodeMenu.less'
import './icons/iconfont.js'
import i18n from './i18n.js'
import type MindElixir from 'mind-elixir'
import type { NodeObj, Topic } from 'mind-elixir'

const createDiv = (id: string, innerHTML: string) => {
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

export default function (mind: MindElixir) {
  console.log('install node menu')
  // Prevent current node is unselected during onchange event
  let lastNode: Topic | null = null
  function clearSelect(klass: string, remove: string) {
    const elems = mind.container.querySelectorAll(klass)
    elems.forEach((el) => {
      el.classList.remove(remove)
    })
  }

  // create element
  // `locale` was removed from the core instance in MindElixir v6, but it still
  // exists in v5. Keep reading it when present, otherwise fall back to English.
  const mindLocale = (mind as MindElixir & { locale?: string }).locale
  const locale = mindLocale && i18n[mindLocale] ? mindLocale : 'en'
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
      i18n[locale].note || 'Note'
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
  const memoInput: HTMLTextAreaElement =
    menuContainer.querySelector('.nm-memo')!

  // handle input and button click
  let bgOrFont: 'font' | 'background' = 'font'
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
  bold.onclick = () => {
    if (!lastNode) return
    let fontWeight = ''
    if (lastNode.nodeObj?.style?.fontWeight === 'bold') {
      bold.className = 'bold'
    } else {
      fontWeight = 'bold'
      bold.className = 'bold size-selected'
    }
    mind.reshapeNode(lastNode, { style: { fontWeight } })
  }
  tagInput.onchange = () => {
    if (!lastNode) return
    const newTags = tagInput.value.split(',')
    mind.reshapeNode(lastNode, { tags: newTags.filter((tag) => tag) })
  }
  iconInput.onchange = () => {
    if (!lastNode) return
    const newIcons = iconInput.value.split(',')
    mind.reshapeNode(lastNode, {
      icons: newIcons.filter((icon) => icon),
    })
  }
  urlInput.onchange = () => {
    if (!lastNode) return
    mind.reshapeNode(lastNode, { hyperLink: urlInput.value })
  }
  memoInput.onchange = () => {
    if (!lastNode) return
    mind.reshapeNode(lastNode, { note: memoInput.value })
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
  mind.bus.addListener('selectNodes', function (nodeObjs: NodeObj[]) {
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
          '.size[data-size="' + parseInt(nodeObj.style.fontSize) + '"]'
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
      // v6 tags may be plain strings or `{ text }` objects
      tagInput.value = nodeObj.tags
        .map((tag) => (typeof tag === 'string' ? tag : tag.text))
        .join(',')
    } else {
      tagInput.value = ''
    }
    if (nodeObj.icons) {
      iconInput.value = nodeObj.icons.join(',')
    } else {
      iconInput.value = ''
    }
    urlInput.value = nodeObj.hyperLink || ''
    memoInput.value = nodeObj.note || (nodeObj as NodeObj & { memo?: string }).memo || ''
  })
}
