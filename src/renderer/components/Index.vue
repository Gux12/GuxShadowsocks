<template>
    <div>
        <mt-header title="GuxSS">
            <mt-button icon="more" slot="right" @click="sheetVisible = true"></mt-button>
        </mt-header>
        <main style="padding: 10px">
            <mt-field label="邮箱" placeholder="请输入邮箱" type="email" v-model="email"></mt-field>
            <mt-field label="密码" placeholder="请输入密码" type="password" v-model="password"></mt-field>
            <mt-button type="primary" size="large" @click="login">登录</mt-button>
        </main>
        <mt-actionsheet
                :actions="actions"
                v-model="sheetVisible"
                cancelText="">
        </mt-actionsheet>
    </div>
</template>

<script>
  export default {
    name: 'landing-page',
    data () {
      return {
        email: '',
        password: '',
        sheetVisible: false,
        actions: [{
          name: '官方网站',
          method: () => {
            this.$electron.shell.openExternal('http://ss.gux.space')
          }
        }, {
          name: '退出',
          method: () => {
            this.$electron.remote.app.quit()
          }
        }]
      }
    },
    created () {
      this.email = localStorage.getItem('email')
      this.password = localStorage.getItem('password')
    },
    methods: {
      async login () {
        let {email, password} = this
        let res = await this.$store.dispatch('loginAsync', {email, password})
        console.log(res)
        this.$router.push('/main')
      }
    }
  }
</script>

<style lang="scss">
    @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

    body {
        font-family: 'Source Sans Pro', sans-serif;
        max-height: 100%;
        background-color: #495A80;
        margin: 0;
    }

    .mint-button--primary {
        background-color: saturate(#495A80, 20%);
    }

    .mint-header {
        background-color: #495A80;
    }
</style>
