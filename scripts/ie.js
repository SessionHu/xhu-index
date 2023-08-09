// 判断是否为IE
var isIE = /MSIE|Trident/.test(window.navigator.userAgent);

// 重定向至浏览器选择页
if (isIE) {
	window.location.replace("https://inde.xhuoffice.tk/ie.htm");
}