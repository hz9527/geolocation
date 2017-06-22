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
  var arg = [].slice.call(arguments, 3)
  script.onload = function () {
    fn.apply(context, arg)
  }
  script.src = url
}
// 获取定位返回type lng lat lngLat 获取地理信息type lng lat lngLat city province district addr
// 获取定位只能使用h5定位，传入positionType作为ip定位
var Position = {
  config: {
    key: 'EP2BZ-N2U2U-UMPV6-2Z5NP-OV2JH-E6FI2',
    app: 'getPostion',
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
      if (config.key) {
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
      if (invalidType === -1) {
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
      this.config.app = options.app || 'getPostion'
    }
    if (this.config.positionType === 'default' && location.protocol !== 'https:') {
      console.warn('http can`t use geolocation')
    }
  },
  dealPosition: {
    default: function (pos) {
      return {
        lat: pos.latitude,
        lng: pos.longitude,
        latLng: pos.latitude + ',' + pos.longitude,
        info: null,
        type: 'default'
      }
    },
    QQ: function (pos) {
      return {
        lat: pos.location.lat,
        lng: pos.location.lng,
        latLng: pos.location.lat + ',' + pos.location.lng,
        info: pos.ad_info,
        type: 'IP'
      }
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
    }
  },
  dealFailMsg: {
    'QQ': function (res) {
      if (res.status === 310) {
        return '请求参数信息有误'
      } else if (res.status === 311) {
        return 'Key格式错误'
      } else if (res.status === 306) {
        return '请求参数错误'
      } else if (res.status === 110) {
        return '无权限'
      }
      return ''
    }
  },
  posNext: function (context, success, fail, pos) {
    if (this.config.type === 1) {
      success.call(context, pos)
    } else {
      this.getInfoByPos[this.config.mapType].call(this, pos, context, success, fail)
    }
  },
  getPostion: {
    'default': function (context, success, fail) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition( res => {
          this.posNext(context, success, fail, this.dealPosition.default(res.coords))
        }, err => {
          if (this.config.canIp) {
            this.getPostion[this.config.mapType].call(this, context, success, fail)
          } else {
            var msg = err.code === 1 ? '获取地理位置权限失败' : err.code === 2 ? '获取地理位置信息失败' : '获取地理位置超时'
            fail.call(context, msg)
          }
        }, {
          enableHighAccuracy: true,
          timeout: this.config.timeout,
          maximumAge: 0
        })
      }
    },
    'QQ': function (context, success, fail) {
      var that = this
      getJSONP('//apis.map.qq.com/ws/location/v1/ip?key=' + this.config.key + '&output=jsonp', function (res) {
        if (res.status === 0) {
          that.posNext(context, success, fail, that.dealPosition.QQ(res.result))
        } else {
          var msg = that.dealFailMsg['QQ'](res)
          if (res.code === -1) {
            msg = '请求超时'
          } else if (res.code === -2) {
            msg = '请求错误'
          }
          fail.call(context, msg)
        }
      })
    }
  },
  getInfoByPos: {
    'QQ': function (pos, context, success, fail) {
      var url = '//apis.map.qq.com/ws/geocoder/v1/?location=' + pos.latLng + '&key=' + this.config.key + '&output=jsonp'
      getJSONP(url, function (res) {
        console.log(res)
      })
    }
  },
  getPlaceInfo: {
    'QQ': function (context, success, fail) {
      if (window.qq && qq.maps && qq.maps.Geolocation) {
        var geolocation = new qq.maps.Geolocation()
        var that = this
        geolocation.getLocation(function (res) {
          success.call(context, that.dealPlaceInfo.QQ(res))
        }, function (err) {
          console.log(err)
        }, {
          timeout: this.config.timeout
        })
      } else {
        var url = '//apis.map.qq.com/tools/geolocation/min?key=' + this.config.key + '&referer=getPosition'
        setScript(url, this.getPlaceInfo.QQ, this, context, success, fail)
      }
    }
  },
  getLocation: function (context, success, fail) {
    context = context || null
    success = success || function (res) {console.log(res)}
    fail = fail || function () {}
    if (this.config.type === 3 || this.config.type === 1) {
      var type = this.config.positionType === 'default' ? 'default' : this.config.mapType
      this.getPostion[type].call(this, context, success, fail)
    } else {
      this.getPlaceInfo[this.config.mapType].call(this, context, success, fail)
    }
  }
}
