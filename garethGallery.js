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
            thumbLeft   : 'thumbnail-left',
            thumbRight  : 'thumbnail-right',
            paneWidth   : 0,
            amountItems : 0,
            fade        : false
        };

    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;
        
        this.options = $.extend( {}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        
        // on resize reset the gallery
        $(window).bind('resize', {instance:this}, function(event){

            // Adjust image widths (for first load)
            $(event.data.instance.element).find('img').css('width', $(event.data.instance.element).parent().width());

            // change the pane width
            event.data.instance.options.paneWidth = $(event.data.instance.element).parent().width();

            if (event.data.instance.options.autoMove){
                clearInterval(galleryTimeout); 
            }
            if (event.data.instance.options.fade){
                this.fadeItem(1);
            }else{
                $(event.data.instance.element).css('left', 0);
            }
            event.data.instance.options.currentIndex = 1;
        });

         // Run that bad boy
        this.init();

    }

    Plugin.prototype.init = function () {
        
        if (this.options.autoMove){
            var instance = this;
            galleryTimeout = setInterval(function(){instance.move();}, 4000);
        }

        // Adjust image widths (for first load)
        $(this.element).find('img').css('width', $(this.element).parent().width());

        // change the pane width
        this.options.paneWidth = $(this.element).parent().width();
        
        // set the amount of items
        this.options.amountItems = $(this.element).children().length;

        // Add click events for the next and previous buttons
        $('#'+this.options.leftButton).bind('click', {instance: this}, function(event){
            if (event.data.instance.options.autoMove){
                clearInterval(galleryTimeout); 
            }
            event.data.instance.move('left');
            return false;

        });
        $('#'+this.options.rightButton).bind('click', {instance: this}, function(event){
            if (event.data.instance.options.autoMove){
                clearInterval(galleryTimeout); 
            }
            event.data.instance.move('right');
            return false;
        });

        if(this.options.fade){
            // hide all items appart from active (for start)
            $(this.element).find('li:not(.active)').fadeOut('fast');

        }
            
        if (this.options.thumbnails){
            
            // Thumbnail clicking
            $('#'+this.options.thumbnails).find('a').bind('click', {instance: this}, function(event){

                clearInterval(galleryTimeout); 

                var currentActive = $(this).parent().parent().find('.active');
                
                var diff =  Math.abs($(this).parent().index() - $(currentActive).index());

                if (diff != 0){

                    if( $(this).parent().index() > $(currentActive).index()){
                        event.data.instance.move('right', diff);
                    }else{
                        event.data.instance.move('left', diff);
                    }

                }
                return false;
            });
            
            // Thumbnail next and previous button clicking
            $('#'+this.options.thumbLeft).bind('click', {instance: this}, function(event){
                if (event.data.instance.options.autoMove){
                    clearInterval(galleryTimeout); 
                }
                event.data.instance.moveThumbs('left');
                return false;

            });
            $('#'+this.options.thumbRight).bind('click', {instance: this}, function(event){
                if (event.data.instance.options.autoMove){
                    clearInterval(galleryTimeout); 
                }
                event.data.instance.moveThumbs('right');
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

            $(this.element).bind('touchstart', {instance: this}, function(event){
                var e = getTouchEvent(event)

                startTouchTime = new Date();

                startPosition = e.pageX;

                touchLeft = parseInt($(event.data.instance.element).css('left').replace('px', ''));

                if ( $(event.data.instance.element).is(':animated') ) {
                    $(event.data.instance.element).stop(true);
                }

                return false; 
            });

            $(this.element).bind('touchmove', {instance: this}, function(event){
                var e = getTouchEvent(event);

                movePosition = e.pageX;
                // Move with da finga
                $(event.data.instance.element).css('left', (touchLeft - (startPosition - movePosition) ) + 'px' );

                return false; 
            });

            $(this.element).bind('touchend', {instance: this}, function(event){
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
                if ( (Math.abs(startPosition - endPosition) > ( event.data.instance.options.paneWidth / 3 ) ) || fastSwipe){
                    if (endPosition > startPosition){
                        event.data.instance.move('left', 1, true);
                    }else{
                        event.data.instance.move('right', 1, true);
                    }
                    if (event.data.instance.options.autoMove){
                        clearInterval(galleryTimeout); 
                    }
                    endPosition = 0;
                    startPosition = 0;
                }else{
                    touchPaneReset(event.data.instance);
                }
                return false; 
            });

        }

    };

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, 
                new Plugin( this, options ));
            }
        });
    }
    
    // The move thumbs function (move the thumbnail navigation left / right)
    Plugin.prototype.moveThumbs = function(direction, touch){
        
        if(typeof(direction)==='undefined') direction = 'right';
        if(typeof(touch)==='undefined') touch = false;
        
        // Get width of the thumb including margin (true)
        var totalThumbs = $('#'+this.options.thumbnails).children().length;
        var thumbWidth = $('#'+this.options.thumbnails).children(0).outerWidth(true);
        var amountPerPane = Math.floor(this.options.paneWidth / thumbWidth);
        
        // How many 'large' panes do we now have
        var amountLargePanes = Math.ceil(totalThumbs / amountPerPane);
        var currentLeft = parseInt($('#'+this.options.thumbnails).css('left'));
        
        
        var currentPane = Math.abs(currentLeft / (thumbWidth * amountPerPane)) + 1;
        
        if(direction == 'right'){
            
            // check if we can move
            if ( currentPane < amountLargePanes){
                $('#'+this.options.thumbnails).stop().animate(
                    {left: currentLeft - ( thumbWidth * amountPerPane)},
                    {queue:false, duration:300}
                )
            }else{
                $('#'+this.options.thumbnails).stop().animate(
                    {left: 0},
                    {queue:false, duration:300}
                )
            }
        }
        
        if(direction == 'left'){
            
            // check if we can move
            if ( currentLeft != 0){
                $('#'+this.options.thumbnails).animate(
                    {left: currentLeft + ( thumbWidth * amountPerPane)},
                    {queue:false, duration:300}
                )
            }else{
                $('#'+this.options.thumbnails).animate(
                    {left: ((thumbWidth * amountPerPane) * (amountLargePanes - 1)) * -1},
                    {queue:false, duration:300}
                )
            }
            
        }
        
        
    }
    
    
    // The actual move function
    Plugin.prototype.move = function(direction, multiplier, touch){
        
        if(typeof(direction)==='undefined') direction = 'right';
        if(typeof(multiplier)==='undefined') multiplier = 1;
        if(typeof(touch)==='undefined') touch = false;

        var currentLeft = (this.options.paneWidth * (this.options.currentIndex - 1)) * -1;

        // Handle right click
        if (direction == 'right'){

            // can we move right?
            if( this.options.currentIndex < this.options.amountItems){

                if (this.options.fade){

                    this.fadeItem(this.options.currentIndex + (1 * multiplier));
                }else{
                    $(this.element).animate({
                        left: currentLeft - ( this.options.paneWidth * multiplier) 
                    }, this.options.speed, function() {

                        //$(settings.wrapper).find('li:first').before($(settings.wrapper).find('li:last'));
                        //$(settings.wrapper).css('left', parseInt($(settings.wrapper).css('left').replace('px', '')) - settings.paneWidth);

                    });
                }
                this.options.currentIndex = this.options.currentIndex + (1 * multiplier);

            }else{
                // cant move right so reset the gallery at the start
                if (!touch){
                    if(this.options.fade){
                        this.fadeItem(1);
                    }else{
                        $(this.element).animate({
                            left: 0
                        }, this.options.speed, function() {
                        });
                    }

                    this.options.currentIndex = 1;
                }else{
                    touchPaneReset(this);
                }
            }
        }

        // Handle left move
        if (direction == 'left'){

            // can we move left?
            if( this.options.currentIndex != 1){

                if (this.options.fade){

                    this.fadeItem(this.options.currentIndex - (1 * multiplier));

                }else{
                    $(this.element).animate({
                        left: currentLeft + (this.options.paneWidth * multiplier)
                    }, this.options.speed, function() {
                    }); 
                }
                this.options.currentIndex = this.options.currentIndex - (1 * multiplier)
            }else{

                if(!touch){
                    if(this.options.fade){
                        this.fadeItem(this.options.amountItems);
                    }else{
                        $(this.element).animate({
                            left: ( (this.options.amountItems -1) * this.options.paneWidth) - (( (this.options.amountItems - 1) * this.options.paneWidth) * 2)
                        }, this.options.speed, function() {
                        });
                    }
                    this.options.currentIndex = this.options.amountItems;
                }else{
                    touchPaneReset(this);
                }
            }
        }

        // move active class on thumbs
        if (this.options.thumbnails){
            var currentActiveThumb = $('#'+this.options.thumbnails).find('.active');
            $(currentActiveThumb).removeClass('active');
            $('#'+this.options.thumbnails).find('li').eq((this.options.currentIndex - 1)).addClass('active');
        }
    } // End of the move function
    
    
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
    Plugin.prototype.fadeItem = function(fadeToIndex){
        var currentActive = $(this.element).find('li.active');
        $(currentActive).fadeOut('slow');
        $(currentActive).removeClass('active');
        var nextActive = $(this.element).find('li').eq((fadeToIndex - 1));
        nextActive.addClass('active');
        nextActive.fadeIn('slow');
    }


    function touchPaneReset(instance){
        // tween pane back to where it was before the finger move!
        $(instance.element).animate({
            left: (instance.options.paneWidth * (instance.options.currentIndex - 1)) * -1 
        }, 300);

    }


})( jQuery, window, document );

