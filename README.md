# vsElement Canvas & Media Utility Library

A lightweight JavaScript library providing a set of classes to handle 3D scenes, video playback, image loading/caching, and annotation/drawing overlays on HTML5 canvas elements. Ideal for applications requiring interactive media display and annotation such as video editors, 3D viewers, and collaborative drawing tools.

## Table of Contents

* [Features](#features)
* [Installation](#installation)
* [Setup & Initialization](#setup--initialization)
* [API Reference](#api-reference)

  * [Global Utilities](#global-utilities)
  * [Element Classes](#element-classes)

    * [element\_3d](#element_3d)
    * [element\_vid](#element_vid)
    * [element\_img](#element_img)
    * [element\_cache](#element_cache)
    * [element\_draw](#element_draw)
* [Helper Functions](#helper-functions)
* [Example Usage](#example-usage)
* [Contributing](#contributing)
* [License](#license)

## Features

* **3D Rendering** with Three.js integration (`element_3d`).
* **Video Playback** controls and frame tracking (`element_vid`).
* **Image Loading & Caching** with automatic resizing (`element_img`, `element_cache`).
* **Canvas Annotation**: freehand, shapes, arrows, text, eraser, and export (`element_draw`).
* **Dynamic Script Loading** (`jsOBJ`).
* Responsive element sizing with aspect ratio fitting.

## Installation

1. Clone the repository or copy the `vsElement` scripts into your project.
2. Include the main script and dependencies in your HTML:

```html
<script src="path/to/vsElement.js"></script>
<!-- For 3D scenes include Three.js when using element_3d -->
<script src="path/to/three.min.js"></script>
```

## Setup & Initialization

1. Ensure your HTML has containers with the following IDs:

   * `#content` — main wrapper element.
   * `#behind_canvas` — element container for media.
   * A `<canvas id="canvas"></canvas>` for annotation overlay.
2. Configure global IDs at the top of `vsElement.js` if needed.
3. Call the init method of the desired element:

```js
// Initialize annotation canvas
element_draw.init();

// Initialize image loader
element_img.init();

// Initialize video player
element_vid.init();

// Initialize 3D scene
element_3d.init();
```

## API Reference

### Global Utilities

#### `jsOBJ.addRequiredScripts(scripts: Array<string|object>, callback?: Function): boolean`

Dynamically appends script tags to `<head>` and executes callback once loaded.

#### `roundRect(ctx, x, y, width, height, radius?, fill?, stroke?): void`

Draws a rounded rectangle on a 2D context.

#### `calculateAspectRatioFit(srcW, srcH, maxW, maxH): {width, height}`

Returns width/height that fit within max dimensions, preserving aspect ratio.

### Element Classes

#### `element_3d`

* **Methods:**

  * `init()` — Clears container, loads Three.js, sets up scene, camera, and renderer.
  * `load(pathURL, slideARR)` — (Placeholder) load additional assets.

#### `element_vid`

Handles HTML5 video playback with custom controls and frame tracking.

* **Properties:** `content` (HTMLVideoElement), `fps`.
* **Methods:**

  * `init()` — Creates `<video>` element and appends to container.
  * `load(slideID, completed)` — Loads video from path, resizes, binds events.
  * `play()`, `pause()`, `seekTo(time)` — Playback controls.
  * `getCurrentFrame()` — Returns current frame index.
  * `timer_start()`, `timer_clear()` — Internal frame update loop.
  * `unload()` — Clears timers and resources.

#### `element_img`

Loads and draws images onto a canvas with automatic resizing.

* **Methods:**

  * `init()` — Prepares a background canvas.
  * `load(frame, completed)` — Loads image from URL or cache, resizes to fit.
  * `pushIMG(img, completed)` — Draws given Image object.
  * `unload()` — Releases references.

#### `element_cache`

Pre-caches image frames in an off-screen canvas.

* **Methods:**

  * `init()` — Starts preloading sequence.
  * `load(frame)` — Loads and draws to cache canvas, stores dataURL.
  * `next()` — Iterates through frames map.

#### `element_draw`

Full-featured annotation toolkit over a canvas overlay.

* **Methods:**

  * `init()` — Sets up canvas, context, and event listeners (mouse/touch).
  * `updateColor(hex)`, `updateSize(px)` — Change drawing color and line width.
  * `clearCanvas()` — Clears both visible and memory canvas.
  * Shape drawing: `drawRect`, `drawCircle`, `drawEllipse`, `drawArrow`, `drawLine`, `drawPoints`.
  * `loadAnno(annoID, completed)` — Fetches and renders saved annotation image.
  * Export: `exportAnno()`, `export_thumbnail()`, `exportFull()`, `exportIMG(size)`.
  * Tool selectors: freehand, eraser, rectangle, circle, arrow, line, ellipse, highlight.

## Helper Functions

* `rectC(srcW, srcH, maxW, maxH)` — Centers coordinates for given sizes.
* `get_maxSize()` — Computes max display area based on window and margins.
* `buildElementContainer()` / `clearElementContainer(newType)` — Manages container clearing and type switching.
* `windowResize_listener()` — (Commented) listens for window resize to adjust element sizes.

## Example Usage

```html
<div id="content">
  <div id="behind_canvas"></div>
  <canvas id="canvas"></canvas>
</div>
<script src="vsElement.js"></script>

<script>
  // Prepare annotation overlay
  element_draw.init();

  // Display an image
  element_img.init();
  element_img.load({ frameID: 1 }, function(success) {
    console.log('Image loaded:', success);
  });

  // Play a video
  element_vid.init();
  element_vid.load(null, function() {
    element_vid.play();
  });

  // Render a rotating cube
  element_3d.init();
</script>
```

## Contributing

Feel free to submit issues or pull requests. Please follow the existing code style and provide clear test steps.
