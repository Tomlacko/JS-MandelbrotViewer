$(document).ready(function() {
	var clr = function() {
		cn.clearRect(0, 0, width, height);
	};
	
	var convert = function(h, s, v) {
		var r, g, b, i, f, p, q, t;
		if (arguments.length === 1) {
			s = h.s, v = h.v, h = h.h;
		}
		i = Math.floor(h * 6);
		f = h * 6 - i;
		p = v * (1 - s);
		q = v * (1 - f * s);
		t = v * (1 - (1 - f) * s);
		switch (i % 6) {
			case 0: r = v, g = t, b = p; break;
			case 1: r = q, g = v, b = p; break;
			case 2: r = p, g = v, b = t; break;
			case 3: r = p, g = q, b = v; break;
			case 4: r = t, g = p, b = v; break;
			case 5: r = v, g = p, b = q; break;
		}
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	};
	
	var fitRange = function(x) {
		var a = 0;
		var b = 1;
		var min = 1;
		var max = maxiter/colordiff;
		
		return (x-min)/(max-min);
	};
	
	var colors = ["#F0F0F0", "#F2B233", "#E57FD8", "#99B2F2", "#DEDE6C", "#7FCC19", "#F2B2CC", "#4C4C4C", "#999999", "#4C99B2", "#B266E5", "#3366CC", "#7F664C", "#57A64E", "#CC4C4C", "#191919"];
	
	var writePixel = function(x, y, c) {
		if(spectrum == "16col") {
			if(c===1) ctx.fillStyle=colors[15];
			else ctx.fillStyle=colors[(c-1)%16];
		}
		else {
			var a = c*colordiff;
			a = 255-Math.abs((256-(a%512)));
			if(spectrum == "RGB") {
				//mandelbrot = 255
				//outside = 0
				var r = a;
				var g = a;
				var b = a;
			}
			else
			{
				var z = (c-1)/((maxiter/colordiff)-1);
				if(spectrum == "HSV2") a = convert(z, a/255, a/255);
				else if(spectrum == "HSV3") a= convert(z, (Math.abs(128-a)*2)/255, (Math.abs(128-a)*2)/255);
				else if(spectrum == "HSV4") a= convert(Math.abs(1-((c*2)/(maxiter/colordiff))), c/(maxiter/colordiff), c/(maxiter/colordiff));
				else a = convert(z, 1, 1);
				var r = a[0];
				var g = a[1];
				var b = a[2];
			}
			ctx.fillStyle="rgba(" + r + ", " + g + ", " + b + ", 255)";
		}
		ctx.fillRect(x, y, downscale, downscale);
	};
	
	var calculateFrame = function() {
		//$("#bar").css("width", 1);
		for(y=0; y<height; y+=downscale) {
			for(x=0; x<width; x+=downscale) {
				var x0 = (x-midX) / zoom + offX;
				var y0 = (y-midY) / zoom + offY;
		 
				var a = 0;
				var b = 0;
				var rx = 0;
				var ry = 0;
				var iter = 0;
				
				while (iter < maxiter/colordiff && (rx * rx + ry * ry <= 4)) {
					rx = a * a - b * b + x0;
					ry = 2 * a * b + y0;
					a=rx;
					b=ry;
					
					iter++;
				}
				writePixel(x, y, iter);
			}
			//console.log(y)
			//$("#bar").css("width", y);
		}
		$("#zoom").html("Zoom: "+zoom);
		$("#X").html("X: "+offX);
		$("#Y").html("Y: "+offY);
		$("#res").html("Resolution: "+width+"x"+height);
		$("#iter").html("Iterations: "+(maxiter/colordiff));
	};
	
	$("#canvas").click(function(event) {
		event.preventDefault();
		var rect = canvas.getBoundingClientRect();
		var canx = event.clientX - rect.left;
		var cany = event.clientY - rect.top;
		
		offX = (canx-midX)/zoom + offX;
		offY = (cany-midY)/zoom + offY;
		console.log(offX, offY);
		calculateFrame();
	});
	
	$("#accept").click(function(event) {
		event.preventDefault();
		width=parseInt($("#newX").val());
		height=parseInt($("#newY").val());
		midX = width/2;
		midY = height/2;
		$("#canvas").attr("width", width);
		$("#canvas").attr("height", height);
		calculateFrame()
	});
	
	$("#rgb").click(function(event) {
		event.preventDefault();
		spectrum = "RGB";
		calculateFrame();
	});
	
	$("#hsv").click(function(event) {
		event.preventDefault();
		spectrum = "HSV2";
		calculateFrame();
	});
	
	$("#16col").click(function(event) {
		event.preventDefault();
		spectrum = "16col";
		calculateFrame();
	});
	
	$(document).keydown(function(e) {
		if(!$("input").is(":focus")) {
			e.preventDefault();
			switch(e.which) {
				case 37: // left
					//offX = offX-parseFloat(prompt("Move left:", 1));
					offX = offX-(width/4)/zoom/downscale;
					break;
				case 38: // up
					//offY = offY-parseFloat(prompt("Move up:", 1));
					offY = offY-(height/4)/zoom/downscale;
					break;
				case 39: // right
					//offX = offX+parseFloat(prompt("Move right:", 1));
					offX = offX+(width/4)/zoom/downscale;
					break;
				case 40: // down
					//offY = offY+parseFloat(prompt("Move down:", 1));
					offY = offY+(height/4)/zoom/downscale;
					break;
				case 107: //zoom
					//zoom = zoom*parseFloat(prompt("Zoom:", 2));
					zoom=zoom*2;
					break;
				case 109: //un-zoom
					//zoom = zoom/parseFloat(prompt("Un-Zoom:", 2));
					zoom = zoom/2;
					break;
				default:
					return;
			}
			calculateFrame();
		}
	});
	
	/*------------------------------------------------------------------------------*/
	
	var canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	width = canvas.width;
	height = canvas.height;
	
	maxiter = 4096;
	colordiff = 4;
	midX = width/2;
	midY = height/2;
	zoom = 64;
	offX = 0;
	offY = 0;
	console.log(offX, offY);
	spectrum = "RGB";
	downscale=1;
	
	calculateFrame();
});