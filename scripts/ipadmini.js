// 判断是否为 iPad mini
var ifiPadmini = /iPad|iPad/.test(window.navigator.userAgent);

// 提示
if (ifiPadmini) {
	var isu = window.confirm("是你吗？");
	if (isu) {
		window.alert("那你来干什么？很有趣吗？");
		window.alert("截个屏通知我一声呗。");
	}
	else {
		window.alert("很抱歉打扰到您了，您为什么要使用 iPad mini 呢？")
	}
}
