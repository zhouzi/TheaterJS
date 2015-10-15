if (!Function.prototype.bind) {
  Function.prototype.bind = function (context) {
    let fn = this
    let args = [].slice.call(arguments, 1)

    return function () {
      return fn.apply(context, args.concat([].slice.call(arguments)))
    }
  }
}
