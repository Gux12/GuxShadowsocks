let cp = require('child_process')
export default {
  removeAll: function () {
    try {
      cp.execSync('networksetup -setftpproxystate wi-fi off')
      cp.execSync('networksetup -setwebproxystate wi-fi off')
      cp.execSync('networksetup -setsecurewebproxystate wi-fi off')
      cp.execSync('networksetup -setstreamingproxystate wi-fi off')
      cp.execSync('networksetup -setgopherproxystate wi-fi off')
      cp.execSync('networksetup -setsocksfirewallproxystate wi-fi off')
      cp.execSync('networksetup -setproxyautodiscovery wi-fi off')
      cp.execSync('networksetup -setautoproxystate wi-fi off')
    } catch (e) {
      console.error(e)
    }
  },
  proxyState: function () {
    try {
      let ftpProxy = cp.execSync('networksetup -getftpproxy wi-fi').toString()
      let webProxy = cp.execSync('networksetup -getwebproxy wi-fi').toString()
      let securewebProxy = cp.execSync('networksetup -getsecurewebproxy wi-fi').toString()
      let streamingProxy = cp.execSync('networksetup -getstreamingproxy wi-fi').toString()
      let gopherProxy = cp.execSync('networksetup -getgopherproxy wi-fi').toString()
      let socksfirewallProxy = cp.execSync('networksetup -getsocksfirewallproxy wi-fi').toString()
      // let proxyautodiscovery = cp.execSync('networksetup -getproxyautodiscovery wi-fi').toString()
      let autoProxy = cp.execSync('networksetup -getautoproxyurl wi-fi').toString()
      return {
        ftpproxy: !ftpProxy.match('No'),
        webproxy: !webProxy.match('No'),
        securewebproxy: !securewebProxy.match('No'),
        streamingproxy: !streamingProxy.match('No'),
        gopherproxy: !gopherProxy.match('No'),
        socksfirewallproxy: !socksfirewallProxy.match('No'),
        // proxyautodiscovery,
        autoproxy: !autoProxy.match('No')
      }
    } catch (e) {
      console.log(e)
    }
  }
}
