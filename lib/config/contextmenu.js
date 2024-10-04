// 메뉴 데이터
const menuMap = {
  // 새로 고치다
  refresh: {
    handler({ data, $tabs }) {
      $tabs.refreshTab(data.id)
    }
  },

  // 모두 새로고침

  refreshAll: {
    handler({ $tabs }) {
      $tabs.refreshAll()
    }
  },

  // 닫기
  close: {
    enable({ target }) {
      return target.closable
    },
    handler({ data, $tabs }) {
      $tabs.closeTab(data.id)
    }
  },

  // 왼쪽 탭 닫기
  closeLefts: {
    enable({ $menu }) {
      return $menu.lefts.length
    },
    handler({ $menu }) {
      $menu.closeMulti($menu.lefts)
    }
  },

  // 오른족 탭 닫기
  closeRights: {
    enable({ $menu }) {
      return $menu.rights.length
    },
    handler({ $menu }) {
      $menu.closeMulti($menu.rights)
    }
  },

  // 현재 외 닫기
  closeOthers: {
    enable({ $menu }) {
      return $menu.others.length
    },
    handler({ $menu }) {
      $menu.closeMulti($menu.others)
    }
  }
}

// 遍历填充 id
Object.entries(menuMap).forEach(([id, item]) => (item.id = id))

export default menuMap

// 默认菜单
export const defaultMenu = [
  'refresh',
  'refreshAll',
  'close',
  'closeLefts',
  'closeRights',
  'closeOthers'
]
