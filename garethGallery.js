/* 
 * Simple plugin that will create a gallery
 * 
 * @author Gareth Fuller
 * 
 */

(function( $ ) {
    
    // Define the plugin methods
    var methods = {
        
        init : function( options ) { 
            
            // Construct some default settings for the plugin
            settings = $.extend( {
                'wrapper'     : this,
                'leftButton'  : 'previous-button',
                'rightButton' : 'next-button',
                'speed'       : 1000,
                'autoMove'    : true,
                'touch'       : true,
                'currentIndex': 1,
                'thumbnails'  : false,
                'paneWidth'   : parseInt(this.children(1).css('width').replace('px', '')),
                'amountItems' : this.children().length
            }, options);
            
            if (settings['autoMove']){
                galleryTimeout = setInterval(function(){move('right');}, 5000);
            }
            
            // Add click events for the next and previous buttons
            $('#'+settings['leftButton']).click(function(){
                if (settings['autoMove']){
                   clearInterval(galleryTimeout); 
                }
                move('left');
                return false;
                
            });
            $('#'+settings['rightButton']).click(function(){
                if (settings['autoMove']){
                   clearInterval(galleryTimeout); 
                }
                move('right');
                return false;
            });
            
            
            // Thumbnail clicking
            if (settings['thumbnails']){
                $('#'+settings['thumbnails']+ ' a').click(function(){
                    
                    var currentActive = $('#'+settings['thumbnails']).find('.active');
                    
                    var diff =  Math.abs($(this).parent().index() - $(currentActive).index());
                    
                    if (diff != 0){
                        
                        clearInterval(galleryTimeout); 

                        if( $(this).parent().index() > $(currentActive).index()){
                            move('right', diff);
                        }else{
                            move('left', diff);
                        }
                        
                    }
                    
                    return false;
                    
                });
                
            }
            
            
            // Touch events (if enabled)
            if (settings['touch']){
                
                var startPosition = 0;
                var endPosition = 0;
                var currentLeft = 0;
                
                // timer to work out how long the touch event occurred 
                var startTouchTime = null;
                var touchCompletionTime = null
                
                $(settings['wrapper']).bind('touchstart', function(e){
                    //work out what e is :S
                    if(e.originalEvent.touches && e.originalEvent.touches.length) {
                        e = e.originalEvent.touches[0];
                    } else if(e.originalEvent.changedTouches && e.originalEvent.changedTouches.length) {
                        e = e.originalEvent.changedTouches[0];
                    }
                    
                    startTouchTime = new Date();
                    
                    startPosition = e.pageX;
                    
                    // work out current left of the slides
                    currentLeft = (settings['paneWidth'] * (settings['currentIndex'] - 1)) * -1;
                    
                    /*if ( $(settings['wrapper']).is(':animated') ) {
                        $(settings['wrapper']).stop();
                    };*/
 
                    return false; 
                });
                
                $(settings['wrapper']).bind('touchmove', function(e){
                    if(e.originalEvent.touches && e.originalEvent.touches.length) {
                        e = e.originalEvent.touches[0];
                    } else if(e.originalEvent.changedTouches && e.originalEvent.changedTouches.length) {
                        e = e.originalEvent.changedTouches[0];
                    }
                    
                    movePosition = e.pageX;
                    
                    // Move with da finga
                    $(settings['wrapper']).css('left', (currentLeft - (startPosition - movePosition) ) + 'px' );
                    
                    return false; 
                });

                $(settings['wrapper']).bind('touchend', function(e){
                    if(e.originalEvent.touches && e.originalEvent.touches.length) {
                        e = e.originalEvent.touches[0];
                    } else if(e.originalEvent.changedTouches && e.originalEvent.changedTouches.length) {
                        e = e.originalEvent.changedTouches[0];
                    }
                    
                    endPosition = e.pageX;
                    
                    touchCompletionTime = new Date() - startTouchTime;
                    var fastSwipe = false;
                    
                    // if swipe in less than 400 ms
                    if (touchCompletionTime < 400){
                        fastSwipe = true;
                       
                    }
                    
                   
                    // work out if move grater than threshold, and in which direction
                    if ( (Math.abs(startPosition - endPosition) > ( settings['paneWidth'] / 3 ) ) || fastSwipe){
                        if (endPosition > startPosition){
                            move('left');
                        }else{
                            move('right');
                        }
                        if (settings['autoMove']){
                            clearInterval(galleryTimeout); 
                        }
                        endPosition = 0;
                        startPosition = 0;
                    }else{
                        // tween pane back to where it was before the finger move!
                        $(settings['wrapper']).animate({
                           left: currentLeft 
                        },
                        {
                            duration: '300',
                            easing: 'swing',
                            complete: function() {
                            }
                        });
                    }
                    return false; 
                });
                
            }
            
            // The actual move function
            function move(direction, multiplier){

                if (!multiplier){
                    var multiplier = 1; 
                }
                
                var currentLeft = (settings['paneWidth'] * (settings['currentIndex'] - 1)) * -1;
                
                // Handle right click
                if (direction == 'right'){
                    
                    // can we move right?
                    if( settings['currentIndex'] < settings['amountItems']){
                        
                        $(settings['wrapper']).animate({
                           left: currentLeft - ( settings['paneWidth'] * multiplier) 
                        }, settings['speed'], function() {
                        });
                        settings['currentIndex'] =  settings['currentIndex'] + (1 * multiplier);
                    }else{
                        // cant move right so reset the gallery at the start
                        $(settings['wrapper']).animate({
                            left: 0
                        }, settings['speed'], function() {
                        });
                        settings['currentIndex'] = 1;
                    }
                }

                // Handle left move
                if (direction == 'left'){
                    
                    // can we move left?
                    if( settings['currentIndex'] != 1){
                         
                        $(settings['wrapper']).animate({
                            left: currentLeft + (settings['paneWidth'] * multiplier)
                        }, settings['speed'], function() {
                            
                        }); 
                        
                        settings['currentIndex'] =  settings['currentIndex'] - (1 * multiplier);
                       
                    }else{
                        $(settings['wrapper']).animate({
                            left: ( (settings['amountItems'] -1) * settings['paneWidth']) - (( (settings['amountItems'] - 1) * settings['paneWidth']) * 2)
                        }, settings['speed'], function() {
                        });
                        
                        settings['currentIndex'] = settings['amountItems'];
                    }
                }
                
                // move active class on thumbs
                if (settings['thumbnails']){
                    var currentActiveThumb = $('#'+settings['thumbnails']).find('.active');
                    $(currentActiveThumb).removeClass('active');
                    $('#'+settings['thumbnails']).find('li').eq((settings['currentIndex'] - 1)).addClass('active');
                }
            }
            
            // on resize reset the gallery
            $(window).resize(function() {
                
                if (settings['autoMove']){
                   clearInterval(galleryTimeout); 
                }
                $(settings['wrapper']).css('left', 0);
                settings['currentIndex'] = 1;
            });

            return this;
        }
    };
    
    $.fn.garethGallery = function( method ) {
        
        // define the global settings variable
        var settings = '';
        
        // global var for gallery timout
        var galleryTimeout;
        
        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.garethGallery' );
        }    

    };
    
    
})( jQuery );
