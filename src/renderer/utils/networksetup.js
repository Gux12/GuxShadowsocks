// let Sudoer = require('electron-sudo').default
// let options = {name: 'Guxb(￣▽￣)d'}
// let sudoer = new Sudoer(options)
// console.log(sudoer)
let sudoer = require('child_process')
export default {
  removeAll: async function () {
    try {
      if (require('os').platform() === 'darwin') {
        await sudoer.exec('./networksetup2 -setftpproxystate wi-fi off')
        await sudoer.exec('./networksetup2 -setwebproxystate wi-fi off')
        await sudoer.exec('./networksetup2 -setsecurewebproxystate wi-fi off')
        await sudoer.exec('./networksetup2 -setstreamingproxystate wi-fi off')
        await sudoer.exec('./networksetup2 -setgopherproxystate wi-fi off')
        await sudoer.exec('./networksetup2 -setsocksfirewallproxystate wi-fi off')
        await sudoer.exec('./networksetup2 -setproxyautodiscovery wi-fi off')
        await sudoer.exec('./networksetup2 -setautoproxystate wi-fi off')
      } else if (require('os').platform() === 'win32') {
        console.log(require('path').join(__dirname, './sysproxy.exe'))
        await sudoer.spawnSync(require('path').join(__dirname, './sysproxy.exe'), ['pac', ''])
      }
    } catch (e) {
      console.error(e)
    }
  },
  proxyState: function () {
    try {
      let ftpProxy = sudoer.exec('./networksetup2 -getftpproxy wi-fi').toString()
      let webProxy = sudoer.exec('./networksetup2 -getwebproxy wi-fi').toString()
      let securewebProxy = sudoer.exec('./networksetup2 -getsecurewebproxy wi-fi').toString()
      let streamingProxy = sudoer.exec('./networksetup2 -getstreamingproxy wi-fi').toString()
      let gopherProxy = sudoer.exec('./networksetup2 -getgopherproxy wi-fi').toString()
      let socksfirewallProxy = sudoer.exec('./networksetup2 -getsocksfirewallproxy wi-fi').toString()
      // let proxyautodiscovery = sudoer.exec('./networksetup2 -getproxyautodiscovery wi-fi').toString()
      let autoProxy = sudoer.exec('./networksetup2 -getautoproxyurl wi-fi').toString()
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
