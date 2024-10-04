// 빈 객체와 배열
export const emptyObj = Object.create(null)
export const emptyArray = []

// 배열에서 항목 제거
export function remove(arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

/**
 * 지정된 위치로 스크롤
 * @export
 * @param {Element} wrap 스크롤 영역
 * @param {number} [left=0]
 * @param {number} [top=0]
 */
export function scrollTo({ wrap, left = 0, top = 0, smooth = true }) {
  if (!wrap) return

  if (wrap.scrollTo) {
    wrap.scrollTo({
      left,
      top,
      behavior: smooth ? 'smooth' : 'auto'
    })
  } else {
    wrap.scrollLeft = left
    wrap.scrollTop = top
  }
}

/**
 * 지정된 요소를 가시 영역으로 스크롤합니다.
 * @export
 * @param {Element} el 대상 요소
 * @param {Element} wrap 스크롤 영역
 * @param {String} block 세로 정렬, 선택 사항: '시작', '가운데', '끝' 또는 ​​'가장 가까운'
 * @param {String} inline 가로정렬, 선택값은 위와 동일
 */
export function scrollIntoView({
  el,
  wrap,
  block = 'start',
  inline = 'nearest'
}) {
  if (!el || !wrap) return

  if (el.scrollIntoView) {
    el.scrollIntoView({ behavior: 'smooth', block, inline })
  } else {
    let { offsetLeft, offsetTop } = el
    let left, top

    if (block === 'center') {
      top = offsetTop + (el.clientHeight - wrap.clientHeight) / 2
    } else {
      top = offsetTop
    }

    if (inline === 'center') {
      left = offsetLeft + (el.clientWidth - wrap.clientWidth) / 2
    } else {
      left = offsetLeft
    }

    scrollTo({ wrap, left, top })
  }
}

// 스크롤 막대 너비 가져오기
export const getScrollbarWidth = (function() {
  let width = null

  return function() {
    if (width !== null) return width

    const div = document.createElement('div')

    div.style.cssText = 'width: 100px; height: 100px;overflow-y: scroll'
    document.body.appendChild(div)
    width = div.offsetWidth - div.clientWidth
    div.parentElement.removeChild(div)

    return width
  }
})()

/**
 * 계산된 속성 추출
 * @export
 * @param {String} origin 소스 속성
 * @param {Array|Object} props 추출해야 하는 계산된 속성
 * @param {String} context 소스 옵션이 함수인 경우 입력 매개변수
 * @returns {Object}
 */
export function mapGetters(origin, props, context) {
  const map = {}

  const each = (prop, option) => {
    if (option === null || typeof option !== 'object') {
      option = { default: option }
    }

    const { default: def, alias } = option

    map[alias || prop] = function() {
      const val = this[origin][prop]
      if (context && typeof val === 'function') {
        // 함수 반환
        return val(this[context])
      } else if (def !== undefined && val === undefined) {
        // 기본값
        if (typeof def === 'function') {
          return def.bind(this)()
        }
        return def
      }
      return val
    }
  }

  if (Array.isArray(props)) {
    props.forEach(prop => each(prop))
  } else {
    Object.entries(props).forEach(([prop, def]) => each(prop, def))
  }

  return map
}

// 경로에서 해시 제거
export const prunePath = path => path.split('#')[0]

// 구문 분석 전환 구성
export function getTransOpt(trans) {
  return typeof trans === 'string' ? { name: trans } : trans
}

// 구성 요소 ID 가져오기
export function getCtorId(vm) {
  return vm.$.vnode.type.__hmrId
}
