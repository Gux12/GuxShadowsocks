<template>
    <div class="main-panel">
        <mt-header title="GuxSS">
            <mt-button slot="right" @click="handleLogout"><img src="../assets/power.png" height="20" width="20"
                                                               slot="icon">退出登录
            </mt-button>
        </mt-header>
        <mt-radio
                title="Server"
                v-model="server2Use"
                :options="enabledServer"
                @change="restartSS">
        </mt-radio>
        <mt-cell title="是否全局代理">
            <mt-switch v-model="isGlobal" @change="changeProxyMode"></mt-switch>
        </mt-cell>
        <mt-button class='proxy-button' :type='isProxyStart ? "danger":"primary" ' size='large'
                   @click='toggleProxy'>
            {{isProxyStart?"停止代理":"开启代理"}}
        </mt-button>
    </div>
</template>

<script>
  import networksetup from '../utils/networksetup'
  import union from 'lodash/union'

  let cp = require('child_process')

  let LOCAL_PORT = 1086
  let LOCAL_PAC_PORT = 8090
  let CONFIG_PATH
  let SSLOCAL_PATH = require('path').resolve(__dirname, '../../../node_modules/.bin/localssjs')
  let PM2_PATH = require('path').resolve(__dirname, '../../../node_modules/.bin/pm2')
  export default {
    name: 'main-panel',
    data () {
      return {
        accounts: [],
        servers: [],
        isProxyStart: false,
        isGlobal: false,
        server2Use: null,
        ip: ''
      }
    },
    async created () {
      CONFIG_PATH = require('path').join(this.$electron.remote.app.getPath('userData'), 'config.json')
      let account = await this.$http.get('http://ss.gux.space/api/user/account', {headers: {'Cookie': this.$store.state.User.cookie}})
      let server = await this.$http.get('http://ss.gux.space/api/user/server', {headers: {'Cookie': this.$store.state.User.cookie}})
      this.accounts = account.data
      this.servers = server.data
      this.server2Use = this.enabledServer[0].value
      require('fs').writeFileSync(CONFIG_PATH, JSON.stringify(this.ssConfig))
    },
    methods: {
      toggleProxy () {
        if (!this.isProxyStart) {
          networksetup.removeAll()
          let ls
          if (require('os').platform() === 'win32') {
            ls = this.isGlobal ? cp.spawn(require('path').join(__dirname, '../utils/sysproxy.exe'), ['global', `127.0.0.1:${LOCAL_PORT}`, 'localhost;127.*;10.*;172.16.*;172.17.*;172.18.*;172.19.*;172.20.*;172.21.*;172.22.*;172.23.*;172.24.*;172.25.*;172.26.*;172.27.*;172.28.*;172.29.*;172.30.*;172.31.*;172.32.*;192.168.*']) : cp.spawn(require('path').join(__dirname, '../utils/sysproxy.exe'), ['pac', `http://127.0.0.1:${LOCAL_PAC_PORT}/proxy.pac`])
          } else if (require('os').platform() === 'darwin') {
            ls = this.isGlobal ? cp.spawn('networksetup', ['-setsocksfirewallproxy', 'wi-fi', '127.0.0.1', LOCAL_PORT, 'off']) : cp.spawn('networksetup', ['-setautoproxyurl', 'wi-fi', `http://127.0.0.1:${LOCAL_PAC_PORT}/proxy.pac`])
          }

          ls.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`)
          })

          ls.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`)
          })

          ls.on('close', (code) => {
            // console.log(`child process exited with code ${code}`)
            // console.log(networksetup.proxyState())
            this.startSS()
            this.isProxyStart = true
          })
        } else {
          this.stopSS()
          this.isProxyStart = false
          networksetup.removeAll()
        }
      },
      restartSS () {
        if (this.isProxyStart) {
          console.log('start restartSS')
          this.$nextTick(() => {
            require('fs').writeFileSync(CONFIG_PATH, JSON.stringify(this.ssConfig))
            cp.spawnSync(PM2_PATH, ['restart', '"sslocal"'])
            console.log('restartSS')
          })
        }
      },
      stopSS () {
        console.log('start stopSS')
        cp.spawnSync(PM2_PATH, ['delete', '"sslocal"'])
        console.log('stopSS')
      },
      startSS () {
        console.log('start startSS')
        require('fs').writeFileSync(CONFIG_PATH, JSON.stringify(this.ssConfig))
        cp.spawnSync(PM2_PATH, ['start', SSLOCAL_PATH, '--name="sslocal"', '--', '-c', CONFIG_PATH])
        console.log('startSS')
      },
      changeProxyMode () {
        if (this.isProxyStart) {
          networksetup.removeAll()
          let code
          if (require('os').platform() === 'win32') {
            code = this.isGlobal ? cp.spawnSync(require('path').resolve(__dirname, '../utils/sysproxy.exe'), ['global', `127.0.0.1:${LOCAL_PORT}`, 'localhost;127.*;10.*;172.16.*;172.17.*;172.18.*;172.19.*;172.20.*;172.21.*;172.22.*;172.23.*;172.24.*;172.25.*;172.26.*;172.27.*;172.28.*;172.29.*;172.30.*;172.31.*;172.32.*;192.168.*']) : cp.spawn(require('path').join(__dirname, '../utils/sysproxy.exe'), ['pac', `http://127.0.0.1:${LOCAL_PAC_PORT}/proxy.pac`])
          } else if (require('os').platform() === 'darwin') {
            code = this.isGlobal ? cp.spawnSync('networksetup', ['-setsocksfirewallproxy', 'wi-fi', '127.0.0.1', LOCAL_PORT, 'off']) : cp.spawnSync('networksetup', ['-setautoproxyurl', 'wi-fi', `http://127.0.0.1:${LOCAL_PAC_PORT}/proxy.pac`])
          }
          console.log(`changeProxyMode ${code}`)
        }
      },
      handleLogout () {
        networksetup.removeAll()
        if (this.ssLocal) {
          this.ssLocal.closeAll()
          this.ssLocal = null
        }
        this.isProxyStart = false
        this.$router.push('/')
      }
    },
    computed: {
      enabledServer () {
        let serverIDList = []
        for (let account of this.accounts) {
          if (!account.server) {
            return this.servers.map(o => {
              return {label: o.host + ' ' + o.name, value: o}
            })
          }
          serverIDList = union(serverIDList, account.server)
        }
        let enabledServers = []
        this.servers.filter(o => {
          for (let serverID of serverIDList) {
            if (o.id === serverID) enabledServers.push({label: o.host + ' ' + o.name, value: o})
          }
          return false
        })
        return enabledServers
      },
      ssConfig () {
        return {
          serverAddr: this.server2Use.host,
          serverPort: this.accounts[0].port,
          localAddr: '127.0.0.1',
          localPort: LOCAL_PORT,
          password: this.accounts[0].password,
          pacServerPort: LOCAL_PAC_PORT,
          timeout: 300,
          method: this.server2Use.method,
          level: 'warn',
          logPath: require('path').join(this.$electron.remote.app.getPath('userData'), './logs'),

          // ipv6
          localAddrIPv6: '::1',
          serverAddrIPv6: this.server2Use.host.replace(/^(\w*)\./, `$1v6.`),

          // dev options
          _recordMemoryUsage: false
        }
      }
    }
  }
</script>

<style lang="scss">
    .main-panel {
        .mint-header {
            background-color: #495A80;
        }
        .mint-button--primary {
            background-color: saturate(#495A80, 20%);
        }
        .mint-cell {
            background-color: rgba(#fff, .8);
        }
        .proxy-button {
            position: fixed;
            bottom: 0;
        }
    }
</style>