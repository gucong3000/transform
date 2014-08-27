transform v0.0.4
=========

css3 transform for ie

transform是一个为IE6-8提供css3 transform属性功能的js库，它的使用非常简单

transform is a provider of css3 js library functions transform property for IE6-8, it's very simple to use 

## 使用方式 Usage 

jquery方式/jquery way:

```HTML
<!--[if lte IE 8]>
	<script src="build/jquery.transform.js"></script>
<![endif]-->
<script>
jQuery(function($) {
    $(".test").css("transform", "rotate(45deg)");
});
</script>
```

或htc方式/Or htc way:

```HTML
<style>
.test {
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
    behavior: url(build/transform.htc);
}
</style>
```

## 参考

- [CSS参考手册中的transform详解](http://gucong3000.github.io/css-handbook/properties/transform/transform.htm)
- [css3please.com](http://css3please.com/)是一个在线辅助css3编写的小工具
- jQuery 1.8以上版本内置了自动处理css前缀(如`-webkit-`，`-moz-`等)的功能，`$(".someclass").css()` 方法无需手写前缀
- [Prefixfree](http://leaverou.github.io/prefixfree/) 是一个让你实现免前缀写css的工具，它还有插件让jQuery(1.8以下)也免前缀
- [Autoprefixer](https://github.com/postcss/autoprefixer) 是一个在css预编或压缩译时自动补全前缀的工具，拥有[grunt插件](https://www.npmjs.org/package/grunt-autoprefixer)、[gulp插件](https://www.npmjs.org/package/gulp-autoprefixer/)和[sublime插件](https://sublime.wbond.net/packages/Autoprefixer)

## Reference
- [CSS reference manual transform Detailed](http://gucong3000.github.io/css-handbook/properties/transform/transform.htm)
- [css3please.com](http://css3please.com/) is an online tool for the preparation of small auxiliary css3
- JQuery 1.8 or later built automatic processing css prefix (eg `-webkit-`, `-moz-`, etc.) functions, `$(".someclass").css()` method does not require a handwritten prefix.
- [Prefixfree](http://leaverou.github.io/prefixfree/) is a prefix-free writing to let you realize css tool, it also has plug-ins let jQuery (1.8 or less) are also free prefix
- [Autoprefixer](https://github.com/postcss/autoprefixer) is an auto-complete when the prefix pre-programmed or compress css translation tool, with [grunt plug](https://www.npmjs.org/package/grunt-autoprefixer), [gulp plug](https://www.npmjs.org/package/gulp-autoprefixer/) and [sublime plug](https://sublime.wbond.net/packages/Autoprefixer)