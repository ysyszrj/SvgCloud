# SvgCloud:word cloud for svg layout

SvgCloud is a Jquery plugin that build svg word cloud and extend for more function.
I code this plugin refer to [JQcloud](http://www.lucaongaro.eu/demos/jqcloud/), which is a jQuery plugin that builds neat and pure HTML + CSS word clouds
>SvgCloud是

## features
1. jquery插件
1. 命名空间

## different version
For different usage I upload different version of SvgCloud.
### svgcloud.1.x.js 
This version just visualization the words and the wight.It shows all word with one color,you can set the font color with the option of "font-color".
Example is [here](http://ysyszrj.github.io/svgcloud/SvgCloud_1_font-size.html)


![svgcloud.1.x.js](image/SvgCloud1.png)

#### Installation
1. Make sure to import jquery.js and d3.js in your project.
2. Download the SvgCloud and import it in your html files.

#### Usage
You can see the detail usage in the package of examples. However, there are some extra options to explain. 

#### Common Options

#### Word Options

#### Cloud Options:

SvgCloud accepts an object containing configurations for the whole cloud as the second argument:

```javascript
$("#example").SvgCloud(word_list, {
  width: 300,
  height: 200
});
```

### Version Options

SvgCloud.1.x.js
```
 $("#ele").SvgCloud(word_list,{
    font_color: color
 });
```

