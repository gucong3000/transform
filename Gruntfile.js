module.exports = function(grunt) {
	"use strict";

	function readOptionalJSON(filepath) {
		var data = {};
		try {
			data = grunt.file.readJSON(filepath);
		} catch (e) {}
		return data;
	}
	var banner = "/* <%= pkg.name %> v<%= pkg.version %>\n * homepage: <%= pkg.homepage %>\n */\n";

	// The concatenated file won't pass onevar
	// But our modules can

	grunt.initConfig({
		pkg: readOptionalJSON("package.json"),

		//js代码风格检查
		jshint: {
			options: {
				jshintrc: true
			},
			gruntfile: {
				src: ["Gruntfile.js"]
			},
			js: {
				src: ["src/**/*.js"]
			}
		},

		//js代码压缩与合并
		uglify: {
			options: {
				banner: banner,
				preserveComments: function(o, info) {
					return /@(cc_on|if|else|end|_jscript(_\w+)?)\s/i.test(info.value);
				},
				report: "min",
				footer: "",
				compress: {
					hoist_funs: false,
					loops: false,
					unused: false
				}
			},
			js: {
				files: {
					"build/jquery.transform.js": ["src/transform.js"]
				}
			},
			htc: {
				options: {
					banner: "<PUBLIC:COMPONENT lightWeight=\"true\"><SCRIPT>\n" + banner,
					footer: "\n</SCRIPT><script type=\"text/vbscript\"></script></PUBLIC:COMPONENT>"
				},
				files: {
					"build/transform.htc": ["src/transform.js"]
				}
			}
		},
		//文件变化监控
		watch: {
			gruntfile: {
				files: ["Gruntfile.js"],
				tasks: ["jshint:gruntfile"]
			},
			js: {
				files: ["src/**/*.js"],
				tasks: ["jshint:js", "uglify"]
			}
		}
	});

	//文件变化监控插件
	grunt.loadNpmTasks("grunt-contrib-watch");
	//代码风格检查插件
	grunt.loadNpmTasks("grunt-contrib-jshint");
	//文件合并插件
	grunt.loadNpmTasks("grunt-contrib-uglify");

	// Default grunt
	grunt.registerTask("default", ["jshint", "uglify", "watch"]);
};