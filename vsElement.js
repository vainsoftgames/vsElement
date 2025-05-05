"use strict";

var id_container = 'content',
	id_canvas = 'canvas',
	id_canvasBG = 'canvas_img',
	id_canvasVID = 'canvas_vid',
	id_canvasTracker = 'canvas_tracker',
	id_elementContainer = 'behind_canvas',
	elementContainer = undefined,//document.getElementById(id_elementContainer);
	cType;

function rectC(srcWidth, srcHeight, maxWidth, maxHeight) {
	return {
		x: ((maxWidth / 2) - (srcWidth / 2)),
		y: ((maxHeight / 2) - (srcHeight / 2))
	};
}
function get_maxSize() {
	var mWidth = ($(window).outerWidth() * 0.9) - element_draw.maxWMargin;
	var mHeight = $('#'+ id_container).outerHeight();

	return {
		width: parseInt(mWidth),
		height: parseInt(mHeight)
	};
}
function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
	var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
	return {
		width: parseInt(srcWidth * ratio),
		height: parseInt(srcHeight * ratio)
	};
}
function buildElementContainer() {
// 	adjustContent();
	if(typeof elementContainer == 'undefined'){
		elementContainer = document.getElementById(id_elementContainer);
		windowResize_listener();
	}
}
function clearElementContainer(newType) {
	buildElementContainer();

	if(newType != cType){
		if(cType == 'vid') element_vid.unload();
		else if(cType == 'img') element_img.unload();

// 		document.getElementById('video_navWrapper').style.display = 'none';
		elementContainer.innerHTML = '';
	}
}

// Define Playing Property to Video Elements
// Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
//     get: function(){
//         return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
//     }
// })

function windowResize_listener(){
// 	return;
// 	$( window ).resize(function() {
// // 		console.log('asdasd');
// 
// 		var needsResize = false;
// 		if(document.getElementById(id_container).style.width <= element_draw.canvas.width){
// // 			element_draw.canvas.width = document.getElementById(id_container).style.width;
// 			needsResize = true;
// 		}
// 
// 		else if(document.getElementById(id_container).style.height != element_draw.canvas.height){
// // 			element_draw.canvas.height = document.getElementById(id_container).style.height;
// 			needsResize = true;
// 		}
// 
// 		if(needsResize){
// 			var maxSize = get_maxSize();
// 			var newSize;
// 			var element;
// 			if(cType == 'vid'){
// 				element = element_vid.content;
// 				newSize = calculateAspectRatioFit(element_vid.content.videoWidth, element_vid.content.videoHeight, maxSize.width, maxSize.height);
// 			}
// 			else {
// 				element = element_img.canvas;
// 				newSize = calculateAspectRatioFit(element_img.canvas.width, element_img.canvas.height, maxSize.width, maxSize.height);
// 			}
// 
// 			if(cType == 'img'){
// 				console.log(newSize);
// 				var blah = element_img.canvas;
// 				if(element_img.canvas.width != newSize.width) element_img.canvas.width = newSize.width;
// 				if(element_img.canvas.height != newSize.height) element_img.canvas.height = newSize.height;
// 				element_img.ctx.drawImage(blah, 0, 0, newSize.width, newSize.height);
// 			}
// 			else {
// 				element.width = newSize.width;
// 				element.height = newSize.height;
// 			}
// 			element_draw.updateFrame(newSize);
// 		}
// 	});
}


/****
****/
var jsOBJ = {
	addRequiredScripts: function(scripts, callback){
		//Bradly SHARPE - Wrapper to include required scripts, scripts can be an array of paths, callback is optional
		var loaded = 0,
			haveLoadedScript = false;

		for (var i=0; i<scripts.length; i++) {
			var script;
			if (typeof scripts[i] === "object") {
				script = scripts[i].src;
				if (eval("typeof " + scripts[i].object) !== "undefined") {
					loaded++;
					continue;
				}
			} else {
				script = scripts[i];
			}
			jsOBJ.loadJavaScript(script, function(){ if (++loaded == scripts.length && typeof callback === "function") callback(); });
			haveLoadedScript = true;
		}

		if (!haveLoadedScript && typeof callback === "function")
			callback();

		return haveLoadedScript;
	},

	loadJavaScript: function(url, callback){
		//Bradly SHARPE - Wrapper to load javascripts into head element with optional callback
		var head = document.getElementsByTagName("head")[0];
		if (head){
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = url;

			//Bradly SHARPE - If callback is passed, set up script to call callback when loaded
			if (typeof callback === "function"){
// 				jsOBJ.addArrayMethods();
				script.onreadystatechange = function(e) {
					if (!e) e = window.event;
					var el = e.target || e.srcElement;
					if (el && ["loaded", "complete"].contains(el.readyState)) {
						callback();
					}
				};
				//Bradly SHARPE - Add default OnLoad event
				script.onload = callback;
			}

			head.appendChild(script);
		}
	}
}



