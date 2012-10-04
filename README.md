Jquery Gallery with touch support
=================================

Simple JQuery gallery plugin. uses pane width to detect slide position so can use on gallery that has percent width.

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
<li><strong>touch</strong>       - boolean (left and right touch support), default true</li>
<li><strong>speed</strong>       - transition speed, default 1000ms</li>
<li><strong>wrapper</strong>     - should not need to overide, defaults to the element that called it in the above example #gallery</li>
<li><strong>leftButton</strong>  - string id of the left / previous button, default previous-button</li>
<li><strong>rightButton</strong> - string id of the right / next button, default next-button</li>
<li><strong>autoMove</strong>    - boolean (auto move gallery, stops when user takes controll), default true</li>
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

Problems?
================================

get in touch @ gareth-fuller@hotmail.co.uk

Enjoy!