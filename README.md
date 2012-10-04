Jquery-Gallery-with-touch-support
=================================

Simple JQuery gallery plugin. uses pane width to detect slide position so can use on gallery that has percent width.

Example usage
=================================

`````````html
<div id="gallery-wrapper">
   <ul id="gallery">
       <li><img src="some/img" /></li>
       <li><img src="some/img" /></li>      
       <li><img src="some/img" /></li>
   </ul>
   <a href="#" title="Next" id="next-button">Next</a>
   <a href="#" title="Previous" id="previous-button">Previous</a>
</div>`````````
    
`<script type="text/javascript">`
`   $('#gallery').garethGallery();`
`</script>`


Arguments
==================================
touch       - boolean (left and right touch support), default true
speed       - transition speed, default 1000ms
wrapper     - should not need to overide, defaults to the element that called it in the above example #gallery
leftButton  - string id of the left / previous button, default previous-button
rightButton - string id of the right / next button, default next-button
autoMove    - boolean (auto move gallery, stops when user takes controll), default true

Example with argument change
================================

`<div id="gallery-wrapper">
  <ul id="gallery">
    <li><img src="some/img" /></li>
    <li><img src="some/img" /></li>
    <li><img src="some/img" /></li>
  </ul>
  <a href="#" title="Next" id="next-button-new">Next</a>
  <a href="#" title="Previous" id="previous-button-new">Previous</a>
</div>`

`<script type="text/javascript">
  $('#gallery').garethGallery({ 'leftButton' : 'previous-button-new',
                                'rightButton' : 'next-button-new',
                                'speed' : 2000
                                'touch' : false });
</script>`

Problems?
================================

get in touch @ gareth-fuller@hotmail.co.uk

Enjoy!