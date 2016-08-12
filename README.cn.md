分为几个文件夹，每个文件夹有不同的内容。

 - src
  svg源文件
 - dist
 压缩文件
 - demo
 文件

 版本1，只支持词云的普通显示，利用svg来实现，原来依赖于d3.js，现在去掉d3.js的依赖
 
 版本2，去掉jquery的依赖，兼容以前的代码
 重写.width() .height()
 重写.attr()
 重写$.extend() 简化深拷贝的内容，浅拷贝
 .fn.css()属性
 高版本 documentElement.currentStyle来判断样式
 低版本用 documentElement.currentStyle

 版本2， 支持词云动态更新，也就是允许前一个词云和后一个词云之间能够保持一定的关系。

 插件有几个不同的版本，第一个版本是没有