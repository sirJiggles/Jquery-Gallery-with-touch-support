/* 
 * Simple plugin that will create a gallery
 * 
 * @author Gareth Fuller
 * 
 */

(function ( $, window, document, undefined ) {
    

    // Create the defaults once
    var pluginName = 'garethGallery',
        defaults = {
            leftButton  : 'previous-button',
            rightButton : 'next-button',
            speed       : 500,
            autoMove    : true,
            touch       : true,
            currentIndex: 1,
            thumbnails  : false,
            paneWidth   : 0,
            amountItems : $(this).children().length,
            fade        : false
        };

    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;

        this.options = $.extend( {}, defaults, options) ;
        
        this._defaults = defaults;
        this._name = pluginName;
        
        this.init();
    }

    Plugin.prototype.init = function () {
        
        if (this.options.autoMove){
            galleryTimeout = setInterval(function(){move('right');}, 5000);
        }
            
        // Adjust image widths (for first load)
        $(this.element).find('img').css('width', $(this.element).parent().width());

        // change the pane width
        this.options.paneWidth = $(this.element).parent().width();

        // Add click events for the next and previous buttons
        $('#'+this.options.leftButton).bind('click', {pluginOptions: this.options}, function(event){
            if (event.data.pluginOptions.autoMove){
                clearInterval(galleryTimeout); 
            }
            move('left');
            return false;

        });
        $('#'+this.options.rightButton).bind('click', {pluginOptions: this.options}, function(event){
            if (event.data.pluginOptions.autoMove){
                clearInterval(galleryTimeout); 
            }
            move('right');
            return false;
        });

        if(this.options.fade){
            // hide all items appart from active (for start)
            $(this.element).find('li:not(.active)').fadeOut('fast');

        }
            
            
        // Thumbnail clicking
        if (this.options.thumbnails){

            $('#'+this.options.thumbnails).find('a').bind('click', {pluginOptions: this.options}, function(event){

                clearInterval(galleryTimeout); 

                var currentActive = $('#'+event.data.pluginOptions.thumbnails).find('.active');

                var diff =  Math.abs($(this).parent().index() - $(currentActive).index());

                if (diff != 0){

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
        if (this.options.touch){

            var startPosition = 0;
            var endPosition = 0;
            var touchLeft = 0;

            // timer to work out how long the touch event occurred 
            var startTouchTime = null;
            var touchCompletionTime = null

            $(this.element).bind('touchstart', {pluginObject: this}, function(event){
                var e = getTouchEvent(event)

                startTouchTime = new Date();

                startPosition = e.pageX;

                touchLeft = parseInt($(event.data.pluginObject.element).css('left').replace('px', ''));

                if ( $(event.data.pluginObject.element).is(':animated') ) {
                    $(event.data.pluginObject.element).stop(true);
                }

                return false; 
            });

            $(this.element).bind('touchmove', {pluginObject: this}, function(event){
                var e = getTouchEvent(event);

                movePosition = e.pageX;
                // Move with da finga
                $(event.data.pluginObject.element).css('left', (touchLeft - (startPosition - movePosition) ) + 'px' );

                return false; 
            });

            $(this.element).bind('touchend', {pluginOptions: this.options}, function(event){
                var e = getTouchEvent(event);

                endPosition = e.pageX;

                touchCompletionTime = new Date() - startTouchTime;
                var fastSwipe = false;

                // if swipe in less than 400 ms
                if (touchCompletionTime < 400){
                    if(Math.abs(startPosition - endPosition) > 5){
                        fastSwipe = true;
                    }

                }


                // work out if move grater than threshold, and in which direction
                if ( (Math.abs(startPosition - endPosition) > ( event.data.pluginOptions.paneWidth / 3 ) ) || fastSwipe){
                    if (endPosition > startPosition){
                        move('left', 1, true);
                    }else{
                        move('right', 1, true);
                    }
                    if (event.data.pluginOptions.autoMove){
                        clearInterval(galleryTimeout); 
                    }
                    endPosition = 0;
                    startPosition = 0;
                }else{
                    touchPaneReset();
                }
                return false; 
            });

        }

        // Function to get touch event 
        function getTouchEvent(e){
            if(e.originalEvent.touches && e.originalEvent.touches.length) {
                e = e.originalEvent.touches[0];
            } else if(e.originalEvent.changedTouches && e.originalEvent.changedTouches.length) {
                e = e.originalEvent.changedTouches[0];
            }   
            return e;

        }
            
        // Function to fade the gallery
        function fadeItem(fadeToIndex){
            var currentActive = $(this.element).find('li.active');
            $(currentActive).fadeOut('slow');
            $(currentActive).removeClass('active');
            var nextActive = $(this.element).find('li').eq((fadeToIndex - 1));
            nextActive.addClass('active');
            nextActive.fadeIn('slow');
        }

        // Function to update the current index
        function updateCurrentIndex(value){
            this.options.currentIndex =  value;
        }

        function touchPaneReset(){
            // tween pane back to where it was before the finger move!
            $(this.element).animate({
                left: (this.options.paneWidth * (this.options.currentIndex - 1)) * -1 
            }, 300);

        }

        // The actual move function
        function move(direction, multiplier, touch){

            if (!multiplier){var multiplier = 1; }
            if(!touch){var touch = false;}


            var currentLeft = (this.options.paneWidth * (this.options.currentIndex - 1)) * -1;

            // Handle right click
            if (direction == 'right'){

                // can we move right?
                if( this.options.currentIndex < this.options.amountItems){

                    if (this.options.fade){

                        fadeItem(this.options.currentIndex + (1 * multiplier));
                    }else{
                        $(this.element).animate({
                            left: currentLeft - ( this.options.paneWidth * multiplier) 
                        }, this.options.speed, function() {

                            //$(settings.wrapper).find('li:first').before($(settings.wrapper).find('li:last'));
                            //$(settings.wrapper).css('left', parseInt($(settings.wrapper).css('left').replace('px', '')) - settings.paneWidth);

                        });
                    }
                    updateCurrentIndex(this.options.currentIndex + (1 * multiplier));

                }else{
                    // cant move right so reset the gallery at the start
                    if (!touch){
                        if(this.options.fade){
                            fadeItem(1);
                        }else{
                            $(this.element).animate({
                                left: 0
                            }, this.options.speed, function() {
                            });
                        }

                        updateCurrentIndex(1);
                    }else{
                        touchPaneReset();
                    }
                }
            }

            // Handle left move
            if (direction == 'left'){

                // can we move left?
                if( this.options.currentIndex != 1){

                    if (this.options.fade){

                        fadeItem(this.options.currentIndex - (1 * multiplier));

                    }else{
                        $(this.element).animate({
                            left: currentLeft + (this.options.paneWidth * multiplier)
                        }, this.options.speed, function() {
                        }); 
                    }
                    updateCurrentIndex(this.options.currentIndex - (1 * multiplier));
                }else{

                    if(!touch){
                        if(this.options.fade){
                            fadeItem(this.options.amountItems);
                        }else{
                            $(this.element).animate({
                                left: ( (this.options.amountItems -1) * this.options.paneWidth) - (( (this.options.amountItems - 1) * this.options.paneWidth) * 2)
                            }, this.options.speed, function() {
                            });
                        }

                        updateCurrentIndex(this.options.amountItems);
                    }else{
                        touchPaneReset();
                    }
                }
            }

            // move active class on thumbs
            if (this.options.thumbnails){
                var currentActiveThumb = $(this.options.thumbnails).find('.active');
                $(currentActiveThumb).removeClass('active');
                $('#'+this.options.thumbnails).find('li').eq((this.options.currentIndex - 1)).addClass('active');
            }
        }

        // on resize reset the gallery
        $(window).resize(function() {
            
            console.log(this);
            // Adjust image widths (for first load)
            $(this.element).find('img').css('width', $(this.element).parent().width());

            // change the pane width
            this.options.paneWidth = $(this.element).parent().width();

            if (this.options.autoMove){
                clearInterval(galleryTimeout); 
            }
            if (this.options.fade){
                fadeItem(1);
            }else{
                $(this.element).css('left', 0);
            }
            updateCurrentIndex(1);
        });

        
    };


    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, 
                new Plugin( this, options ));
            }
        });
    }

})( jQuery, window, document );

