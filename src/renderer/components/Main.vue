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
            <mt-switch v-model="isGlobal"></mt-switch>
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
  import {Indicator} from 'mint-ui'

  let cp = require('child_process')
  let ss = require('encryptsocks')

  let LOCAL_PORT = 1086
  export default {
    name: 'main-panel',
    data () {
      return {
        accounts: [],
        servers: [],
        isProxyStart: false,
        isGlobal: false,
        server2Use: null,
        ssLocal: null,
        ip: ''
      }
    },
    async created () {
      let account = await this.$http.get('http://ss.gux.space/api/user/account', {headers: {'Cookie': this.$store.state.User.cookie}})
      let server = await this.$http.get('http://ss.gux.space/api/user/server', {headers: {'Cookie': this.$store.state.User.cookie}})
      this.accounts = account.data
      this.servers = server.data
      this.server2Use = this.enabledServer[0].value
    },
    methods: {
      toggleProxy () {
        if (!this.isProxyStart) {
          networksetup.removeAll()

          let ls = cp.spawn('networksetup', ['-setsocksfirewallproxy', 'wi-fi', '127.0.0.1', '1086', 'off'])
          ls.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`)
          })

          ls.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`)
          })

          ls.on('close', (code) => {
            // console.log(`child process exited with code ${code}`)
            // console.log(networksetup.proxyState())
            this.isProxyStart = true
            this.ssLocal = ss.createClient(this.ssConfig, true)
          })
        } else {
          if (this.ssLocal) {
            this.stopSS(this.ssLocal, () => {
              this.ssLocal = null
              this.isProxyStart = false
              networksetup.removeAll()
            })
          }
        }
      },
      restartSS () {
        if (this.isProxyStart) {
          this.stopSS(this.ssLocal, () => {
            networksetup.removeAll()
            let code = cp.spawnSync('networksetup', ['-setsocksfirewallproxy', 'wi-fi', '127.0.0.1', '1086', 'off'])
            console.log(`child process exited with code ${code}`)
            this.ssLocal = ss.createClient(this.ssConfig, true)
          })
        }
      },
      stopSS (ssLocal, cb) {
        Indicator.open()
        ssLocal.closeAll()
        let completed = 0
        ssLocal.server.on('close', function () {
          console.log('server stop')
          completed++
          if (completed === 2) {
            Indicator.close()
            cb()
          }
        })
        ssLocal.pacServer.on('close', function () {
          console.log('pacServer stop')
          completed++
          if (completed === 2) {
            Indicator.close()
            cb()
          }
        })
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
          pacServerPort: 8090,
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