export function createEmptyReadonlyProxy(): Record<any, any> {
  return new Proxy(() => {}, {
    get() {
      return createEmptyReadonlyProxy()
    },
    apply() {
      return createEmptyReadonlyProxy()
    },
    construct() {
      return createEmptyReadonlyProxy()
    },
  })
}
