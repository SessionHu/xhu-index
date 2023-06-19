// 判断是否为IE
var ifIE = (function() {
	var UA = window.navigator.userAgent,
		compare = function(s) {
			return (UA.indexOf(s) >= 0);
		},
		ie11 = (function() {
			return ("ActiveXObject" in window)
		})();
	if (compare("MSIE") || ie11) {
		return 'true';
	} 
})()

// 重定向至浏览器选择页
if (ifIE == 'true') {
	window.location.replace("https://inde.xhuoffice.tk/ie.htm");
}