function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
	if (typeof stroke == 'undefined') stroke = true;
	if (typeof radius === 'undefined') radius = 5;

	if (typeof radius === 'number') {
		radius = {tl: radius, tr: radius, br: radius, bl: radius};
	}
	else {
		var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
		for (var side in defaultRadius) {
			radius[side] = radius[side] || defaultRadius[side];
		}
	}

	ctx.beginPath();
	ctx.moveTo(x + radius.tl, y);
	ctx.lineTo(x + width - radius.tr, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
	ctx.lineTo(x + width, y + height - radius.br);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
	ctx.lineTo(x + radius.bl, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
	ctx.lineTo(x, y + radius.tl);
	ctx.quadraticCurveTo(x, y, x + radius.tl, y);
	ctx.closePath();

	if (fill) ctx.fill();
	if (stroke) ctx.stroke();
}


/****
 Elements
 ****/
var element_3d = {
	scene: null,
	camera: null,
	renderer: null,

	init: function(){
		clearElementContainer('3d');
		cType = '3d';

		jsOBJ.addRequiredScripts(['js/three_js/three.min.js'], function(){
			console.log('script loaded');
			var maxSize = get_maxSize();

			element_3d.scene = new THREE.Scene();
			element_3d.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
			element_3d.camera.position.z = 2;

			element_3d.renderer = new THREE.WebGLRenderer();
			element_3d.renderer.setSize( maxSize.width, maxSize.height );

			buildElementContainer();
			elementContainer.innerHTML = '';
			elementContainer.appendChild(element_3d.renderer.domElement);



			element_draw.updateFrame(maxSize);
			
			var geometry = new THREE.BoxGeometry( 1, 1, 1 );
			var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
			var cube = new THREE.Mesh( geometry, material );
			element_3d.scene.add( cube );

			function render() {
				requestAnimationFrame( render );

				cube.rotation.x += 0.01;
				cube.rotation.y += 0.01;
				cube.rotation.z += 0.01;
				element_3d.renderer.render( element_3d.scene, element_3d.camera );
			}
			render();
		});
	},

	load: function(pathURL, slideARR){
	}
}; 
 
var element_vid = {
	content: null,
	timer: null,
	fps: 29.97,

	init: function(){
		clearElementContainer('vid');
		cType = 'vid';

		if(!document.getElementById(id_canvasVID)){
			this.content = document.createElement('video');
			this.content.id = id_canvasVID;	
			this.content.crossOrigin = 'anonymous';

			buildElementContainer();
			elementContainer.innerHTML = '';
			elementContainer.appendChild(this.content);
		}

// 		document.getElementById('video_navWrapper').style.display = 'block';
// 		document.getElementById('vidRange').value = 0;
// 		element_vid.update_range(0);
	},

	load: function(slideID, completed){
		this.content.pause();
		this.content.src = '';

		var supportsVideoElement = !!this.content.canPlayType;
		if(supportsVideoElement){
			if(this.content.canPlayType('video/mp4')){
				if(typeof _project['s3'] != 'undefined') this.content.src = _project['path'];
				else this.content.src = _project['path'] +'.mp4';
			}
			else if(this.content.canPlayType('video/ogv') || this.content.canPlayType('video/ogg')){
				this.content.src = _project['path'] +'.ogv';
			}
			else if(this.content.canPlayType('video/webm')){
// 				this.content.src = remoteURL+'.webm';
				alert('WEBM Video Support');
			}
			else {
				this.content.innerHTML = 'Your browser does not support the video playback.';
				return;
			}


			// Need to center video player before getting video size
			var maxSize = get_maxSize();
			element_vid.content.width = maxSize.width;
			element_vid.content.height = maxSize.height;
			element_draw.updateFrame(maxSize);

			// Video Player parameters
			this.content.autoplay = false;// (detectmob() ? false : true);
			this.content.controls = false;
			this.content.preload = 'metadata';
			this.content.load();
// 			this.content.poster = remoteURL+'.png';
			this.content.muted = true;

// 			console.log(this.content.src);
// 			document.getElementById('vidRange').removeEventListener('input', element_vid.seekTo_during, false);
// 			document.getElementById('vidRange').addEventListener('input', element_vid.seekTo_during, false);

			this.content.ondurationchange = function(){
				document.getElementById('input_frameRange').max = this.duration * element_vid.fps;
				_project['duration'] = this.duration;

// 				if(typeof slides[slideNum].anno_time != 'undefined' && slides[slideNum].anno_time.length > 0){
// 					video_buildMakers(slides[slideNum].anno_time);
// 				}

// 				console.log(this.duration);
			}
// 			this.content.onseeked = function() {
// 				console.log('Seeked');
// 			}

			this.content.onloadedmetadata = function() {
				$('.loading.frames').hide();

				this.currentTime = 0;//300;// Math.floor((Math.random() * this.duration) + 1);
				element_vid.update_progress();
// 				element_vid.play();
// 				element_vid.content.pause();

				var newSize = calculateAspectRatioFit(this.videoWidth, this.videoHeight, maxSize.width, maxSize.height);

				element_vid.content.width = newSize.width;
				element_vid.content.height = newSize.height;
				element_draw.updateFrame(newSize);

				if(typeof completed === 'function') completed(true);
			};
			this.content.oncanplay = function(){
				element_vid.timer_start();
			};
		}
	},
	unload: function(){
		clearInterval(element_vid.timer);
	},
	getCurrentFrame(){
		return (element_vid.content.currentTime * element_vid.fps).toFixed(0);
// 		return (element_vid.content.currentTime * 29.97).toPrecision(6);
	},

	update_range: function(per){
	},
	// Updates Current Frame Label & Setting Range to correct value
	update_progress: function(useRange){
		var currentFrame = element_vid.getCurrentFrame();
		document.getElementById('input_frameRange').value = currentFrame;
		element_vid.update_progressLBL(currentFrame);
		cFrameIndex = currentFrame;
	},
	// Updates Current Frame label
	update_progressLBL: function(currentFrame){
		if(typeof currentFrame == 'undefined') currentFrame = element_vid.getCurrentFrame();
		document.getElementById('lbl_currentFrame').innerHTML = ('Frame: '+ currentFrame +' | '+ new Date(element_vid.content.currentTime * 1000).toISOString().substr(11, 8)); // change 8 to 12 to include .###
	},

	timer_clear: function(){
		if(element_vid.timer != null){
			clearInterval(element_vid.timer);
			element_vid.timer = null;
		}
	},
	timer_start: function(){
		if(element_vid.timer == null){
			// 29.97fps / 1000 = 33.3667000334
			element_vid.timer = setInterval(element_vid.update_progress, 33.3667000334);
		}
	},



	pp_toggle: function(btn){
		if(element_vid.isPlaying()){
			element_vid.pause();
			btn.alt = btn.title = 'Play';
		}
		else {
			element_vid.play();
			btn.alt = btn.title = 'Pause';
		}
	},
// 	aud_toggle: function(btn){
// 		element_vid.content.muted = !element_vid.content.muted;
// 		console(element_vid.content.muted);
// 		if(element_vid.content.muted){
// 		}
// 	},
	isPlaying: function(){
		return !!(element_vid.content.currentTime > 0 && !element_vid.content.paused && !element_vid.content.ended && element_vid.content.readyState > 2);
	},
	play: function(){
		element_vid.timer_start();
		element_vid.content.play();
	},
	pause: function(){
		element_vid.timer_clear();
		element_vid.content.pause();
	},
	seekTo_during: function(){
		element_vid.pause();
		element_vid.content.currentTime = this.value;
		element_vid.update_progress(document.getElementById('input_frameRange'));
	},
	seekTo: function(time){
		this.content.currentTime = time;
		
		if(!element_draw.isClear) element_draw.clearCanvas();
	}
};

var element_cache = {
	imageObj: null,
	cacheCanvas: null,
	ctx: null,
	index: 0,

	init: function(){
		element_cache.next();
	},
	load: function(frame){
		if(typeof element_cache.imageObj == 'undefined' || element_cache.imageObj == null) element_cache.imageObj = new Image();

		element_cache.imageObj.crossOrigin = 'Anonymous';
		element_cache.imageObj.onload = function(){
			if(typeof element_cache.cacheCanvas == 'undefined' || element_cache.cacheCanvas == null) {
				element_cache.cacheCanvas = document.createElement('canvas');

				element_cache.ctx = element_cache.cacheCanvas.getContext('2d');
				element_cache.ctx.mozImageSmoothingEnabled = true;
				element_cache.ctx.webkitImageSmoothingEnabled = true;
				element_cache.ctx.msImageSmoothingEnabled = true;
				element_cache.ctx.imageSmoothingEnabled = true;
			}

			element_cache.cacheCanvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
			element_cache.cacheCanvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size

			element_cache.cacheCanvas.getContext('2d').drawImage(this, 0, 0);
			frame['img'] = element_cache.cacheCanvas.toDataURL('image/png');
		}
		element_cache.imageObj.onerror = function(){}

		var frameURL;
		if(frame['thumb']) frameURL = getFrameURL(_jobID, frame['frameID'], '_preview');
		else frameURL = getConvertFrameURL(_jobID, frame['frameID'],'');

		console.log(frameURL);
		element_cache.imageObj.src = frameURL;

		element_cache.index++;
		element_cache.next();
	},

	next: function(){
		var frameKey = Object.keys(frames)[element_cache.index];
		if(typeof frameKey != 'undefined'){
			var frame = frames[frameKey];
			if(typeof frame != 'undefined'){
				element_cache.load(frame);
			}
		}
	}
}

function vsIMAGE(vsIMAGECache, imgURL, onComplete){
	vsIMAGECache.crossOrigin = 'Anonymous';
	vsIMAGECache.onload = function(){
		onComplete(this);
	};
	vsIMAGECache.onerror = function(){
		console.log('error: '+ this.src);
		if(typeof completed === 'function') onComplete(false);
	};
	vsIMAGECache.src = imgURL;
}

function element_ctm(divID){
	this.elementID = divID;

	this.init = function() {
// 		clearElementContainer('img');
		this.imageObj = new Image();
		this.cType = 'img';
		this.canvas = document.getElementById(divID);
		this.canvas.mozOpaque = true;
		this.canvas.id = this.elementID;
		this.ctx = null;

		this.canvas.width = document.getElementById(id_container).offsetWidth;
		this.canvas.height = document.getElementById(id_container).offsetHeight;
		elementContainer.appendChild(this.canvas);

		if(this.ctx == null){
			this.ctx = this.canvas.getContext('2d');
			this.ctx.mozImageSmoothingEnabled = true;
			this.ctx.webkitImageSmoothingEnabled = true;
			this.ctx.msImageSmoothingEnabled = true;
			this.ctx.imageSmoothingEnabled = true;
		}
	};
	
	
	this.pushIMG = function(img, completed){
		this.clearCanvas();

		var maxSize = get_maxSize();
		var newSize = calculateAspectRatioFit(img.width, img.height, maxSize.width, maxSize.height);

		this.canvas.width = newSize.width;
		this.canvas.height = newSize.height;
		this.ctx.drawImage(img, 0, 0, newSize.width, newSize.height);

		completed(true);
	};
	this.load = function(frame, completed){
		this.imageObj.crossOrigin = 'Anonymous';
		this.imageObj.onload = function(){
			element_img.pushIMG(this, completed);

			// Cache frame
			if(typeof frame['img'] == 'undefined') {
				frame['img'] = this;
			}
		}
		element_img.imageObj.onerror = function(){
			console.log('error: '+ this.src);
			if(typeof completed === 'function') completed(false);
		}

		if(typeof frame['img'] != 'undefined') {
			console.log('cached img');
			this.pushIMG(frame['img'], completed);
		}
		else {
			var frameURL;
			if(frame['thumb']) frameURL = getFrameURL(_jobID, frame['frameID'], '_preview');
			else frameURL = getConvertFrameURL(_jobID, frame['frameID'],'');

			this.imageObj.src = frameURL;
		}
	};
	this.loadIMG = function(imgURL, completed){
		vsIMAGE(this.imageObj, imgURL, completed);
// 		this.imageObj.crossOrigin = 'Anonymous';
// 		this.imageObj.onload = function(){
// 			this.pushIMG(this.imageObj, completed);
// // 			this.ctx.drawImage(this.imageObj, 0, 0, newSize.width, newSize.height);
// 
// 			// Cache frame
// // 			if(typeof parent.frame[this.elementID] == 'undefined') {
// // 				parent.frame[this.elementID] = this;
// // 			}
// 		};
// 		this.imageObj.onerror = function(){
// 			console.log('error: '+ this.src);
// 			if(typeof completed === 'function') completed(false);
// 		};
// 
// // 		if(typeof parent.frame['img'] != 'undefined') {
// 			console.log('cached img: '+ this.elementID);
// // 			this.pushIMG(frame[this.elementID], completed);
// // 		}
// // 		else
// 		this.imageObj.src = imgURL;
	};
	this.unload = function(){
		this.canvas = null;
		this.ctx = null;
	};


	this.clearCanvas = function(){
		// Store the current transformation matrix
		this.ctx.save();

		// Use the identity matrix while clearing the canvas
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Restore the transform
		this.ctx.restore();
	};
}

var element_img = {
	canvas: null,
	ctx: null,
	cacheCanvas: null,
	imageObj: new Image(),

	init: function(){
		clearElementContainer('img');
		cType = 'img';

		if(!document.getElementById(id_canvasBG)){
			element_img.canvas = document.createElement('canvas');
			element_img.canvas.mozOpaque = true;
			element_img.canvas.id = id_canvasBG;
			element_img.ctx = null;

			buildElementContainer();
			elementContainer.innerHTML = '';
			elementContainer.appendChild(this.canvas);
		}
		else if(this.canvas == null){
			element_img.canvas = document.getElementById(id_canvasBG);
		}

		element_img.canvas.width = document.getElementById(id_container).offsetWidth;
		element_img.canvas.height = document.getElementById(id_container).offsetHeight;

		if(element_img.ctx == null){
			element_img.ctx = element_img.canvas.getContext('2d');
			element_img.ctx.mozImageSmoothingEnabled = true;
			element_img.ctx.webkitImageSmoothingEnabled = true;
			element_img.ctx.msImageSmoothingEnabled = true;
			element_img.ctx.imageSmoothingEnabled = true;
		}
	},

	pushIMG: function(img, completed){
		element_img.clearCanvas();

		var maxSize = get_maxSize();
		var newSize = calculateAspectRatioFit(img.width, img.height, maxSize.width, maxSize.height);

		element_img.canvas.width = newSize.width;
		element_img.canvas.height = newSize.height;
		element_img.ctx.drawImage(img, 0, 0, newSize.width, newSize.height);

		element_draw.updateFrame(newSize);

		completed(true);
	},
	load: function(frame, completed){
		element_draw.clearCanvas();
		element_img.imageObj.crossOrigin = 'Anonymous';
		element_img.imageObj.onload = function(){
			element_img.pushIMG(this, completed);

			// Cache frame
			if(typeof frame['img'] == 'undefined') {
				frame['img'] = this;
			}
		}
		element_img.imageObj.onerror = function(){
			console.log('error: '+ this.src);
			if(typeof completed === 'function') completed(false);
		}

		if(typeof frame['img'] != 'undefined') {
			console.log('cached img');
			element_img.pushIMG(frame['img'], completed);
// 			element_img.imageObj.src = frame['img'];
		}
		else {
			var frameURL;
			if(frame['thumb']) frameURL = getFrameURL(_jobID, frame['frameID'], '_preview');
			else frameURL = getConvertFrameURL(_jobID, frame['frameID'],'');

			element_img.imageObj.src = frameURL;
		}
	},
	unload: function(){
		this.canvas = null;
		this.ctx = null;
	},


	clearCanvas: function(){
		// Store the current transformation matrix
		this.ctx.save();

		// Use the identity matrix while clearing the canvas
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Restore the transform
		this.ctx.restore();
	}
};

var element_draw = {
	points: [],
	isClear: true,
	isEraser: false,
	started: false,
	cTool: 0,
	lastx: 0,
	lasty: 0,

	// Canvas Variables
	canvas: null,
	memCanvas: null,
	ctx: null,
	memCtx: null,

	// Anno variables
	cColor: '#000',
	drawMode: 'anno',
	cLineWidth: 3,
	eraseSize: 5,

	maxHMargin: 90,
	maxWMargin: 0,


	init: function(){
		element_draw.canvas = document.getElementById(id_canvas);
		element_draw.canvas.width = document.getElementById(id_container).offsetWidth;
		element_draw.canvas.height = document.getElementById(id_container).offsetHeight;

		element_draw.ctx = element_draw.canvas.getContext('2d');
		element_draw.ctx.font = 'Arial 12px';

		// Touch Events (ex: iOS)
		element_draw.canvas.addEventListener('touchstart', element_draw.mouseDown, false);
		element_draw.canvas.addEventListener('touchmove', element_draw.mouseMove, false);
		element_draw.canvas.addEventListener('touchend', element_draw.mouseUp, false);
		// Mouse Events (ex: Desktop)
		element_draw.canvas.addEventListener('mousedown', element_draw.mouseDown, false);
		element_draw.canvas.addEventListener('mousemove', element_draw.mouseMove, false);
		element_draw.canvas.addEventListener('mouseup', element_draw.mouseUp, false);
		// Mouse Events (ex: Desktop)
		element_draw.canvas.addEventListener('pointerdown', element_draw.mouseDown, false);
		element_draw.canvas.addEventListener('pointermove', element_draw.mouseMove, false);
		element_draw.canvas.addEventListener('pointerup', element_draw.mouseUp, false);


		// Create an in-memory canvas
		element_draw.memCanvas = document.createElement('canvas');
		element_draw.memCanvas.width = element_draw.canvas.width;
		element_draw.memCanvas.height = element_draw.canvas.height;
		element_draw.memCtx = element_draw.memCanvas.getContext('2d');

		this.ctxDefaults();
	},
	updateColor: function(hex){
		element_draw.cColor = ((hex.charAt(0) != '#') ? ('#'+hex) : hex);
		element_draw.ctx.strokeStyle = element_draw.cColor;
		element_draw.ctx.fillStyle = element_draw.cColor;
	},
	updateSize: function(size){
		element_draw.cLineWidth = size;
		element_draw.ctx.lineWidth = size;
	},

	// Drawing Methods
	drawPoints: function(ctx, points) {
		if(element_draw.isEraser){
			ctx.save();
			ctx.globalCompositeOperation = 'destination-out';
		}

		// draw a basic circle instead
		if (points.length < 6) {
			var b = points[0];

			ctx.beginPath(), ctx.arc(b.x, b.y, ctx.lineWidth / 2, 0, Math.PI * 2, !0);
			ctx.stroke();
			ctx.closePath();
			if(element_draw.isEraser) ctx.restore();

			return;
		}

		ctx.beginPath(), ctx.moveTo(points[0].x, points[0].y);
		// draw a bunch of quadratics, using the average of two points as the control point
		for (var i = 1; i < points.length - 2; i++) {
			var c = (points[i].x + points[i + 1].x) / 2,
				d = (points[i].y + points[i + 1].y) / 2;

			ctx.quadraticCurveTo(points[i].x, points[i].y, parseInt(c), parseInt(d));
		}

		ctx.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
		ctx.stroke();
		ctx.closePath();

		if(element_draw.isEraser) ctx.restore();
		points = [];
	},
	drawRect: function(ctx, points) {
		var lastPoint = points.pop();
		var w = lastPoint.x - points[0].x;
		var h = lastPoint.y - points[0].y;

		ctx.beginPath();


		if(element_draw.cTool == 90){
			ctx.strokeStyle = '#293340';
			ctx.fillStyle = 'rgba(41,51,64,0.2)';
			roundRect(ctx, points[0].x, points[0].y, w, h, 3, true, true);
			ctx.lineWidth = 2;
		}
		else {
			ctx.rect(points[0].x, points[0].y, w, h);
			ctx.stroke();
		}
		ctx.closePath();

		points = [];
	},
	drawCircle: function(ctx, points) {
		var lastPoint = points.pop();
		var w = lastPoint.x - points[0].x;

		ctx.beginPath();
		ctx.arc(points[0].x, points[0].y, Math.abs(w), 0, 2 * Math.PI, true);
		ctx.stroke();
		ctx.closePath();

		points = [];
	},
	drawArrow: function(ctx, points) {
		var fromX = points[0].x;
		var fromY = points[0].y;
		var toX = points[points.length-1].x;
		var toY = points[points.length-1].y;
		var headlen = (element_draw.cLineWidth * 4);

		var angle = Math.atan2(toY-fromY,toX-fromX);

		//starting path of the arrow from the start square to the end square and drawing the stroke
		ctx.beginPath();
		ctx.moveTo(fromX, fromY);
		ctx.lineTo(toX, toY);
		ctx.stroke();

		//starting a new path from the head of the arrow to one of the sides of the point
		ctx.beginPath();
		ctx.moveTo(toX, toY);
		ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 7), toY - headlen * Math.sin(angle - Math.PI / 7));

		//path from the side point of the arrow, to the other side point
		ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 7), toY-headlen * Math.sin(angle+Math.PI / 7));

		//path from the side point back to the tip of the arrow, and then again to the opposite side point
		ctx.lineTo(toX, toY);
		ctx.lineTo(toX-headlen * Math.cos(angle - Math.PI / 7), toY - headlen * Math.sin(angle - Math.PI / 7));

		// Draws the paths created above
		ctx.stroke();
		ctx.fill();
	},
	drawLine: function(ctx, points) {
		var fromX = points[0].x;
		var fromY = points[0].y;
		var toX = points[points.length-1].x;
		var toY = points[points.length-1].y;

		// Starting path of the arrow from the start square to the end square and drawing the stroke
		ctx.beginPath();
		ctx.moveTo(fromX, fromY);
		ctx.lineTo(toX, toY);
		ctx.stroke();
	},
	drawEllipse: function(ctx, points){
		var lastPoint = points.pop();
		var x = points[0].x;
		var y = points[0].y;
		var w = lastPoint.x - points[0].x;
		var h = lastPoint.y - points[0].y;

		var kappa = .5522848,
			ox = (w / 2) * kappa, // control point offset horizontal
			oy = (h / 2) * kappa, // control point offset vertical
			xe = x + w,           // x-end
			ye = y + h,           // y-end
			xm = x + w / 2,       // x-middle
			ym = y + h / 2;       // y-middle

		ctx.beginPath();
		ctx.moveTo(x, ym);
		ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
		ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
		ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
		ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
		ctx.stroke();
	},


	clearCanvas: function(btn){
		this.points = [];
		// Store the current transformation matrix
		this.ctx.save();
		this.memCtx.save();

		// Use the identity matrix while clearing the canvas
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.memCtx.setTransform(1, 0, 0, 1, 0, 0);
		this.memCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Restore the transform
		this.ctx.restore();
		this.memCtx.restore();
		this.ctxDefaults();
		
		element_draw.isClear = true;
	},

	ctxDefaults: function(){
		if(this.cColor.charAt(0) != '#') this.cColor = '#'+this.cColor;

		this.ctx.lineWidth = this.cLineWidth;
		this.ctx.lineCap = 'round';
		this.ctx.lineJoin = 'round';
		this.ctx.strokeStyle = this.cColor;
		this.ctx.fillStyle = this.cColor;
	},

	render: function(){
		console.log('render');

		this.ctx.drawImage(memCanvas, 0, 0);
		requestAnimationFrame(this.render);
	},

	loadAnno: function(annoID, completed){
		element_draw.clearCanvas();

		var imageObj = new Image();
		imageObj.crossOrigin = 'Anonymous';
		imageObj.onload = function(){
			var maxSize = get_maxSize();
			var newSize = calculateAspectRatioFit(imageObj.width, imageObj.height, maxSize.width, maxSize.height);
			console.log(newSize);

			element_draw.canvas.width = newSize.width;
			element_draw.canvas.height = newSize.height;
			element_draw.memCanvas.width = newSize.width;
			element_draw.memCanvas.height = newSize.height;

			element_draw.clearCanvas();
			element_draw.ctxDefaults();
			element_draw.ctx.drawImage(imageObj, 0, 0, newSize.width, newSize.height);

			element_draw.memCtx.clearRect(0, 0, element_draw.canvas.width, element_draw.canvas.height);
			element_draw.memCtx.drawImage(imageObj, 0, 0);

			completed(true);
			element_draw.isClear = false;
		}
		imageObj.onerror = function(){
			console.log('error: '+ this.src);
			if(typeof completed === 'function') completed(false);
		}

		imageObj.src = 'ajax/api.php?action=getAnno&jobID='+ _jobID +'&annoID='+ annoID +'&type=anno';
// 		vsAJAX(para, function(response){
// 			imageObj.src = response['result']['url'];
// 		});
	},

	updateFrame: function(newSize){
		element_draw.canvas.width = newSize.width;
		element_draw.canvas.height = newSize.height;
		element_draw.memCanvas.width = newSize.width;
		element_draw.memCanvas.height = newSize.height;

		document.getElementById(id_container).style.width = newSize.width;
		document.getElementById(id_container).style.height = newSize.height;
// 		element_draw.clearCanvas();
		element_draw.ctxDefaults();

		element_draw.memCtx.clearRect(0, 0, element_draw.canvas.width, element_draw.canvas.height);
	},


	// Mouse/Touch Events
	getMouse: function(e, canvas){
		var element = this.canvas,
			offsetX = 0,
			offsetY = 0,
			mx,
			my;

		// Compute the total offset. It's possible to cache this if you want
		if (element.offsetParent !== undefined) {
			do {
				offsetX += element.offsetLeft;
				offsetY += element.offsetTop;
			} while ((element = element.offsetParent));
		}

		mx = e.pageX - offsetX;
		my = e.pageY - offsetY;

		// We return a simple javascript object with x and y defined
		return {
			x: parseInt(mx),
			y: parseInt(my)
		};
	},
	mouseDown: function(e){
		if(element_draw.cTool == -1) return;
		else if(cType == 'vid'){
			element_vid.pause();
// 			video_hideMarker();
// 			show_thumbnailView(true);
		}

		var m = element_draw.getMouse(e, element_draw.canvas);
		element_draw.points.push({
			x: m.x,
			y: m.y
		});
		element_draw.started = true;
		element_draw.isClear = false;
		e.preventDefault();
	},
	mouseMove: function(e){
		if (element_draw.started) {
			element_draw.ctx.clearRect(0, 0, element_draw.canvas.width, element_draw.canvas.height);
			// put back the saved content
// 			if(element_draw.cTool == 0) {
				element_draw.ctx.drawImage(element_draw.memCanvas, 0, 0);
// 			}
			var m = element_draw.getMouse(e, element_draw.canvas);

			element_draw.points.push({
				x: m.x,
				y: m.y
			});

			switch(parseInt(element_draw.cTool)){
				case 1: case 90:
					element_draw.drawRect(element_draw.ctx, element_draw.points);
					break;
				case 2:
					element_draw.drawCircle(element_draw.ctx, element_draw.points);
					break;
				case 3:
					element_draw.drawArrow(element_draw.ctx, element_draw.points);
					break;
				case 4:
					element_draw.drawLine(element_draw.ctx, element_draw.points);
					break;
				case 6:
					element_draw.drawEllipse(element_draw.ctx, element_draw.points);
					break;
				default:
					element_draw.drawPoints(element_draw.ctx, element_draw.points);
					break;
			}

// 			if(element_draw.cTool == 1 || element_draw.cTool == 90){
// 				element_draw.drawRect(element_draw.ctx, element_draw.points);
// 			}
// 			else if(element_draw.cTool == 2){
// 				element_draw.drawCircle(element_draw.ctx, element_draw.points);
// 			}
// 			else if(element_draw.cTool == 3){
// 				element_draw.drawArrow(element_draw.ctx, element_draw.points);
// 			}
// 			else if(element_draw.cTool == 4){
// 				element_draw.drawLine(element_draw.ctx, element_draw.points);
// 			}
// 			else if(element_draw.cTool == 6) {}
// 			else{
// 				element_draw.drawPoints(element_draw.ctx, element_draw.points);
// 			}
		}
	},
	mouseUp: function(e){
		if (element_draw.started) {
			element_draw.started = false;

			// When the pen is done, save the resulting context to the in-memory canvas
			element_draw.memCtx.clearRect(0, 0, element_draw.canvas.width, element_draw.canvas.height);
			element_draw.memCtx.drawImage(element_draw.canvas, 0, 0);
			element_draw.points = [];

			if(element_draw.cTool >= 90){
				console.log('cTool: '+ element_draw.cTool);
				element_draw.ctxDefaults();
			}
		}
	},


	// Tools
	// 0 = Default Annotation (Freehand / Eraser)
	// 1 = Sqaure
	// 2 = Circle
	// 3 = Arrow
	// 4 = Line
	// 5 = Text
	// 6 = Ellipse
	// 90 = Highlight Area Comment
	tool_color: function(btn){
		element_draw.updatColor($(btn).attr('data-color'));

		$('.item_overlay').fadeOut('slow');
		$('[data-colorHolder]').attr('data-color', element_draw.cColor).css('background-color', element_draw.cColor);
	},
	tool_size: function(btn){
		$('.lineSize').removeClass('nnav_annoBtnACTIVE', 100, "linear");
		$(btn).addClass('nnav_annoBtnACTIVE', 100, "linear");

		element_draw.cLineWidth = $(btn).attr('data-width');
		element_draw.ctx.lineWidth = element_draw.cLineWidth;
		if(element_draw.isEraser) element_draw.ctx.lineWidth *= element_draw.eraserSize;
	},
	tool_eraser: function(btn){
		element_draw.cTool = 0;
		if(!element_draw.isEraser){
			element_draw.isEraser = true;
			element_draw.ctx.lineWidth *= element_draw.eraserSize;
		}

		$('.annoTools .itemACTIVE').removeClass('itemACTIVE');
		$(btn).addClass('itemACTIVE');

// 		element_draw.ctx.fillStyle = "red";
// 		element_draw.ctx.fillText('hahaha', 200, 200);
	},
	tool_clear: function(btn){
		if(confirm('Want to Clear Canvas?')){
			element_draw.clearCanvas();
		}
	},
	tool: function(btn){
		var toolID = $(btn).attr('data-tool');

		element_draw.cTool = toolID;
		element_draw.isEraser = false;

		$('.annoTools .itemACTIVE').removeClass('itemACTIVE');
		$(btn).addClass('itemACTIVE');
		$('[data-tool="'+ toolID +'"]').addClass('itemACTIVE');


		// Set Data-Tool incase someone clicks on the Tool Holder
		// Need to add Class cause it's removed by the .tool above
		$('[data-toolHolder]').attr('data-tool', toolID).addClass('itemACTIVE').html($(btn).html());
		$('.item_overlay').fadeOut('slow');
	},


	nodeExport: function(){
		return this.canvas.toDataURL('image/png');
	},
	nodeUpdate_anno: function(isClear){
		if(typeof isClear != 'undefined' && isClear) {
			ajax_clearAnnotation(slides[slideNum].itemID, (cType=='vid' ? element_vid.content.currentTime : 0), function(response){
				console.log(response);
			}, null);
		}
		else {
			var dataURL = (isClear ? '' : this.canvas.toDataURL('image/png'));
			var dataThumb = this.export_thumbnail();

			ajax_newAnnotation(slides[slideNum].itemID, dataURL, dataThumb, (cType=='vid' ? element_vid.content.currentTime : 0), function(response){
				console.log(response);
			}, null);
		}
	},

	// Export Options
	exportAnno: function(){
		return element_draw.canvas.toDataURL('image/png');
	},
	export_thumbnail: function(){
		var newSize = calculateAspectRatioFit(element_draw.canvas.width, element_draw.canvas.height, 160, 160);
		return this.exportIMG(newSize);
	},
	exportFull: function(returnIMG){
		var base64 = this.exportIMG({width: element_draw.canvas.width, height: element_draw.canvas.height}, false, 'image/png');
		if(returnIMG) return base64;
		else window.open(base64, 'STORM | Anno Export');
	},
	exportIMG: function(size, isNumber, returnType){
		if(typeof returnType == 'undefined') returnType = 'image/jpeg';
		if(isNumber) {
			size = calculateAspectRatioFit(element_draw.canvas.width, element_draw.canvas.height, size, size);
		}

		var tmpCANVAS = document.createElement('canvas');
		var tmpCTX = tmpCANVAS.getContext('2d');
			tmpCTX.mozImageSmoothingEnabled = true;
			tmpCTX.webkitImageSmoothingEnabled = true;
			tmpCTX.msImageSmoothingEnabled = true;
			tmpCTX.imageSmoothingEnabled = true;

		tmpCANVAS.width = size.width;
		tmpCANVAS.height = size.height;

		if(cType == 'vid') {
			tmpCTX.drawImage(element_vid.content, 0, 0, element_vid.content.videoWidth, element_vid.content.videoHeight, 0, 0, size.width, size.height);
		}
		else {
			tmpCTX.drawImage(element_img.canvas, 0, 0, element_img.canvas.width, element_img.canvas.height, 0, 0, size.width, size.height);
		}

		tmpCTX.drawImage(element_draw.canvas, 0, 0, element_draw.canvas.width, element_draw.canvas.height, 0, 0, size.width, size.height);

		return tmpCANVAS.toDataURL(returnType);
	}
};
