window.getLocation = {
  config: {
    key: 'dvrEqPombaLKTVpKCSIj9pyF',
    positionType: 'default', // default map(ip)
    type: 2, // position 1 palce 2 posParsePlace 3
    canIp: true,
    timeout: 10000
  },
  setConfig: function (options) {
    if (options !== null && typeof options === 'object') {
      Object.keys(options).forEach(key => {
        if (this.config[key]) {
          this.config[key] = options[key]
        }
      })
    }
  },
  getJSONP: function (url, callBack, timeout) {
    var script
    if (timeout === void 0) {
      timeout = 5000
    }
    var name = 'GETJSONP' + Math.random().toFixed(5).replace('.', '')
    window[name] = function (res) {
      callBack(res)
      script.onerror = null
      document.querySelector('body').removeChild(script)
      delete window[name]
    }
    script = document.createElement('script')
    script.type = 'text/javascript'
    document.querySelector('body').appendChild(script)
    script.src = url + '&callback=' + name
    script.onerror = function () {
      window[name]({code: -2, data: null})
    }
    if (timeout !== null) {
      setTimeout(() => {
        if (window[name]) {
          window[name]({code: -1, data: null})
          window[name] = function () {
            delete window[name]
          }
        }
      }, timeout)
    }
  },
  setScript (url, fn, context) {
    var script = document.createElement('script')
    document.querySelector('body').appendChild(script)
    if (typeof fn === 'function') {
      var arg = [].slice.call(arguments, 3)
      script.onload = function () {
        fn.apply(context, arg)
      }
    }
    script.src = url
  },
  dealPostion: {
    default: function (pos) {
      return {
        lat: pos.latitude,
        lng: pos.longitude,
        latLng: pos.latitude + ',' + pos.longitude,
        info: null,
        type: 'default'
      }
    },
    BD: function (pos) {
      pos = pos.content
      return {
        lat: pos.point.y,
        lng: pos.point.x,
        latLng: pos.point.y + ',' + pos.point.x,
        info: {
          address: pos.address,
          nation: '',
          province: pos.address_detail.province,
          city: pos.address_detail.city,
          district: pos.address_detail.district
        },
        type: 'IP'
      }
    },
  },
  dealStatus: {
    BD: function (res) {
      if (res.status === 0) {
        return true
      } else if (res.status === 1) {
        return '地图服务器内部错误'
      } else if (res.status === 2) {
        return '请求参数错误'
      } else if (res.status === 3) {
        return '权限校验失败'
      } else if (res.status === 4) {
        return '配额校验失败'
      } else if (res.status === 5) {
        return 'Key格式错误'
      } else if (res.status === 101) {
        return '服务禁用'
      } else if (res.status === 102) {
        return '不通过白名单或者安全码不对'
      } else if (res.status >= 200) {
        return '无权限'
      } else if (res.status >= 300) {
        return '配额错误'
      }
      return false
    },
  },
  dealInfoByPos: {
    BD: function (info, pos) {
      info = info.result
      return {
        positionType: pos.type,
        lat: pos.lat,
        lng: pos.lng,
        latLng: pos.latLng,
        type: 'BD',
        info: {
          address: info.formatted_address,
          nation: info.addressComponent.country,
          province: info.addressComponent.province,
          city: info.addressComponent.city,
          district: info.addressComponent.district
        }
      }
    }
  },
  getPosition: {
    default: function (context, success, fail) {
      if ('geolocation' in navigator) {
        if (location.protocol !== 'https:') {
          console.warn('http can`t use geolocation')
        }
        navigator.geolocation.getCurrentPosition(res => {
          this.posNext(context, success, fail, this.dealPostion.default(res.coords))
        }, err => {
          console.log(err)
          if (this.config.canIp) {
            this.getPosition.map.call(this, context, success, fail)
          } else {
            var msg = err.code === 1 ? '获取地理位置权限失败' : err.code === 2 ? '获取地理位置信息失败' : '获取地理位置超时'
            fail.call(context, msg)
          }
        }, {
          enableHighAccuracy: true,
          timeout: this.config.timeout,
          maximumAge: 0
        })
      } else {
        if (this.config.canIp) {
          this.getPosition.map.call(this, context, success, fail)
        } else {
          fail.call(context, '本设备不支持H5定位')
        }
      }
    },
    map: function (context, success, fail) {
      var that = this
      var url = '//api.map.baidu.com/location/ip?ak=' + this.config.key + '&coor=bd09ll&output=jsonp'
      this.getJSONP(url, res => {
        var msg = that.dealStatus['BD'](res)
        if (msg === true) {
          that.posNext(context, success, fail, that.dealPostion['BD'](res))
        } else {
          if (!msg) {
            if (res.code === -1) {
              msg = '请求超时'
            } else if (res.code === -2) {
              msg = '请求错误'
            }
          }
          fail.call(context, msg)
        }
      })
    }
  },
  posNext: function (context, success, fail, pos) {
    if (this.config.type === 1) {
      success.call(context, pos)
    } else {
      this.getInfoByPos.call(this, pos, context, success, fail)
    }
  },
  getInfoByPos: function (pos, context, success, fail) {
    var url = '//api.map.baidu.com/geocoder/v2/?location=' + pos.latLng + '&output=json&pois=0&ak=' + this.config.key
    var that = this
    this.getJSONP(url, res => {
      var msg = that.dealStatus['BD'](res)
      if (msg === true) {
        success.call(context, that.dealInfoByPos['BD'](res, pos))
      } else {
        if (!msg) {
          if (res.code === -1) {
            msg = '请求超时'
          } else if (res.code === -2) {
            msg = '请求错误'
          }
        }
        fail.call(context, msg)
      }
    })
  },
  getPlaceInfo: function (context, success, fail) {
    if (window.BMap) {
      var geolocation = new BMap.Geolocation()
      var that = this
      geolocation.getCurrentPosition(function (res) {
        if (this.getStatus() === 0) {
          var pos = {
            lat: res.point.lat,
            lng: res.point.lng,
            latLng: res.point.lat + ',' + res.point.lng,
            type: 'map'
          }
          that.getInfoByPos(pos, context, success, fail)
        } else {
          that.getPosition.map.call(that, context, success, fail)
        }
      }, {
        timeout: this.config.timeout
      })
    } else {
      var url = '//api.map.baidu.com/getscript?v=2.0&ak=' + this.config.key + '&services=&t=20170608143204'
      this.setScript(url, this.getPlaceInfo, this, context, success, fail)
    }
  },
  init: function (success, fail, context) {
    context = context || null
    success = success || function () {}
    fail = fail || function () {}
    if (this.config.type === 3 || this.config.type === 1) {
      this.getPosition[this.config.positionType].call(this, context, success, fail)
    } else {
      this.getPlaceInfo.call(this, context, success, fail)
    }
  }
}
