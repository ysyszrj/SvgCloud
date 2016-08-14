/*!
 * jQCloud Plugin for jQuery
 *
 * Version 1.0.4
 *
 * Copyright 2011, Luca Ongaro
 * Licensed under the MIT license.
 *
 * Date: 2013-05-09 18:54:22 +0200
*/

(function( $ ) {
  "use strict";
  
  $.fn.SvgCloud = function(word_array, options) {
    // Reference to the container element
    var $this = this;
    // Namespace word ids to avoid collisions between multiple clouds
    var cloud_namespace = $this.attr('id') || Math.floor((Math.random()*1000000)).toString(36);
	
	var already_placed_words = [];
	var weightGap;
	
	var color1=["#A50026","#D73027","#F46D43","#FDAE61","#FEE08B","#FFFFBF","#D9EF8B","#A6D96A","#66BD63","#1A9850","#006837"];
	
	var color2=["#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#54278f","#3f007d"];
	
	//var  checkedWords=[];
	
    // Default options value
    var default_options = {
      width: $this.width(),
      height: $this.height()-20,
      center: {
        x: ((options && options.width) ? options.width : $this.width()) / 2.0,
        y: ((options && options.height) ? options.height : $this.height()) / 2.0
      },
      delayedMode: false,//word_array.length < 50,
      shape: false, // It defaults to elliptic shape
      encodeURI: true,
      removeOverflowing: true,
    };
	
	var svg=d3.select("#wordcloud").select("svg");
    options = $.extend(default_options, options || {});

	var hightlightedwords=new Array();
	var clickgroups=new Array();


    // Add the "jqcloud" class to the container for easy CSS styling, set container width/height
    //$this.addClass("jqcloud").width(options.width).height(options.height);

    // Container's CSS position cannot be 'static'
    if ($this.css("position") === "static") {
      $this.css("position", "relative");
    }
	
	
		var adjustOverlapped=function(aid,bid){
				var a=$("#"+aid),b=$("#"+bid);

				var aleft=parseInt(a.attr("x"));
				var abotton=parseInt(a.attr("y"));
				var awidth=parseInt(a.css("width"));
				var aheight=parseInt(a.css("height"));
				
				var bleft=parseInt(b.attr("x"));
				var bbotton=parseInt(b.attr("y")); 
				var bwidth=parseInt(b.css("width"));
				var bheight=parseInt(b.css("height"));
				
				var acx=aleft+awidth/2;
				var acy=abotton-aheight/2;
				var bcx=bleft+bwidth/2;
				var bcy=bbotton-bheight/2;
				
				var disx=Math.abs(acx-bcx);
				var disy=Math.abs(acy-bcy);
				var tarw=(awidth+bwidth)/2;
				var tarh=(aheight+bheight)/2;
				
				if(disx<tarw&&disy<tarh){//覆盖的话return true 没有覆盖 return false 
					var dz=Math.sqrt(disx*disx+disy*disy);
					var rr=5;
					var dx=(acx-bcx)/dz*rr;
					var dy=(acy-bcy)/dz*rr;
					
					a.attr("x",aleft+dx).attr("y",abotton+dy);
					b.attr("x",bleft-dx).attr("y",bbotton-dy);
					
					//需要挪的位置			
					
					return true;
				}else{
					return false;
				}
		}
	
	
	 var selectColor=function(word){
		if(options.valueType=="score"){
			var colorScale = d3.scale.linear() // <-A
			.domain(d3.range(11))
			.range(color1);
			
			//console.log("score");
			var ccc=(word.score+1)/(2/11);	
			word.color=colorScale(parseInt(ccc));
			return word.color;
		}else{
		//console.log("else");
			var countcolor=color2.length;
			var colorScale=d3.scale.linear()
				.domain(d3.range(countcolor))
				.range(color2);
			var pev=options.maxv/countcolor;
			var ccc=word.sentimentVariance/pev;
			word.color=colorScale(parseInt(ccc));
			return word.color;
		}
	  }
	//start from here to draw word cloud 
    var drawWordCloud = function() {
		
		
      // Helper function to test if an element overlaps others
      var hitTest = function(elem, other_elems) {
			// Pairwise overlap detection
			
			var overlapping = function(aa, bb) {
				var a=$("#"+aa.html.id);
				var aleft=parseInt(a.attr("x"));
				var abotton=parseInt(a.attr("y"));
				var awidth=parseInt(a.css("width"));
				var aheight=parseInt(a.css("height"));
			
				
				if(abotton-aheight<0){
					return true;
				}
				
				var b=$("#"+bb.html.id);
				var bleft=parseInt(b.attr("x"));
				var bbotton=parseInt(b.attr("y")); 
				var bwidth=parseInt(b.css("width"));
				var bheight=parseInt(b.css("height"));
				
				var acx=aleft+awidth/2;
				var acy=abotton-aheight/2;
				var bcx=bleft+bwidth/2;
				var bcy=bbotton-bheight/2;
				
			  if (Math.abs(2.0*acx-2.0*bcx) < awidth + bwidth) {
				if (Math.abs(2.0*acy -2.0*bcy ) < aheight + bheight) {
					//overlap
				  return true;
				}
			  }
			  return false;
			};
			var i = 0;
			// Check elements for overlap one by one, stop and return false as soon as an overlap is found
			for(i = 0; i < other_elems.length; i++) {
			  if (overlapping(elem, other_elems[i])) {
				return true;
			  }
			}
			return false;
      };

	  
	  
      // Make sure every weight is a number before sorting
      for (var i = 0; i < word_array.length; i++) {
        word_array[i].weight = parseFloat(word_array[i].weight, 10);
      }

      // Sort word_array from the word with the highest weight to the one with the lowest
      word_array.sort(function(a, b) { if (a.weight < b.weight) {return 1;} else if (a.weight > b.weight) {return -1;} else {return 0;} });

	  if(typeof(word_array[word_array.length-1])=="undefined"){
		console.log(word_array);
		console.log(word_array.length);
	  }
	  weightGap=word_array[0].weight-word_array[word_array.length-1].weight;
	  
	  
	  
      var step = (options.shape === "rectangular") ? 18.0 : 2.0,aspect_ratio = options.width / options.height;

      // Function to draw a word, by moving it in spiral until it finds a suitable empty place. This will be iterated on each word.
      var drawOneWord = function(index, word) {
		
	  var pos;
	  index=arguments[0];
		word=arguments[1];
	  if(arguments.length>2){
		pos=arguments[2];
		pos.centerX=pos.x+pos.width/2;
		pos.centerY=pos.y+pos.height/2;
	  }
	  
        // Define the ID attribute of the span that will wrap the word, and the associated jQuery selector string
		
        var word_id = cloud_namespace + "_word_" + word.text.replace(/ /g,"_"),
            word_selector = "#" + word_id,
            angle = 6.28 * Math.random(),
            radius = 0.0,

            // Only used if option.shape == 'rectangular'
            steps_in_direction = 0.0,
            quarter_turns = 0.0,

            weight = 5,
            custom_class = "",
            inner_html = "",
            word_span;

			
        // Extend word html options with defaults
        word.html = $.extend(word.html, {id: word_id});

        // If custom class was specified, put them into a variable and remove it from html attrs, to avoid overwriting classes set by jQCloud
        if (word.html && word.html["class"]) {
          custom_class = word.html["class"];
          delete word.html["class"];
        }

        // Check if min(weight) > max(weight) otherwise use default
        if (word_array[0].weight > word_array[word_array.length - 1].weight) {
          // Linearly map the original weight to a discrete scale from 1 to 10
		  
          weight = Math.round((word.weight - word_array[word_array.length - 1].weight) /
                              weightGap* 9.0) + 1;
        //console.log(weight);
		}
        
	  selectColor(word);
	  
		
		//增加clickedWords的交互
		
		if(word.text in globalYelp.wordcloud.clickedWords){
			globalYelp.wordcloud.clickedWords[word.text]=word.color;
			word.color="#5F9EA0";
			globalYelp.wordcloud.clickedWords.LL=globalYelp.wordcloud.clickedWords.LL+1;
		}
		
		word_span =svg.append("g").attr("class","wd").append("text").attr("class",'w' + weight + " " + custom_class).attr("id",word.html.id).attr("fill",word.color).style("font-size",weight*5);

		//分组上色
		//var cc=d3.scale.category20c().domain(d3.range(20));
		//if(typeof(pos)!="undefined"){
			//word_span.attr("fill",cc(pos.id+3 ));
		//}
		
		
        // Append link if word.url attribute was set
        if (word.link) {
          // If link is a string, then use it as the link href
          if (typeof word.link === "string") {
            word.link = {href: word.link};
          }

          // Extend link html options with defaults
          if ( options.encodeURI ) {
            word.link = $.extend(word.link, { href: encodeURI(word.link.href).replace(/'/g, "%27") });
          }

          inner_html = $('<a>').attr(word.link).text(word.text);
        } else {
          inner_html = word.text;
        }
		
        word_span.text(word.text);

    
		//***********************add my code***************************
		function RGBToHex(rgb){ 
		   var regexp = /[0-9]{0,3}/g;  
		   var re = rgb.match(regexp);//利用正则表达式去掉多余的部分，将rgb中的数字提取
		   var hexColor = "#"; var hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];  
		   for (var i = 0; i < re.length; i++) {
				var r = null, c = re[i], l = c; 
				var hexAr = [];
				while (c > 16){  
					  r = c % 16;  
					  c = (c / 16) >> 0; 
					  hexAr.push(hex[r]);  
				 } hexAr.push(hex[c]);
				 if(l < 16&&l != ""){        
					 hexAr.push(0)
				 }
			   hexColor += hexAr.reverse().join(''); 
			}  
		   //alert(hexColor)  
		   return hexColor;  
		}
		
		//******************** my code ***************
		//when click the word,add events
		word_span.on("click",function(){
			
			var point=$(this);
			var spanWidth=$(this).width();
			var spanHeight=$(this).height();
			var wordsText=$(this).text();	

			var changeBackGround=function(){
		
				var cc=0;
				$(".sreview").css("display","none");
				$(".sentence").css("backgroundColor","")
				for( var key in globalYelp.wordcloud.clickedWords){
					console.log(key);
					$("."+key).parent().each(function(){
						//console.log("display");
						var senti=$(this).attr("sentiment");
						//console.log(senti.indexOf(","));
						$(this).parent().parent().css("display","block");
						//console.log($(this).parent().parent());
						$(this).css("display","block");
						var num=parseFloat(senti.slice(1,parseInt(senti.indexOf(','))));
						var sentencebgcolor;
						//console.log(num);
						if(num>0){
							sentencebgcolor="#dff0d8";
						}else if(num<0){
							sentencebgcolor="#fddddd";
						}
						$(this).css("backgroundColor",sentencebgcolor);
					});
					cc=cc+1;
				}
				if(cc==0){
					$(".sreview").css("display","block");
				}
			};
			
			
			function sortReview(){
				var s1=function(a,b){
					var obj1=a.childNodes[2];
					var obj2=b.childNodes[2];
					var childNodes1=obj1.childNodes;
					var childNodes2=obj2.childNodes;
						//console.log(childNodes);
						
					var  calsenti=function(childNodes){
						var creviewscore=0;
						var cc=0;
						for(var i=0;i<childNodes.length;i++){  //ever sentence
							//console.log(childNodes[i]);
							var wc=childNodes[i].childNodes;
							for(var j=0;j<wc.length;j++){
								if(wc[j].className==" "+wordsText){
									var senti=$(wc[j]).parent().attr("sentiment");
									var num=parseFloat(senti.slice(1,parseInt(senti.indexOf(','))));
									creviewscore=creviewscore+num;
									cc=cc+1;
									break;
								}
							}
						}
						if(cc!=0){
							creviewscore=creviewscore/cc;
						}
						return creviewscore;
					}
					var v1=calsenti(childNodes1);
					var v2=calsenti(childNodes2);
						
					if(v1>v2){
						return 1;
					}else{
						return -1;
					}
				}	
				var sortit=$(".sreview").toArray().sort(s1);
				//console.log(sortit);
				$(".reviewContext").empty().append(sortit).scrollTop(0);
				$("#reviews").text("reviews sorted by sentiment score");
			}
			
			var cw=globalYelp.wordcloud.clickedWords;
			if(typeof(cw[wordsText])=="undefined"){
				cw[wordsText]=$(this).css("fill");
				$(this).attr("fill","#5F9EA0");
				$("."+wordsText).css("color","#5F9EA0");
				cw.LL=cw.LL+1;
			}else{
				$(this).attr("fill",cw[wordsText])
				delete cw[wordsText];
				cw.LL=cw.LL-1;
				$("."+wordsText).css('color','')
			}

			changeBackGround();	
			sortReview();
			
			//标签
			$(".triangle-topright").tipso({
				content:"click to tag readed"
			}).on("click",function(){
				//console.log("click");
				$(this).css("border-top-color","green");
				var index1=parseInt($(this).parent().attr("index"));
				 globalYelp.reviewEdit[index1].readIt=true;
			})
			
			//这里是grid的一些东西
			drawGrids(wordsText);
		}) ;
		
		//**************************************************************
       // $("#"+$this.attr("id")+" svg").append(word_span);

        var width = parseInt(word_span.style("width")),
            height = parseInt(word_span.style("height"));
            
		var left,top;
		if(typeof(pos)=="undefined"){
			left = options.center.x - width / 2.0;
            top = options.center.y - height / 2.0;
		}else{
			//pos.x 是左边不是中间啊 
			left=pos.centerX-width/2.0;
			top=pos.centerY-height/2.0;
		}


        // Save a reference to the style property, for better performance
        
        word_span.attr("x",left);
        word_span.attr("y",top);

        while(hitTest(word, already_placed_words)) {
          // option shape is 'rectangular' so move the word in a rectangular spiral
          if (options.shape === "rectangular") {
            steps_in_direction++;
            if (steps_in_direction * step > (1 + Math.floor(quarter_turns / 2.0)) * step * ((quarter_turns % 4 % 2) === 0 ? 1 : aspect_ratio)) {
              steps_in_direction = 0.0;
              quarter_turns++;
            }
            switch(quarter_turns % 4) {
              case 1:
                left += step * aspect_ratio + Math.random() * 2.0;
                break;
              case 2:
                top -= step + Math.random() * 2.0;
                break;
              case 3:
                left -= step * aspect_ratio + Math.random() * 2.0;
                break;
              case 0:
                top += step + Math.random() * 2.0;
                break;
            }
          } else { // Default settings: elliptic spiral shape
            radius += step;	//半径每次加step,
            angle += (index % 2 === 0 ? 1 : -1)*step;
			
			if(typeof(pos)=="undefined"){
			left = options.center.x - (width / 2.0) + (radius*Math.cos(angle)) * aspect_ratio;
            top = options.center.y + radius*Math.sin(angle) - (height / 2.0);
			}else{
				left = pos.centerX - (width / 2.0) + (radius*Math.cos(angle)) * aspect_ratio;
            top = pos.centerY + radius*Math.sin(angle) - (height / 2.0);
			//console.log(top);
			}
            
          }
          word_span.attr("x",left);
          word_span.attr("y",top);
		  
        }

		already_placed_words.push(word);
        // Don't render word if part of it would be outside the container
        if (options.removeOverflowing && (left < 0 || top < 0 || (left + width) > options.width || (top + height) > options.height)) {
          word_span.remove()
          return;
        }

        // Invoke callback if existing
        if ($.isFunction(word.afterWordRender)) {
          word.afterWordRender.call(word_span);
        }
      };
		
	var deleteDom=function(array){
	
		for(var i=array.length-1;i>-1;i--){
			var value=array[i];
			if(value.tags==-1){
				if(typeof(value.html)=="undefined"){
					console.log(value);
				}else{
					var dd=$("#"+value.html.id).parent();
					dd.remove();
					array.splice(i,1);
				}
			}
		}
	}
		
		var wordsChange=function(array){
			array.forEach(function(value){
				if(value.tags==0){
					var weight=Math.round((value.weight-word_array[word_array.length-1].weight)/weightGap*9)+1;
					if(typeof(value.html)=="undefined"){
					
					}else{ 
						selectColor(value)
						$("#"+value.html.id).css("font-size",weight*5);
						$("#"+value.html.id).attr("fill",value.color);
						//要判断现在处于啥情况，再赋值。
						already_placed_words.push(value);
						//checkedWords.push(value.html.id);
					}
				}
			})
		}
		
      var drawOneWordDelayed = function(index) {
        index = index || 0;
        if (!$this.is(':visible')) { // if not visible then do not attempt to draw
          setTimeout(function(){drawOneWordDelayed(index);},10);
          return;
        }
        if (index < word_array.length) {
          drawOneWord(index, word_array[index]);
          setTimeout(function(){drawOneWordDelayed(index + 1);}, 10);
        } else {
          if ($.isFunction(options.afterCloudRender)) {
            options.afterCloudRender.call($this);
          }
        }
      };

	  	
	  
      // Iterate drawOneWord on every word. The way the iteration is done depends on the drawing mode (delayedMode is true or false)
      if (options.delayedMode){
        drawOneWordDelayed();
      }
      else {
	  //第一次画词云
			
		deleteDom(options.ugw);
		options.gw.forEach(function(array){
			deleteDom(array);
			wordsChange(array);
		});
		
		
		wordsChange(options.ugw);
		
		var tag=false;
		while(!tag){	//重新布局,如果
			tag=true;
			for(var i=0;i<already_placed_words.length;i++){
				for(var j=i+1;j<already_placed_words.length;j++){
					var aid=already_placed_words[i];
					var bid=already_placed_words[j];
					if(adjustOverlapped(aid.html.id,bid.html.id)){
						//挪开来，
						tag=false;
					}
				}
			}
		}
		
		
	   $.each(options.gw,function(ii,groupwords){
			
			var rr=0;
			var step=3;
			var angle = 6.28 * Math.random();
			if(typeof(groupwords.pos)=="undefined"){
				var pos={};
				
				pos.width=Math.sqrt(groupwords.length)*35;
				pos.height=Math.sqrt(groupwords.length)*20;

				rr+=step;
				angle += (ii % 2 === 0 ? 1 : -1)*step;
				pos.x = options.center.x  + (rr*Math.cos(angle)) * aspect_ratio-pos.width/2;
				pos.y= options.center.y + rr*Math.sin(angle) -pos.height/2;
				
				
				pos.id=ii;
				var overlapedGW=function(warray){
				for(var i=0;i<warray.length;i++){
					var b=$("#"+warray[i].html.id);
					var bleft=parseInt(b.attr("x"));
					var bbotton=parseInt(b.attr("y")); 
					var bwidth=parseInt(b.css("width"));
					var bheight=parseInt(b.css("height"));
					if(Math.abs(pos.x-bleft)<(bwidth+pos.width)/2&& Math.abs(pos.y-bbotton)<(bheight+pos.width)/2){//overlapped ,true 
						return true;
					}
				}
					return false;
				}
				
				while(overlapedGW(already_placed_words)){
					rr+=step;
					angle += (ii % 2 === 0 ? 1 : -1)*step;
					pos.x = options.center.x - (pos.width / 2.0) + (rr*Math.cos(angle)) * aspect_ratio;
					pos.y = options.center.y + rr*Math.sin(angle) - (pos.height / 2.0);
				}
				groupwords.pos=pos;
			
			}
			//svg.append("rect").attr("x",pos.x).attr("y",pos.y).attr("width",pos.width).attr("height",pos.height).attr("fill-opacity",0.5).attr("fill","grey");
			
			for(var i=0;i<groupwords.length;i++){
				var value=groupwords[i];
				if(value.tags==1){
					
					
					drawOneWord(i,value,groupwords.pos);
					value.tags=0;
				}
			}
			
	   })
	  
	  $.each(options.ugw,function(i,value){
			if(value.tags==1){
				drawOneWord(i,value);
				value.tags=0;
			}
			
	  });
        //$.each(word_array, drawOneWord);
        if ($.isFunction(options.afterCloudRender)) {
          options.afterCloudRender.call($this);
        }
      }
	   
	  	var colorBar=function(g,color,text){
			g.selectAll("rect")
				.data(color)
				.enter()
				.append("rect")
				.attr("width",10)
				.attr("height",10)
				.attr("x",function(d,i){ return 60+i*10;})
				.attr("y",280)
				.style("fill",function(d){ return d})
				.style("font-size","10px");
				
			g.append("text")
				.text(text[0])
				.attr("x",55-color.length*5)
				.attr("y",290)
				.style("font-size","10px");
				
			g.append("text")
				.text(text[1])
				.attr("x",70+color.length*10)
				.attr("y",290)
				.style("font-size","10px");
		}
	
		var g=svg.append("g")
			.attr("id","wdp")
			.attr("x",20);
		
		if(options.valueType=="score"){
			colorBar(g,color1,["Negative","Positive"]);
		}else{
			colorBar(g,color2,["Low","High"]);
		}
		
    };

	
    // Delay execution so that the browser can render the page before the computatively intensive word cloud drawing
	drawWordCloud();
	
	
    //setTimeout(function(){drawWordCloud();}, 1);
    return $this;
  };
})(jQuery);
