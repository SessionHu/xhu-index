// 判断是否为IE
var ifIE = /MSIE|Trident/.test(window.navigator.userAgent);

// 重定向至浏览器选择页
if (ifIE) {
	window.location.replace("https://inde.xhuoffice.tk/ie.htm");
}