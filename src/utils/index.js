import Vue from 'vue'
import router from '@/router'
import store from '@/store'
import * as CryptoJS from 'crypto-js'

/**
 * 获取uuid
 * @returns {string}
 */
export function getUUID () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    return (c === 'x' ? (Math.random() * 16 | 0) : ('r&0x3' | '0x8')).toString(16)
  })
}
/**
 * @Description: 是否有权限
 * @author Bobbi
 * @date 18-9-28
*/
export function isAuth (key) {
  return JSON.parse(sessionStorage.getItem('permissions') || '[]').indexOf(key) !== -1 || false
}
/**
 * 树形数据转换
 * @param {*} data
 * @param {*} id
 * @param {*} pid
 */
export function treeDataTranslate (data, id = 'id', pid = 'parentId') {
  var res = []
  var temp = {}
  for (var i = 0; i < data.length; i++) {
    temp[data[i][id]] = data[i]
  }
  for (var k = 0; k < data.length; k++) {
    if (temp[data[k][pid]] && data[k][id] !== data[k][pid]) {
      if (!temp[data[k][pid]]['children']) {
        temp[data[k][pid]]['children'] = []
      }
      if (!temp[data[k][pid]]['_level']) {
        temp[data[k][pid]]['_level'] = 1
      }
      data[k]['_level'] = temp[data[k][pid]]._level + 1
      temp[data[k][pid]]['children'].push(data[k])
    } else {
      res.push(data[k])
    }
  }
  return res
}

/**
 * @Description: 清除登录信息
 * @author Bobbi
 * @date 18-9-28
*/
export function clearLoginInfo () {
  Vue.cookie.delete('token')
  store.commit('resetStore')
  router.options.isAddDynamicMenuRoutes = false
}
// base64转换成file文件
export function Base64ToBlob(urlData) {
  // 去掉url的头，并转换为byte
  const bytes = window.atob(urlData.split(',')[1])

  // 处理异常,将ascii码小于0的转换为大于0
  const ab = new ArrayBuffer(bytes.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < bytes.length; i++) {
    ia[i] = bytes.charCodeAt(i)
  }
  return new Blob([ab], {
    type: 'image/png'
  })
}

/**
 * 根据Type获取参数
 * @param type
 * @param key
 * @returns {*}
 */
export function getSysParam (type, key, list) {
  let sysParamList = list || JSON.parse(localStorage.getItem('sysParamList'))
  for (let i = 0; i < sysParamList.length; i++) {
    let sysParam = sysParamList[i]
    if (sysParam.type === type && sysParam.parKey === (key)) {
      return sysParam.parValue
    }
  }
}

/**
 * 根据type获取参数列表
 * @param type
 * @returns {Array}
 */
export function getSysParamArr (type) {
  let sysParamList = JSON.parse(localStorage.getItem('sysParamList'))
  let resultArr = []
  for (let i = 0; i < sysParamList.length; i++) {
    let sysParam = sysParamList[i]
    if (sysParam.type === type) {
      resultArr.push(sysParam)
    }
  }
  return resultArr
}

export function debounce (func, wait, immediate) {
  let timeout, args, context, timestamp, result

  const later = function () {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp

    // 上次被包装函数被调用时间间隔last小于设定时间间隔wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }

  return function (...args) {
    context = this
    timestamp = +new Date()
    const callNow = immediate && !timeout
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }

    return result
  }
}
/**
 *加密处理
 */
export const encryption = (params) => {
  const {
    data,
    type,
    param
  } = params;

  let { key } = params;

  const result = JSON.parse(JSON.stringify(data));

  if (type === 'Base64') {
    param.forEach(ele => {
      result[ele] = btoa(result[ele])
    })
  } else {
    param.forEach(ele => {
      var data = result[ele];

      key = CryptoJS.enc.Latin1.parse(key);

      var iv = key
      // 加密
      var encrypted = CryptoJS.AES.encrypt(
        data,
        key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.ZeroPadding
        })
      result[ele] = encrypted.toString()
    });

  }
  return result
}
