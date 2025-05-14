const config = require('./config.js')
const decodeCookie = require('./decodeCookie.js')
var sess = wx.getStorageSync('JSESSIONID')

module.exports = function (path, data, method) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: config.baseUrl + path,
      method: method,
      data: data,
      header: {
        'Cookie': wx.getStorageSync("sessionid")? wx.getStorageSync("sessionid") :"",
        'Cookie': sess ? 'JSESSIONID=' + sess : ''
      },      
      success: res => {
        if (res && res.header && res.header["Set-Cookie"]) {
          wx.setStorageSync("sessionid", res.header["Set-Cookie"]); //登录返回，保存Cookie到Storage
          }
        if (res.header['Set-Cookie'] !== undefined) {
          sess = decodeCookie(res.header['Set-Cookie'])['JSESSIONID']
          wx.setStorageSync('JSESSIONID', sess)
        }      
        // 请求成功
        if (res.statusCode !== 200) {
          fail('服务器异常', reject)
          return
        }
        if (res.data.code === 0) {
          fail(res.data.msg, reject)
          return
        }      
        resolve(res.data)
      },
      fail: function () {
        // 请求失败
        fail('加载数据失败', reject)
      }
    })
  })
}
function fail(title, callback) {
  wx.hideLoading()
  wx.showModal({
    title: title,
    confirmText: '重试',
    success: res => {
      if (res.confirm) {
        callback()
      }
    }
  })
}
