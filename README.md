Responsive JQuery gallery with touch support
=================================

Easy to use jquery gallery plugin, minimal HTML required, fully responsive, touch screen supported, very customisable 
and well documented!

Example usage
=================================

```html
<div id="gallery-wrapper">
   <ul id="gallery">
       <li><img src="some/img" /></li>
       <li><img src="some/img" /></li>      
       <li><img src="some/img" /></li>
   </ul>
   <a href="#" title="Next" id="next-button">Next</a>
   <a href="#" title="Previous" id="previous-button">Previous</a>
</div>
```
    
```javascript
<script type="text/javascript">
   $('#gallery').garethGallery();
</script>
```


Arguments
==================================
<ul>
<li><strong>leftButton</strong>  - string id of the left button element</li>
<li><strong>rightButton</strong> - string id of the right button element</li>
<li><strong>speed</strong>     - how fast the run the transitions, this is used for swipe, animate and fade (default 500, as in ms)</li>
<li><strong>autoMove</strong>  - boolean, default true. use to have a auto moving gallert</li>
<li><strong>touch</strong> - boolean for touch support! This applies to thumbnails panes also, default true</li>
<li><strong>thumbnails</strong> - string id of the thumbnail 'inner' element</li>
<li><strong>thumbLeft</strong> - string id of the thumbnail move left button</li>
<li><strong>thumbRight</strong> - string id of the thumbnail move right button</li>
<li><strong>fade</strong> - boolean, default false, use to have fading gallery</li>
<li><strong>swapImages</strong> - boolean, default false, use to swap images at 550 x 550 or more on load or resize. use 'data-high-res' attr on image tag. the value should be the high res version of the image</li>
<li><strong>progressBar</strong> - default false, a string that is the id of the div to increase percentage of as automove progresses</li>
<li><strong>autoMoveSpeed</strong> - default 4000, how fast to do auto move of gallery</li>
<li><strong>swapWidth</strong> - default 550 for the width of screen before responsive swapping</li>
<li><strong>swapHeight</strong> - default 500 for the height of the screen before responsive swapping</li>
</ul>

Example with argument change
================================

```html
<div id="gallery-wrapper">
  <ul id="gallery">
    <li><img src="some/img" /></li>
    <li><img src="some/img" /></li>
    <li><img src="some/img" /></li>
  </ul>
  <a href="#" title="Next" id="next-button-new">Next</a>
  <a href="#" title="Previous" id="previous-button-new">Previous</a>
</div>
```

```javascript
<script type="text/javascript">
  $('#gallery').garethGallery({ 'leftButton' : 'previous-button-new',
                                'rightButton' : 'next-button-new',
                                'speed' : 2000,
                                'touch' : false });
</script>
```

Even more examples
================================
More examples of the gallery can be found here http://garethfuller.com/test/gallery

Problems?
================================

get in touch @ gareth-fuller@hotmail.co.uk

Enjoy!