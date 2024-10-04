// 디렉터리 아래의 언어 구성을 가져옵니다.
const context = require.context('./', false, /^((?!index).)*\.js$/)

// 언어 구성
export default context.keys().reduce((map, path) => {
  let [, key] = /\.\/(.*).js/g.exec(path)
  map[key] = context(path).default
  return map
}, {})
