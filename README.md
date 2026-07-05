# wirehorse

Wireframing from the horse stable. Rapid, clean, web-based -- as it should be.

Wireframing works when the distance from idea to demonstration is kept as as short as possible. This is the guiding philosophy of Wirehorse.

* Clean UI where the only elements on top of the canvas are selection handles and the mouse pointer
* No barely- and rarely-used features getting in the way. Just shapes and a canvas.
* Draw rectangles by holding 'R' and dragging the mouse
* Draw text by holding 'T' and dragging the mouse
* Place labels by holding 'L' and clicking
* Place buttons by holding 'B' and clicking
* Add other things from the toolbar or by pressing '/'

![Wirehorse screenshot]([image-url](https://wirehorse.mcglashan.net/assets/screenshot.png))

## Version history

### v0.5.0
* Wireframe switcher now scrolls long lists and is searchable
* Added a new 'use at your risk' backup and restore tool
* Improvements to shape drawing
* Drop-down box caret is now a fixed size
* Better rename UI

### v0.4.2
* Buttons can be added by holding 'b' and clicking the mouse
* Horizontal rules can be added by holding 'h' and dragging the mouse
* Improvements to shape resizing via drag handles
* Text elements can have their widths reset

### v0.4.1
* Text elements now properly support the left, centre, and right alignment options
* Text parsing e.g. this is {b bold}, {i italic} {#ddd color}
* 'R'+drag rectangles now position correctly
* Fixed an issue where the editor stopped invoking
* Editor can no longer be invoked on entities with no text aspect e.g. icons, rules, sliders, ...
* Comboboxes now ignore blank lines in their model when rendering
* Text area content editor can now be resized
* Paragraphs can be added quickly with T+mouse drag
* Labels can be added quickly with L+mouse click

### v0.4
* Paste now places new shapes in the centre of the viewport
* Considerable script loading refactor

### v0.3.5
* New shape: Horizontal slider 
* Added 21 new icons

### v0.3.4
* Shapes can be locked to prevent edits
* Palette now handles multi-selection form UI for the common controls
* New street map component
* Icon components can have their icon changed _in situ_
* Locked elements are fully ignored by selection clicks
* LocalStorage usage is shown on the menu

### v0.3.3
* New compass button to reset the display in terms of scroll and zoom
* Compass will focus the selection or everything if Shift is held when pressing
* New icons: thumbs up and down
* Cut, copy and paste into the clipboard
* New shapes: vertical rule, horizontal scrollbar

### v0.3.2
* Editors can be submitted with Shift+Enter
* Cmd-D duplicate now retains the z-index order
* New icons: trash, id card, copy
* Duplicate a wireframe into a new file with the next available name
* Wireframes can be deleted
* Load now functions as import into the current wireframe

### v0.3.1
* Improvements to paragraphs and labels in terms of sizing and text parsing
* Added a filter and up/down icons for future use in tables
* Wireframes can be renamed from the toolbar
* Performance improvements to scaling and zooming
* You can remove from a multi-selection by clicking an element while still holding Shift
* Cmd+A to select all is less intermittant
* Cmd+B,I,U change the font of the selected shapes
* There's a fancy new data table component
* Five new icons: at, camera, document, key, phone

### v0.3.0
* Moving shapes forwards and backwards can now be undone and redone
* Re-implemented selection mechanics making it easier to see and find selected shapes
* Press 'R' and drag to add a new rectangle shape
* Horizontal and vertical alignment
* New outlined button default
* Vertical scrollbars can have their border colours changed
* New items added via the menu are set in the middle of the screen
* Multiple wireframes are stored in localstorage now
* Multi-select by drawing a rectangle with the mouse

### v0.2.4
* Labels have width support to behave like paragraphs
* Checkboxes & radio buttons have been added
* New scrollbar shape
* Rectangles can now have opacity between 0 and 100
* Implemented text fields and text areas as defaulted rectangles
* Selected colour highlighted in the picker

### v0.2.3
* New breadcrumbs shape
* New horizontal rule shape
* New tabs shape
* Added lots of new icons
* Improved the editor to be more robust
* Typing 'lorem' in an editor fills the component with lorem ipsum text
* Scribble font now an option for components

### v0.2.2
* Added a few more icons.
* Icons can now be coloured, but the selection outline doesn't show.

### v0.2.1
* Two icons can be added as shapes.
* Fixed various selection and presentation issues with the shape adder.

### v0.2
* Improvements to the shape adder.
