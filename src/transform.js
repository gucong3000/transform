(function() {
	/* global element: true */
	/* jshint jquery: true */
	"use strict";
	var $ = window.jQuery,
		doc,
		node;

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

	//获取元素left或top
	function offset(elem, porp) {
		elem.runtimeStyle[porp] = elem.currentStyle[porp];
		return elem.runtimeStyle["pixel" + porp.substr(0, 1).toUpperCase() + porp.slice(1)];
	}

	function setMatrix(elem, value) {

		elem.runtimeStyle.position = elem.runtimeStyle.left = elem.runtimeStyle.top = "";
		setFilter(elem, "Matrix", {
			Enabled: false
		});

		if (/^\s*none\s*$/i.test(value)) {
			return value;
		} else if (!value) {
			value = elem.currentStyle.transform;
		}

		setZoom(elem);

		if (/^static$/i.test(elem.currentStyle.position)) {
			elem.runtimeStyle.position = "relative";
		}

		var m11 = 1,
			m12 = 0,
			m21 = 0,
			m22 = 1,
			dx = 0,
			dy = 0,
			trans = value.match(/\w+\([^\)]*\)/g),
			x = offset(elem, "left"),
			y = offset(elem, "top"),
			w = elem.offsetWidth,
			h = elem.offsetHeight,
			val,
			i,
			j;

		for (i = 0; i < trans.length; i++) {
			val = trans[i].match(/\(\s*(.+)\s*\)/)[1];
			if (/matrix/i.test(trans[i])) {
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
			} else if (/translateX/i.test(trans[i])) {
				dx += parseFloat(val);
			} else if (/translateY/i.test(trans[i])) {
				dy += parseFloat(val);
			} else if (/translate/i.test(trans[i])) {
				val = getVal(val);
				dx += val.x;
				dy += val.y;
			} else if (/scaleX/i.test(trans[i])) {
				m11 *= parseFloat(val);
				//m22 = -m22;
			} else if (/scaleY/i.test(trans[i])) {
				m22 *= parseFloat(val);
				//m11 = -m11;
			} else if (/scale/i.test(trans[i])) {
				val = getVal(val, true);
				m11 *= val.x;
				m22 *= val.y;
			} else if (/rotate/i.test(trans[i])) {
				val = angle(val);
				m12 = -Math.sin(Math.asin(-m12) + val);
				m21 = skew(m21, val);
				val = Math.cos(val);
				m11 *= val;
				m22 *= val;
			} else if (/skewX/i.test(trans[i])) {
				m12 = skew(m12, val);
			} else if (/skewY/i.test(trans[i])) {
				m21 = skew(m21, val);
			} else if (/skew/i.test(trans[i])) {
				val = getVal(val);
				m12 = skew(m12, val.x);
				m21 = skew(m21, val.y);
			}
		}

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


		elem.runtimeStyle.pixelLeft = dx + x - ((elem.offsetWidth - w) / 2);
		elem.runtimeStyle.pixelTop = dy + y - ((elem.offsetHeight - h) / 2);

		return "matrix(" + [m11, m21, m12, m22, dx, dy].join(", ") + ")";
	}

	if (doc.documentMode < 9 || !doc.querySelector) {
		if ($) {
			if (!$.cssHooks) {
				$.cssHooks = {};
			}
			if (!$.cssHooks.transform) {
				$.cssHooks.transform = {
					set: setMatrix,
					get: function(elem) {
						return elem.currentStyle.transform || "none";
					}
				};
			}
			if (node) {
				var val = node.currentStyle.transform;
				if (val) {
					$(node).css("transform", val);
				}
			}
		} else if (node) {
			setMatrix(node);
		}
	}
})();