import { importPage } from '../utils'
import extendRoutes from '../utils/extendRoutes'
import getPageRoutes from './page'

// PascalCase 转 kebab-case
const pascal2Kebab = str =>
  str
    .replace(/([a-z])([A-Z])/g, ($, $1, $2) => $1 + '-' + $2.toLowerCase())
    .replace(/^([A-Z])/, ($, $1) => $1.toLowerCase())

// 需要自定义的框架路由
const frameRoutes = {
  Reuse: {
    redirect: 'rule/default/'
  },

  Iframe: {
    redirect: 'operate',
    children: [
      {
        path: 'operate',
        component: importPage('IframeOperate'),
        meta: {
          title: 'Iframe 탭'
        }
      }
    ]
  },

  I18n: {
    redirect: 'lang',
    children: [
      {
        path: 'lang',
        component: importPage('I18n'),
        meta: {
          title: 'i18n:i18n',
          icon: 'rt-icon-doc'
        }
      },
      {
        path: 'page/:id',
        component: importPage('Page'),
        meta: {
          title: 'i18n:page',
          icon: 'rt-icon-doc'
        }
      }
    ]
  },

  PageScroller: {
    redirect: 'page/1',
    children: [
      {
        path: 'page/:id',
        component: importPage('Page'),
        meta: {
          title: route => `페이지 밖으로 스크롤${route.params.id}`,
          icon: 'rt-icon-doc',
          key: 'path'
        }
      },
      {
        path: 'scroll-position',
        component: importPage('ScrollPosition'),
        meta: {
          title: '페이지 내부 스크롤',
          icon: 'rt-icon-doc'
        }
      },
      {
        path: 'scroll-multi',
        component: importPage('ScrollMulti'),
        meta: {
          title: '다중 스크롤',
          icon: 'rt-icon-doc'
        }
      },
      {
        path: 'scroll-async',
        component: importPage('ScrollAsync'),
        meta: {
          title: '비동기 스크롤',
          icon: 'rt-icon-doc'
        }
      }
    ]
  }
}

// 获取目录下框架路由
const context = require.context('../components/frames/', false, /^.*\.vue$/)

// 生成框架路由
const routes = context.keys().map(filePath => {
  const frame = filePath.match(/\w+/)[0]
  const path = '/' + pascal2Kebab(frame) + '/'
  const { redirect, children } = frameRoutes[frame] || {}

  return {
    path,
    component: context(filePath).default,
    redirect: path + (redirect || 'page/1'),
    children: children || getPageRoutes()
  }
})

routes.forEach(extendRoutes)

export default routes
