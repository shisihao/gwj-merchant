import Cookies from 'js-cookie'

export const TokenKey = 'gwj-partner-Token'
export const OssKey = 'gwj-partner-Oss-Token'
export const DominKey = 'gwj-partner-Domin-Token'
export const AppKey = 'App-info'

export function getToken(key = TokenKey) {
  return Cookies.get(key)
}

export function setToken(token, key = TokenKey) {
  return Cookies.set(key, token)
}

export function removeToken(key = TokenKey) {
  return Cookies.remove(key)
}
