// type BD SG QQ GD
function getJSONP (url, callBack, timeout) { // state -1 timeout -2 loaderror
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
}
function setScript (url, fn, context) {
  var script = document.createElement('script')
  document.querySelector('body').appendChild(script)
  if (typeof fn === 'function') {
    var arg = [].slice.call(arguments, 3)
    script.onload = function () {
      fn.apply(context, arg)
    }
  }
  script.src = url
}
// 获取定位返回type lng lat lngLat 获取地理信息type lng lat lngLat city province district addr
// 获取定位只能使用h5定位，传入positionType作为ip定位
var Position = {
  config: {
    key: 'EP2BZ-N2U2U-UMPV6-2Z5NP-OV2JH-E6FI2',
    app: 'getPosition',
    positionType: 'default', // default map
    mapType: 'QQ',
    type: 3, // 1 position 2 place 3 posParsePlace
    canIp: true,
    timeout: 5000
  },
  mapConf: ['BD', 'SG', 'QQ', 'GD'],
  typeConf: [1, 2, 3],
  setConfig: function (options) {
    if (options && options.constructor === Object) {
      var needKey = false
      if (options.key) {
        this.config.key = options.key
        needKey = true
      }
      if (options.positionType) {
        if (options.positionType !== 'default' && options.positionType !== 'map') {
          throw new Error('positionType is invalid')
        }
        if (options.positionType === 'map' && !needKey) {
          needKey = -1
        }
        this.config.positionType = options.positionType
      }
      if (options.mapType) {
        if (options.positionType !== 'QQ' && !needKey) {
          needKey = -1
        }
        if (!this.mapConf.some(key => key === options.mapType)) {
          throw new Error('mapType is invalid')
        }
        this.config.mapType = options.mapType
      }
      if (needKey === -1) {
        throw new Error('key is necessary')
      }
      if (options.type) {
        if (!this.typeConf.some(key => key === options.type)) {
          throw new Error('type is invalid')
        }
        this.config.type = options.type
      }
      if (options.canIp === false) {
        this.config.canIp = false
      }

      if (options.timeout > 0) {
        this.config.timeout = options.timeout
      }
      this.config.app = options.app || 'getPosition'
    }
  },
  dealPosition: {
    'default': function (pos) {
      return {
        lat: pos.latitude,
        lng: pos.longitude,
        latLng: pos.latitude + ',' + pos.longitude,
        info: null,
        type: 'default'
      }
    },
    'QQ': function (pos) {
      pos = pos.result
      return {
        lat: pos.location.lat,
        lng: pos.location.lng,
        latLng: pos.location.lat + ',' + pos.location.lng,
        info: pos.ad_info,
        type: 'IP'
      }
    },
    'BD': function (pos) {
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
    'GD': function (res) {
      return {}
    },
    'SG': function (res) {
      return {}
    }
  },
  dealInfoByPos: {
    'QQ': function (info, pos) {
      info = info.result
      return {
        positionType: pos.type,
        lat: pos.lat,
        lng: pos.lng,
        latLng: pos.latLng,
        type: 'QQ',
        info: {
          address: info.address,
          nation: info.ad_info.nation,
          province: info.ad_info.province,
          city: info.ad_info.city,
          district: info.ad_info.district
        }
      }
    },
    'BD': function (info, pos) {
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
    },
    'GD': function (res) {
      return {}
    },
    'SG': function (res) {
      return {}
    }
  },
  dealPlaceInfo: {
    'QQ': function (pos) {
      return {
        lat: pos.lat,
        lng: pos.lng,
        latLng: pos.lat + ',' + pos.lng,
        info: {
          address: pos.addr,
          nation: pos.nation,
          province: pos.province,
          city: pos.city,
          district: pos.district
        },
        type: 'QQ'
      }
    },
    'BD': function (res) {
      return {}
    },
    'GD': function (res) {
      return {}
    },
    'SG': function (res) {
      return {}
    }
  },
  dealStatus: {
    'QQ': function (res) {
      if (res.status === 0) {
        return true
      } else if (res.status === 310) {
        return '请求参数信息有误'
      } else if (res.status === 311) {
        return 'Key格式错误'
      } else if (res.status === 306) {
        return '请求参数错误'
      } else if (res.status === 110) {
        return '无权限'
      }
      return false
    },
    'BD': function (res) {
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
    'GD': function (res) {
      return {}
    },
    'SG': function (res) {
      return {}
    }
  },
  getIpServeUrl: {
    'QQ': function () {
      return '//apis.map.qq.com/ws/location/v1/ip?key=' + this.config.key + '&output=jsonp'
    },
    'BD': function () {
      return '//api.map.baidu.com/location/ip?ak=' + this.config.key + '&coor=bd09ll&output=jsonp'
    }
  },
  getInfoByPosServeUrl: {
    'QQ': function (pos) {
      return '//apis.map.qq.com/ws/geocoder/v1/?location=' + pos.latLng + '&key=' + this.config.key + '&output=jsonp'
    },
    'BD': function (pos) {
      return '//api.map.baidu.com/geocoder/v2/?location=' + pos.latLng + '&output=json&pois=0&ak=' + this.config.key
    }
  },
  posNext: function (context, success, fail, pos) {
    if (this.config.type === 1) {
      success.call(context, pos)
    } else {
      this.getInfoByPos.call(this, pos, context, success, fail)
    }
  },
  getPosition: {
    'default': function (context, success, fail) {
      if ('geolocation' in navigator) {
        if (this.config.positionType === 'default' && location.protocol !== 'https:') {
          console.warn('http can`t use geolocation')
        }
        navigator.geolocation.getCurrentPosition( res => {
          this.posNext(context, success, fail, this.dealPosition.default(res.coords))
        }, err => {
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
    'map': function (context, success, fail) { // ip
      var that = this
      var url = this.getIpServeUrl[that.config.mapType].call(this)
      getJSONP(url, function (res) {
        var msg = that.dealStatus[that.config.mapType](res)
        if (msg === true) {
          that.posNext(context, success, fail, that.dealPosition[that.config.mapType](res))
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
  getInfoByPos: function (pos, context, success, fail) {
    var url = this.getInfoByPosServeUrl[this.config.mapType].call(this, pos)
    var that = this
    getJSONP(url, function (res) {
      var msg = that.dealStatus[that.config.mapType](res)
      if (msg === true) {
        success.call(context, that.dealInfoByPos[that.config.mapType](res, pos))
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
  getPlaceInfo: {
    'QQ': function (context, success, fail) {
      if (window.qq && qq.maps && qq.maps.Geolocation) {
        var geolocation = new qq.maps.Geolocation()
        var that = this
        geolocation.getLocation(function (res) {
          success.call(context, that.dealPlaceInfo.QQ(res))
        }, function (err) {
          if (that.config.canIp) {
            that.getPosition.map(context, success, fail)
          } else {
            fail(context, '请求错误')
          }
        }, {
          timeout: this.config.timeout
        })
      } else {
        var url = '//apis.map.qq.com/tools/geolocation/min?key=' + this.config.key + '&referer=getPosition'
        setScript(url, this.getPlaceInfo.QQ, this, context, success, fail)
      }
    },
    'BD': function (context, success, fail) {
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
        setScript(url, this.getPlaceInfo.BD, this, context, success, fail)
      }
    }
  },
  getLocation: function (context, success, fail) {
    context = context || null
    success = success || function (res) {console.log(res)}
    fail = fail || function () {}
    if (this.config.type === 3 || this.config.type === 1) {
      this.getPosition[this.config.positionType].call(this, context, success, fail)
    } else {
      this.getPlaceInfo[this.config.mapType].call(this, context, success, fail)
    }
  }
}
