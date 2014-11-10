(function() {
	/* global element: true */
	/* jshint jquery: true */
	"use strict";
	var strTransform = "transform",
		isNaN = window.isNaN,
		$ = window.jQuery,
		value = "none",
		timer,
		node,
		doc;

	try {
		//run as htc file
		node = element;
		doc = node.document;
	} catch (ex) {
		//run as js file
		doc = document;
	}

	//如果zoom为normal，则设置zoom属性为1
	function setZoom(elem) {
		if (/normal/.test(elem.currentStyle.zoom)) {
			elem.runtimeStyle.zoom = 1;
		}
	}

	//将滤镜属性值写入runtimeStyle.filter
	function setFilter(elem, name, args) {
		var argsStr = [],
			i;

		name = getFilterName(elem, name);

		if (elem.filters[name]) {
			for (i in args) {
				elem.filters[name][i] = args[i];
			}
		} else {

			for (i in args) {
				argsStr.push(i + "=" + (/\w\s+\w/.test(args[i]) ? "'" + args[i] + "'" : args[i]));
			}

			//elem.style.filter = elem.currentStyle.filter.replace(/^none$/i, "") + " progid:" + getFilterName( elem, name ) + "(" + argsStr.join(",") + ")";
			elem.runtimeStyle.filter = elem.currentStyle.filter.replace(/^\s*none\s*$/i, "") + " progid:" + name + "(" + argsStr.join(",") + ")";
		}
	}

	//根据元素已有滤镜决定用滤镜名缩写还是全称
	function getFilterName(elem, filter) {
		return elem.filters[filter] ? filter : "DXImageTransform.Microsoft." + filter;
	}

	//转换角度为弧度，如输入的就是弧度，则原样输出
	function angle(ang) {
		var val = parseFloat(ang);
		return /deg/i.test(ang) ? val / 180 * Math.PI : val;
	}

	//解析参数，将逗号分隔的两个参数分隔
	function getVal(val, dou) {
		var ox, oy;
		if (val.indexOf(",") > 0) {
			val = val.split(",");
			ox = val[0];
			oy = val[1];
		} else {
			ox = val;
			oy = dou ? ox : 0;
		}
		return {
			x: angle(ox),
			y: angle(oy)
		};
	}

	//扭曲函数
	function skew(m, ang) {
		return Math.sin(Math.asin(m) + angle(ang));
	}

	// 遍历数组
	function forEach(arr, callback) {
		if (arr) {
			for (var i = 0; i < arr.length; i++) {
				callback.call(arr[i], i, arr[i]);
			}
		}
	}

	// 获取元素bottom、right、left或top
	function offset(elem, porp) {
		var val = elem.runtimeStyle[porp] = elem.currentStyle[porp];
		return /^auto$/i.test(val) ? NaN : elem.runtimeStyle["pixel" + porp.substr(0, 1).toUpperCase() + porp.slice(1)];
	}

	// 获取transform取值
	function getTransform(elem) {
		return elem.currentStyle[strTransform] || "none";
	}

	// 按transform语法设置Matrix滤镜
	function setTransform(elem, value) {
		var runtimeStyle = elem.runtimeStyle;
		runtimeStyle.position = runtimeStyle.bottom = runtimeStyle.right = runtimeStyle.left = runtimeStyle.top = "";
		setFilter(elem, "Matrix", {
			Enabled: false
		});

		var trans = value || getTransform(elem),
			position = elem.currentStyle.position,
			absolute;

		if (!/^\s*none\s*$/i.test(value)) {
			setZoom(elem);

			if (/^static$/i.test(position)) {
				runtimeStyle.position = "relative";
				absolute = false;
			} else {
				absolute = /^absolute$/i.test(position);
			}

			var m11 = 1,
				m12 = 0,
				m21 = 0,
				m22 = 1,
				dx = 0,
				dy = 0,
				x = absolute ? elem.offsetLeft : 0,
				y = absolute ? elem.offsetTop : 0,
				bottom = offset(elem, "bottom"),
				right = offset(elem, "right"),
				left = offset(elem, "left"),
				top = offset(elem, "top"),
				w = elem.offsetWidth,
				h = elem.offsetHeight,
				val,
				j;

			trans = trans.match(/\w+\([^\)]*\)/g);

			forEach(trans, function(i, tran) {
				val = tran.match(/\(\s*(.+)\s*\)/)[1];
				if (/matrix/i.test(tran)) {
					val = val.split(",");
					for (j = 0; j < val.length; j++) {
						val[j] = parseFloat(val[j]);
					}
					m11 = val[0];
					m21 = val[1];
					m12 = val[2];
					m22 = val[3];
					dx = val[4] || dx;
					dy = val[5] || dy;
				} else if (/translateX/i.test(tran)) {
					dx += parseFloat(val);
				} else if (/translateY/i.test(tran)) {
					dy += parseFloat(val);
				} else if (/translate/i.test(tran)) {
					val = getVal(val);
					dx += val.x;
					dy += val.y;
				} else if (/scaleX/i.test(tran)) {
					m11 *= parseFloat(val);
					//m22 = -m22;
				} else if (/scaleY/i.test(tran)) {
					m22 *= parseFloat(val);
					//m11 = -m11;
				} else if (/scale/i.test(tran)) {
					val = getVal(val, true);
					m11 *= val.x;
					m22 *= val.y;
				} else if (/rotate/i.test(tran)) {
					val = angle(val);
					m12 = -Math.sin(Math.asin(-m12) + val);
					m21 = skew(m21, val);
					val = Math.cos(val);
					m11 *= val;
					m22 *= val;
				} else if (/skewX/i.test(tran)) {
					m12 = skew(m12, val);
				} else if (/skewY/i.test(tran)) {
					m21 = skew(m21, val);
				} else if (/skew/i.test(tran)) {
					val = getVal(val);
					m12 = skew(m12, val.x);
					m21 = skew(m21, val.y);
				}
			});

			// set linear transformation via Matrix Filter
			setFilter(elem, "Matrix", {
				M11: m11,
				M12: m12,
				M21: m21,
				M22: m22,
				Enabled: true,
				SizingMethod: "auto expand"
			});

			// bounding box dimensions
			// IE has updated these values based on transform set above
			// determine how far origin has shifted
			// IE has updated these values based on transform set above

			if (isNaN(bottom)) {
				runtimeStyle.pixelTop = (isNaN(top) ? y : top) + dy - ((elem.offsetHeight - h) / 2);
				runtimeStyle.bottom = "";
			} else {
				runtimeStyle.pixelBottom = bottom - dy + ((elem.offsetHeight - h) / 2);
				runtimeStyle.top = "";
			}
			if (isNaN(right)) {
				runtimeStyle.pixelLeft = (isNaN(left) ? x : left) + dx - ((elem.offsetWidth - w) / 2);
				runtimeStyle.right = "";
			} else {
				runtimeStyle.pixelRight = right - dx + ((elem.offsetWidth - w) / 2);
				runtimeStyle.left = "";
			}

			if (value) {
				return "matrix(" + [m11, m21, m12, m22, dx, dy].join(", ") + ")";
			}
		}
	}

	// 如果transform发生变化则调用一次setTransform，htc专用
	function transformChange() {
		clearTimeout(timer);
		timer = setTimeout(function() {
			var newVal = getTransform(node);
			if (newVal !== value) {
				value = newVal;
				setTransform(node, value);
			}
		}, 0);
	}

	if (doc.documentMode < 9 || !doc.querySelector) {
		// 如果在htc环境运行
		if (node) {
			transformChange();
			forEach(["propertychange", "move", "resize", "mouseenter", "mouseleave", "mousedown", "focus", "blur"], function(i, eventType) {
				node.attachEvent("on" + eventType, transformChange);
			});
		}
		// 注册为jQuery插件
		if ($ && !$.cssHooks[strTransform]) {
			$.cssHooks[strTransform] = {
				set: function(elem, value) {
					elem.style.removeAttribute(strTransform);
					return setTransform(elem, value);
				},
				get: getTransform
			};
		}
	}
})();