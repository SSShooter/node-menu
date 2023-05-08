# @mind-elixir/node-menu

It was originally a built-in plugin of [mind-elixir](https://github.com/ssshooter/mind-elixir-core), but it was extracted after version 2.0.0 because it should be highly customizable. Please feel free to fork this repository and create your own node menu.

## How To Use

```
npm i @mind-elixir/node-menu
```

```javascript
import MindElixir from 'mind-elixir'
import nodeMenu from '@mind-elixir/node-menu'

const mind = new MindElixir(options)
mind.install(nodeMenu)
mind.init(data)
```