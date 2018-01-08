import Vue from 'vue'

const state = {
  email: null,
  password: null,
  cookie: null,
  type: null
}

const mutations = {
  SET_USER (state, {email, password}) {
    state.email = email
    state.password = password
    localStorage.setItem('email', email)
    localStorage.setItem('password', password)
  },
  SET_COOKIE (state, {cookie, type}) {
    state.cookie = cookie
    state.type = type
  }
}

const actions = {
  async loginAsync ({commit}, {email, password}) {
    // do something async
    let response = await Vue.http.post('http://ss.gux.space/api/home/login', {
      email: email,
      password: password
    })
    JSON.stringify(response.data)
    commit('SET_USER', {email, password})
    commit('SET_COOKIE', {
      cookie: response.headers['set-cookie'],
      type: response.data.type
    })
    return response
  }
}

export default {
  state,
  mutations,
  actions
}
