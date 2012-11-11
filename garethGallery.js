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
            thumbnails  : false,
            thumbLeft   : 'thumbnail-left',
            thumbRight  : 'thumbnail-right',
            fade        : false,
            swapImages  : false
        };

    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;
        
        this.options = $.extend( {}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        
        // define the global vars used by the plugin
        this.currentIndex = 1;
        this.thumbIndex = 1;
        this.paneWidth = 0;
        this.amountItems = 0;
        
        // some vars for the thumbnail functionality
        this.thumbWidth = 0;
        this.thumbsPerPane = 0;
        this.amountThumbPanes = 0;
        this.totalThumbs = 0;
        
        // var for swapping images
        this.imagesSwapped = false;
        
        // used to pass instance to timers :(
        var instance = this;
            
        // Only run thumbs calculation after load (widths will not be avluated yet you see ;) )
        $(window).bind('load', {instance:this}, function(event){
            // calculate the thumbnail values if we are using thumbs
            if(event.data.instance.options.thumbnails){
                event.data.instance.totalThumbs = $('#'+event.data.instance.options.thumbnails).children().length;
                event.data.instance.thumbWidth = $('#'+event.data.instance.options.thumbnails).children(0).outerWidth(true);
                event.data.instance.thumbsPerPane = Math.floor($('#'+event.data.instance.options.thumbnails).parent().width() / event.data.instance.thumbWidth);
                // How many 'large' panes do we now have
                event.data.instance.amountThumbPanes = Math.ceil(event.data.instance.totalThumbs / event.data.instance.thumbsPerPane);
            }
            
            //check to swap the images
            if(event.data.instance.swapImages){
                if (($(this).height() > 550) && ($(this).width() > 550)){
                    // swap images set flag
                    event.data.instance.swapImages();
                }
            }
            
        });
        
        if (this.options.autoMove){
            this.galleryTimeout = setInterval(function(){instance.move();}, 4000);
        }
        
        var resizeDone = 0;
        
        // on resize reset the gallery
        $(window).bind('resize', {instance:this}, function(event){

            // Adjust image widths (for first load)
            $(event.data.instance.element).find('img').css('width', $(event.data.instance.element).parent().width());

            // change the pane width
            event.data.instance.paneWidth = $(event.data.instance.element).parent().width();
            
            // clear the timer
            if (event.data.instance.options.autoMove){
                clearInterval(event.data.instance.galleryTimeout); 
            }
            // reset the main gallery (and curent index)
            if (event.data.instance.options.fade){
                // have to try to do the fade-reset after a certain amount of time
                clearTimeout(resizeDone);
                resizeDone = setTimeout(function(){instance.fadeItem();}, 1500);
            }else{
                $(event.data.instance.element).css('left', 0);
            }
            event.data.instance.currentIndex = 1;
            
            // reset thumbnails
            if (event.data.instance.options.thumbnails){
                
                event.data.instance.thumbIndex = 1;
                $('#'+event.data.instance.options.thumbnails).css('left', 0);
                
                // reset the active state
                $('#'+event.data.instance.options.thumbnails).find('.active').removeClass('active');
                $('#'+event.data.instance.options.thumbnails).find('li').eq(0).addClass('active');
                
                // re-calculate the thumbnail params!
                event.data.instance.thumbWidth = $('#'+event.data.instance.options.thumbnails).children(0).outerWidth(true);
                event.data.instance.thumbsPerPane = Math.floor($('#'+event.data.instance.options.thumbnails).parent().width() / event.data.instance.thumbWidth);
                // How many 'large' panes do we now have
                event.data.instance.amountThumbPanes = Math.ceil(event.data.instance.totalThumbs / event.data.instance.thumbsPerPane);
                
            }
            
            // Image swapping
            if(event.data.instance.swapImages){
                if (!event.data.instance.imagesSwapped){
                    if (($(this).height() > 550) && ($(this).width() > 550)){
                        // swap images set flag
                        event.data.instance.swapImages();
                    }
                }
            }
            
        });

         // Run that bad boy
        this.init();

    }

    Plugin.prototype.init = function () {
        
        // Adjust image widths (for first load)
        $(this.element).find('img').css('width', $(this.element).parent().width());

        // change the pane width
        this.paneWidth = $(this.element).parent().width();
        
        // set the amount of items
        this.amountItems = $(this.element).children().length;

        // Add click events for the next and previous buttons
        $('#'+this.options.leftButton).bind('click', {instance: this}, function(event){
            if (event.data.instance.options.autoMove){
                clearInterval(event.data.instance.galleryTimeout); 
            }
            event.data.instance.move('left');
            return false;

        });
        $('#'+this.options.rightButton).bind('click', {instance: this}, function(event){
            if (event.data.instance.options.autoMove){
                clearInterval(event.data.instance.galleryTimeout); 
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

                window.clearInterval(event.data.instance.galleryTimeout); 

                var currentActive = $(this).parent().parent().find('.active');
                
                var diff =  Math.abs($(this).parent().index() - $(currentActive).index());

                if (diff != 0){

                    if( $(this).parent().index() > $(currentActive).index()){
                        event.data.instance.move('right', diff, false, true);
                    }else{
                        event.data.instance.move('left', diff, false, true);
                    }

                }
                return false;
            });
            
            // Thumbnail next and previous button clicking
            $('#'+this.options.thumbLeft).bind('click', {instance: this}, function(event){
                if (event.data.instance.options.autoMove){
                    clearInterval(event.data.instance.galleryTimeout); 
                }
                event.data.instance.moveThumbs('left');
                return false;

            });
            $('#'+this.options.thumbRight).bind('click', {instance: this}, function(event){
                if (event.data.instance.options.autoMove){
                    clearInterval(event.data.instance.galleryTimeout); 
                }
                event.data.instance.moveThumbs('right');
                return false;
            });

        }
            
            
        // Touch events (if enabled)
        if (this.options.touch){
            
            this.addTouchSupport(this.element, false);
            
            // touch support or the thumbnails
            if (this.options.thumbnails){
                this.addTouchSupport('#'+this.options.thumbnails, true);
            }
        }

    };
    
    Plugin.prototype.swapImages = function(){
        // swap gallery images
        $(this.element).find('img').each(function() {
            $(this).attr('src', $(this).attr('data-high-res'));
        });
        this.imagesSwapped = true;
    }
    
    // function for touch support (this is for both the main gallery and possibly thumnail pannels)
    Plugin.prototype.addTouchSupport = function(element, thumbs){
        
        if(typeof(thumbs)==='undefined') thumbs = false;
        
        var startPosition = 0;
        var endPosition = 0;
        var touchLeft = 0;

        // timer to work out how long the touch event occurred 
        var startTouchTime = null;
        var touchCompletionTime = null;

        // touch start for the main gallery
        $(element).bind('touchstart', function(event){
            var e = getTouchEvent(event)
            startTouchTime = new Date();
            startPosition = e.pageX;
            touchLeft = parseInt($(element).css('left').replace('px', ''));
            if ( $(element).is(':animated') ) {
                $(element).stop(true);
            }
            
            // cannot prvent default on thumbs, this stops click event!
            if (!thumbs){
                return false; 
            }
            
        });

        // move for the gallery (but for fade gallery dont move main gallery with finger)
        if(thumbs || !this.options.fade){
            $(element).bind('touchmove', function(event){
                var e = getTouchEvent(event);
                var movePosition = e.pageX;
                // Move with da finga
                $(element).css('left', (touchLeft - (startPosition - movePosition) ) + 'px' );
               
                // cannot prvent default on thumbs, this stops click event!
                if (!thumbs){
                    return false; 
                }
            });
        }

        // touch end for the gallery
        $(element).bind('touchend', {instance:this}, function(event){
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
            
            // default touch desision making (for one big pannel)
            if (!thumbs){
                // work out if move grater than threshold, and in which direction
                if ( (Math.abs(startPosition - endPosition) > ( event.data.instance.paneWidth / 3 ) ) || fastSwipe){
                    if (endPosition > startPosition){
                        event.data.instance.move('left', 1, true);
                    }else{
                        event.data.instance.move('right', 1, true);
                    }
                    if (event.data.instance.options.autoMove){
                        clearInterval(event.data.instance.galleryTimeout); 
                    }
                    endPosition = 0;
                    startPosition = 0;
                }else{
                    touchPaneReset(event.data.instance);
                }
            }else{
                // thumbs is different as there are many items wraped in 'large' pannels
                if ( (Math.abs(startPosition - endPosition) > ( (event.data.instance.thumbWidth * event.data.instance.thumbsPerPane) / 3) ) || fastSwipe ){
                    if (endPosition > startPosition){
                        event.data.instance.moveThumbs('left', true);
                    }else{
                        event.data.instance.moveThumbs('right', true);
                    }
                    if (event.data.instance.options.autoMove){
                        clearInterval(event.data.instance.galleryTimeout); 
                    }
                    endPosition = 0;
                    startPosition = 0;
                }else{
                    touchPaneReset(event.data.instance, true);
                }
                
            }
            // cannot prvent default on thumbs, this stops click event!
            if (!thumbs){
                return false; 
            }
        });
    }

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
        
        // Get current left
        var currentLeft = ( ( this.thumbWidth * this.thumbsPerPane) * (this.thumbIndex - 1)) * -1;
        
        if(direction == 'right'){
            
            // check if we can move
            if ( this.thumbIndex < this.amountThumbPanes){
                $('#'+this.options.thumbnails).animate({
                    left: currentLeft - ( this.thumbWidth * this.thumbsPerPane)
                }, this.options.speed, function() {
                });
                this.thumbIndex ++;
            }else{
                if (!touch){
                    $('#'+this.options.thumbnails).animate({
                        left: 0
                    }, this.options.speed, function(){ 
                    });
                    this.thumbIndex = 1;
                }else{
                    touchPaneReset(this, true);
                }
            }
        }
        
        if(direction == 'left'){
            
            // check if we can move
            if ( this.thumbIndex != 1){
                $('#'+this.options.thumbnails).animate({
                   left: currentLeft + ( this.thumbWidth * this.thumbsPerPane)
                }, this.options.speed, function() {
                });     
                this.thumbIndex --;
            }else{
                if (!touch){
                    $('#'+this.options.thumbnails).animate({
                    left: ((this.thumbWidth * this.thumbsPerPane) * (this.amountThumbPanes - 1)) * -1
                    }, this.options.speed, function() {
                    });    
                    this.thumbIndex = this.amountThumbPanes;
               }else{
                   touchPaneReset(this, true);
               }
            }
        }
    }
    
    
    // The actual move function
    Plugin.prototype.move = function(direction, multiplier, touch, thumbClick){
        
        if(typeof(direction)==='undefined') direction = 'right';
        if(typeof(multiplier)==='undefined') multiplier = 1;
        if(typeof(touch)==='undefined') touch = false;
        if(typeof(thumbClick)==='undefined') thumbClick = false;
        
        var currentLeft = (this.paneWidth * (this.currentIndex - 1)) * -1;
        // boolean this as index changes and becomes a pain (sort later)
        var cantMoveRight = false;
        var cantMoveLeft = false;

        // Handle right click
        if (direction == 'right'){

            // can we move right?
            if( this.currentIndex < this.amountItems){

                if (this.options.fade){

                    this.fadeItem(this.currentIndex + (1 * multiplier));
                }else{
                    $(this.element).animate({
                        left: currentLeft - ( this.paneWidth * multiplier) 
                    }, this.options.speed, function() {
                    });
                }
                this.currentIndex = this.currentIndex + (1 * multiplier);

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
                    cantMoveRight = true;
                    this.currentIndex = 1;
                }else{
                    touchPaneReset(this);
                }
            }
        }

        // Handle left move
        if (direction == 'left'){

            // can we move left?
            if( this.currentIndex != 1){

                if (this.options.fade){

                    this.fadeItem(this.currentIndex - (1 * multiplier));

                }else{
                    $(this.element).animate({
                        left: currentLeft + (this.paneWidth * multiplier)
                    }, this.options.speed, function() {
                    }); 
                }
                this.currentIndex = this.currentIndex - (1 * multiplier)
            }else{
                
                if(!touch){
                    if(this.options.fade){
                        this.fadeItem(this.amountItems);
                    }else{
                        $(this.element).animate({
                            left: ( (this.amountItems -1) * this.paneWidth) - (( (this.amountItems - 1) * this.paneWidth) * 2)
                        }, this.options.speed, function() {
                        });
                    }
                    cantMoveLeft = true;
                    this.currentIndex = this.amountItems;
                }else{
                    touchPaneReset(this);
                }
            }
        }

        // move active class on thumbs
        if (this.options.thumbnails){
            
            var currentActiveThumb = $('#'+this.options.thumbnails).find('.active');
            $(currentActiveThumb).removeClass('active');
            $('#'+this.options.thumbnails).find('li').eq((this.currentIndex - 1)).addClass('active');
            
            //thumbnails get clicked on touch move, this messes with the automove functionality for the thumbs
            if (!thumbClick){
            
                if (cantMoveRight || cantMoveLeft){
                    if (cantMoveRight){this.moveThumbs('right');}
                    if (cantMoveLeft){this.moveThumbs('left');}
                }else{
                    // if the current active thumb is in the active pannel check (auto move the thumbs if not)
                    var newPaneNumber = Math.ceil(this.currentIndex / this.thumbsPerPane);
                    if (newPaneNumber != this.thumbIndex){
                        if (newPaneNumber > this.thumbIndex){
                            this.moveThumbs('right');
                        }else{
                            this.moveThumbs('left');
                        }
                    }
                }
            }
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
        if(typeof(fadeToIndex)==='undefined') fadeToIndex = 1;
        var currentActive = $(this.element).find('li.active');
        $(currentActive).fadeOut(this.options.speed);
        $(currentActive).removeClass('active');
        var nextActive = $(this.element).find('li').eq((fadeToIndex - 1));
        nextActive.addClass('active');
        nextActive.fadeIn(this.options.speed);
    }


    function touchPaneReset(instance, thumbs){
        if(typeof(thumbs)==='undefined') thumbs = false;
        if (!thumbs){
            if (!instance.options.fade){
                // tween pane back to where it was before the finger move!
                $(instance.element).animate({
                    left: (instance.paneWidth * (instance.currentIndex - 1)) * -1 
                }, 300);
            }
        }else{
            //double check 
            if (instance.options.thumbnails){
                $('#'+instance.options.thumbnails).animate({
                    left: ((instance.thumbWidth * instance.thumbsPerPane) * (instance.thumbIndex - 1)) * -1
                }, 300);
                
            } //end if options set
        }// end if flag passed
        

    }


})( jQuery, window, document );

