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
                'currentIndex': 1 
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
            
            // Touch events (if enabled)
            if (settings['touch']){
                
                var startPosition = 0;
                var endPosition = 0;
                
                $(settings['wrapper']).bind('touchstart', function(e){
                    //work out what e is :S
                    if(e.originalEvent.touches && e.originalEvent.touches.length) {
                        e = e.originalEvent.touches[0];
                    } else if(e.originalEvent.changedTouches && e.originalEvent.changedTouches.length) {
                        e = e.originalEvent.changedTouches[0];
                    }
                    
                    startPosition = e.pageX;
                    return false; 
                });
                
                $(settings['wrapper']).bind('touchend', function(e){
                    if(e.originalEvent.touches && e.originalEvent.touches.length) {
                        e = e.originalEvent.touches[0];
                    } else if(e.originalEvent.changedTouches && e.originalEvent.changedTouches.length) {
                        e = e.originalEvent.changedTouches[0];
                    }
                    
                    endPosition = e.pageX;

                    // work out if move grater than threshold, and in which direction
                    if ( Math.abs(startPosition - endPosition) > 50){
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
                    }
                    return false; 
                });
                
            }
            
            // The actual move function
            function move(direction){
               
                // get the width of each element in the inner container
                var paneWidth = parseInt($(settings['wrapper']).children(1).css('width').replace('px', ''));
                var amountItems = $(settings['wrapper']).children().length;
                
                // Handle right click
                if (direction == 'right'){

                    // can we move right?
                    if( settings['currentIndex'] < amountItems){
                        $(settings['wrapper']).animate({
                            left: (settings['currentIndex'] * paneWidth) - ((settings['currentIndex'] * paneWidth) * 2)
                        }, settings['speed'], function() {
                        });
                        settings['currentIndex'] ++;
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
                            left: ( (settings['currentIndex'] - 2) * paneWidth) - ( ((settings['currentIndex'] - 2) * paneWidth) * 2)
                        }, settings['speed'], function() {
                        }); 
                        
                        settings['currentIndex'] --;
                    }else{
                        $(settings['wrapper']).animate({
                            left: ( (amountItems -1) * paneWidth) - (( (amountItems - 1) * paneWidth) * 2)
                        }, settings['speed'], function() {
                        }); 
                        
                        settings['currentIndex'] = amountItems;
                    }
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


