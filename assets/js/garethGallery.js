/* 
 * Simple plugin that will create a gallery
 * 
 * requires 
 * jquery
 * 
 * @author Gareth Fuller
 * 
 */

'use strict';

/* 
 * Settup al the global options etc
 */
var GarethGallery = function(options){
    
    // Define the defaults
    var  defaults = {
        leftButton  : 'previous-button',
        rightButton : 'next-button',
        speed       : 500,
        autoMove    : true,
        touch       : true,
        thumbnails  : false,
        thumbLeft   : 'thumbnail-left',
        thumbRight  : 'thumbnail-right',
        fade        : false,
        swapImages  : false,
        progressBar : false,
        autoMoveSpeed: 4000,
        swapWidth : 350,
        swapHeight: 350,
        element : 'gallery',
        currentPage : false,
        thumbCurrentPage: false,
        multiRowThumbs : false
    };
    
    // set the options
    this.options = $.extend( {}, defaults, options);
    
    // set the DOM element for the gallery
    this.element = '#'+options.element;
    
    this._defaults = defaults;
    this._name = 'GarethGallery';

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
    this.thumbPaneWidth = 0;
    this.thumbPaneHeight = 0;
    this.colsPerPane = 0;
    this.rowsPerPane = 0;

    // var for swapping images
    this.imagesSwapped = false;
    
    this.autoGalleryRunning = false;
    
    // Resize done var for resizing the window
    this.resizeDone = false;
    
    // debug flag
    this.debug = false;
    
    //css3 detection
    this.css3 = false;
    this.cssSpeed = (this.options.speed / 2000) + 's';
    
}

/*
 * First thing we do in this function is to just swap the images
 * because of detecting elements heights and widths may be
 * dependent on the outcome of this we call the rest of the load
 * functions after this is done
 */
GarethGallery.prototype.start = function(){
    
    var instance = this;
    
    //check to swap the images
    if(this.options.swapImages){
        if (($(this.element).outerHeight() > this.options.swapHeight) && ($(this.element).outerWidth() > this.options.swapWidth)){
            // swap images set flag
            $.when(this.swapImages()).done(function(){
                instance.continueToLoad();
            });
        }else{
            this.continueToLoad();
        }
    }else{
        this.continueToLoad();
    }
    
};

/*
 * Function to settup css trasition props on elements if supported
 */
GarethGallery.prototype.settupCss = function(element, speed){

    $(element).css({
        'transition': 'all '+speed+' linear',
        '-moz-transition': 'all '+speed+' linear',
        '-webkit-transition': 'all '+speed+' linear',
        '-o-transition': 'all '+speed+' linear'
    });
    
}

/*
 * this is where the main functions are called from
 * its kind of a main switch board for the plugin, makes things easier to
 * read
 */
GarethGallery.prototype.continueToLoad = function(){
    
    // detect ability of the plugin
    if(supports('transition')){
        this.css3 = true;
       
        this.settupCss(this.element, this.cssSpeed);
        
        // add transition props to thumbs
        if(this.options.thumbnails){
            this.settupCss('#'+this.options.thumbnails, this.cssSpeed);
        }
    }
    
    if(this.options.thumbnails){

        // set width and height of li's
        if (this.options.multiRowThumbs){
            this.configureMultiLineThumbs();
        }else{
            this.setThumbVars();
        }
    }
    
    // on resize reset the gallery
    $(window).bind('resize', {instance:this}, function(e){
        e.data.instance.resize();
    });

    // settup the automove functionality
    this.settupAutoMove();

    // Adjust image widths (for first load)
    $(this.element).children().css('width', $(this.element).parent().width());

    // change the pane width
    this.paneWidth = $(this.element).parent().width();

    // set the amount of items
    this.amountItems = $(this.element).children().length;

    // set up the click events
    this.bindClickEvents();

    if(this.options.fade){
        // set the height of the element
        $(this.element).css('height', $(this.element+' li').eq(0).outerHeight());

        // hide all items appart from active (for start)
        $(this.element).find('li:not(.active)').fadeOut('fast');
    }

    // Touch events (if enabled)
    if (this.options.touch){
        this.addTouchSupport(this.element, false);
        if(this.options.thumbnails){
            this.addTouchSupport(this.options.thumbnails, true)
        }
    }

    if (this.options.currentPage){
        $('#'+this.options.currentPage).text(this.currentIndex+' of '+this.amountItems);
    }

    if (this.options.thumbCurrentPage){
        $('#'+this.options.thumbCurrentPage).text( this.thumbIndex  +' of '+this.amountThumbPanes);
    }

};

/*
 * What to do on resize, for the most part its just swap images
 * clear images, reset the gallery to the first slide
 */
GarethGallery.prototype.resize = function(){
    
    if(this.resizeDone !== false){clearTimeout(this.resizeDone)};
    
    var instance = this;
    
    this.resizeDone = setTimeout(function(){
        
        // Adjust image widths (for first load)
        $(instance.element).children().css('width', $(instance.element).parent().width());

        // change the pane width
        instance.paneWidth = $(instance.element).parent().width();

        if (instance.autoGalleryRunning){
            instance.clearGalleryTimeout();
        }

        // reset the main gallery (and curent index)
        if (instance.options.fade){
            // have to try to do the fade-reset after a certain amount of time
            instance.fadeItem(1);

            $(instance.element).css('height', $(instance.element+' li').eq(0).outerHeight());
          
        }else{
            $(instance.element).css('left', 0);
        }
        
        instance.currentIndex = 1;

        // reset thumbnails
        if (instance.options.thumbnails){
            
            // Reset the thumbs
            instance.thumbIndex = 1;
            
            $('#'+instance.options.thumbnails).css('left', 0);

            // reset the active state
            $('#'+instance.options.thumbnails+' .active').removeClass('active');
            $('#'+instance.options.thumbnails+' a').eq(0).parent().addClass('active');
            
        
            // if thumbs are on multiple rows re-structure the html
            if (instance.options.multiRowThumbs){
                instance.configureMultiLineThumbs();
            }else{
                instance.setThumbVars();
            }
        }

        // Image swapping
        if(instance.swapImages){
            if (!instance.imagesSwapped){
                if (($(instance.element).height() > instance.options.swapHeight) && ($(instance.element).width() > instance.options.swapWidth)){
                    // swap images set flag
                    instance.swapImages();
                }
            }
        }
        
        // Update current page display
        if (instance.options.currentPage){
            $('#'+instance.options.currentPage).text(instance.currentIndex+' of '+instance.amountItems);
        }
    }, 1500);
    
};

/*
 * Auto mve handles the timer for the auto move functionality and the
 * progress bar functionality
 */
GarethGallery.prototype.settupAutoMove = function(){
    
    var instance = this;
    // Handle the auto move functionality
    if (this.options.autoMove){
        
        this.autoGalleryRunning = true;
        
        // If they want to update the width of an element using the progress bar
        if (this.options.progressBar){
            // run once to start with
            $("#"+this.options.progressBar).animate( 
                    {width: "100%"}, 
                    instance.options.autoMoveSpeed,
                function(){
                    $("#"+instance.options.progressBar).css('width', '0%');
                }
            );
            // start the timer
            this.galleryTimeout = setInterval(function(){
                $("#"+instance.options.progressBar).animate( 
                    {width: "100%"}, 
                    instance.options.autoMoveSpeed,
                    function(){
                        $("#"+instance.options.progressBar).css('width', '0%');
                    }
                );
                instance.move();
            }, instance.options.autoMoveSpeed);
        }else{
            this.galleryTimeout = setInterval(function(){instance.move();}, this.options.autoMoveSpeed);
        }
    }
}

/*
 *  Set up the click event actions for all controlls
 */
GarethGallery.prototype.bindClickEvents = function(){
    
    // Add click events for the next and previous buttons
    $('#'+this.options.leftButton).bind('click', {instance: this}, function(e){
        e.data.instance.clearGalleryTimeout();
        e.data.instance.move('left');
        return false;

    });
    $('#'+this.options.rightButton).bind('click', {instance: this}, function(e){
        e.data.instance.clearGalleryTimeout();
        e.data.instance.move('right');
        return false;
    });
    
    if (this.options.thumbnails){

        // Thumbnail clicking
        this.bindThumbnailClicks();
        
        // Thumbnail next and previous button clicking
        $('#'+this.options.thumbLeft).bind('click', {instance: this}, function(e){
            e.data.instance.clearGalleryTimeout();
            e.data.instance.moveThumbs('left');
            return false;

        });
        $('#'+this.options.thumbRight).bind('click', {instance: this}, function(e){
            e.data.instance.clearGalleryTimeout();
            e.data.instance.moveThumbs('right');
            return false;
        });
    }
    
    
};

/*
 * Function to bind the thumbnail click events
 */
GarethGallery.prototype.bindThumbnailClicks = function(){
    
    
    $('#'+this.options.thumbnails+' a').bind('click', {instance: this}, function(e){
            
        // stop the timer
        e.data.instance.clearGalleryTimeout();

        // Need to work out the wrapper for thumbs, this all hinges on multi line flag
        var items = '';
        if (e.data.instance.options.multiRowThumbs){
            items = $('#'+e.data.instance.options.thumbnails + ' ul li');
        }else{
            items = $('#'+e.data.instance.options.thumbnails + ' li');
        }

        var currentActiveIndex = items.index($('#'+e.data.instance.options.thumbnails+' .active'));
        var clickedIndex = $('#'+e.data.instance.options.thumbnails + ' a').index($(this));

        // work out how many items we have shifted
        var diff =  Math.abs(clickedIndex - currentActiveIndex);

        if (diff != 0){

            if( clickedIndex > currentActiveIndex){
                e.data.instance.move('right', diff, false, true);
            }else{
                e.data.instance.move('left', diff, false, true);
            }

        }
        return false;
    });

    
}

/*
 * Function for configuring multi line thumbnails, this is done on load
 * and on resize for multiline thumbnail galleries
 */
GarethGallery.prototype.configureMultiLineThumbs = function(){
    
    var wrapper = $('#'+this.options.thumbnails).parent();
    var hidden = false;
    var hiddenDad = false;
    
    //show and hde container again just in-case
    if(wrapper.is(':hidden')){
        
        if(wrapper.parent().is(':hidden')){
            wrapper.parent().show();
            hiddenDad = true;
        }else{
            wrapper.show();
            hidden = true;
        }
    }
    
    this.thumbPaneWidth = wrapper.innerWidth();
    this.thumbPaneHeight = wrapper.innerHeight();

    // How many 'large' panes do we now have
    var currentThumbs = $('#'+this.options.thumbnails+' a');

    $('#'+this.options.thumbnails).children().css('width', this.thumbPaneWidth);
    $('#'+this.options.thumbnails).children().css('height', this.thumbPaneHeight);
    
    this.thumbWidth = $('#'+this.options.thumbnails).children().eq(0).outerWidth(true);
    this.colsPerPane = Math.floor(this.thumbPaneWidth / $(currentThumbs).eq(0).parent().outerWidth(true));
    this.rowsPerPane = Math.floor(this.thumbPaneHeight / $(currentThumbs).eq(0).parent().outerHeight(true));
    this.thumbsPerPane = Math.floor(this.colsPerPane * this.rowsPerPane);
    this.amountThumbPanes = Math.ceil(currentThumbs.length / this.thumbsPerPane);
    
    // re-structure html structure for thumbs
    var newHtml  = '';
    var className = '';

    // for every thumbnail pane (newly calculated pane that is)
    var ident = 0;
    for (var i = 0; i < this.amountThumbPanes; i++){
        newHtml += '<li><ul>';

        for(var j = 0; j < this.rowsPerPane; j ++){
            for (var x = 0; x < this.colsPerPane; x ++){
                if (typeof($(currentThumbs).eq(ident).parent().html()) !== 'undefined'){
                    if($(currentThumbs).eq(ident).parent().attr("class") !== undefined){
                        className = ' class="'+$(currentThumbs).eq(ident).parent().attr("class")+'"';
                    }else{
                        className = '';
                    }
                    newHtml += '<li'+className+'>'+$(currentThumbs).eq(ident).parent().html()+'</li>';
                    ident ++;
                }
            }
        }
        newHtml += '</li></ul>';
    }
    
    $('#'+this.options.thumbnails).html(newHtml);

    // re-attach the click and touch events
    this.bindThumbnailClicks();

    // calculate height and width again
    $('#'+this.options.thumbnails).children().css('width', this.thumbPaneWidth);
    $('#'+this.options.thumbnails).children().css('height', this.thumbPaneHeight);
    
    if (hiddenDad){wrapper.parent().hide();}
    if(hidden){wrapper.hide();}
}

/*
 * Function to re-assign the thumbnail global variables
 */
GarethGallery.prototype.setThumbVars = function(){
    
    this.thumbPaneWidth = $('#'+this.options.thumbnails).parent().innerWidth();
    this.thumbPaneHeight = $('#'+this.options.thumbnails).children().eq(0).innerHeight();
    this.thumbWidth = $('#'+this.options.thumbnails).children().eq(0).outerWidth(true);
    this.thumbsPerPane = Math.floor(this.thumbPaneWidth / this.thumbWidth);
    this.totalThumbs = $('#'+this.options.thumbnails).children().length;
    // How many 'large' panes do we now have
    this.amountThumbPanes = Math.ceil(this.totalThumbs / this.thumbsPerPane);
}


/*
 * Function for reset the images
 */
GarethGallery.prototype.swapImages = function(){
    // swap gallery images
    $(this.element).find('img').each(function() {
        $(this).attr('src', $(this).attr('data-high-res'));
    });
    this.imagesSwapped = true;
};

/*
 * Touch support done manually this time
 */
GarethGallery.prototype.addTouchSupport = function(element, thumbs){
    
    if(typeof(thumbs)==='undefined') thumbs = false;
    
    if (thumbs){element = '#'+element;}

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
    });

    // move for the gallery
    $(element).bind('touchmove', function(event){
        var e = getTouchEvent(event);
        var movePosition = e.pageX;
        // Move with da finga
        $(element).css('left', (touchLeft - (startPosition - movePosition) ) + 'px' );
        return false; 
    });


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
        // work out if move grater than threshold, and in which direction
        if ( (Math.abs(startPosition - endPosition) > ( event.data.instance.paneWidth / 3 ) ) || fastSwipe){
            if (endPosition > startPosition){
                if(thumbs){
                    event.data.instance.moveThumbs('left', true);
                }else{
                    event.data.instance.move('left', 1, true);
                }
            }else{
                if(thumbs){
                    event.data.instance.moveThumbs('right', true);
                }else{
                    event.data.instance.move('right', 1, true);
                }
            }
            if (event.data.instance.options.autoMove){
                clearInterval(event.data.instance.galleryTimeout); 
            }
            endPosition = 0;
            startPosition = 0;
        }else{
            event.data.instance.touchPaneReset(thumbs);
        }
    });
    
}

// Function to fade the gallery
GarethGallery.prototype.fadeItem = function(fadeToIndex){

    if(typeof(fadeToIndex)==='undefined') fadeToIndex = 1;
    
    var currentActive = $(this.element+' li.active');
    $(currentActive).fadeOut(this.options.speed);
    $(currentActive).removeClass('active');
    
    var nextActive = $(this.element+' li').eq((fadeToIndex -1));
    nextActive.addClass('active');
    nextActive.fadeIn(this.options.speed);
    
};

// Function for moving the gallery
GarethGallery.prototype.move = function(direction, multiplier, touch, thumbClick){
       
    if(typeof(direction)==='undefined') direction = 'right';
    if(typeof(multiplier)==='undefined') multiplier = 1;
    if(typeof(touch)==='undefined') touch = false;
    if(typeof(thumbClick)==='undefined') thumbClick = false;

    var currentLeft = (this.paneWidth * (this.currentIndex - 1)) * -1;
    // boolean this as index changes and becomes a pain (sort later)
    var cantMoveRight = false;
    var cantMoveLeft = false;
    
    // Handle right
    if (direction == 'right'){

        // can we move right?
        if( this.currentIndex < this.amountItems){

            if (this.options.fade){

                this.fadeItem(this.currentIndex + (1 * multiplier));
            }else{
                if(this.css3){
                    $(this.element).css('left', currentLeft - ( this.paneWidth * multiplier) );
                }else{
                    $(this.element).animate({
                        left: currentLeft - ( this.paneWidth * multiplier) 
                    }, this.options.speed, function() {
                    });
                }
            }
            this.currentIndex = this.currentIndex + (1 * multiplier);

        }else{

            // cant move right so reset the gallery at the start
            if (!touch){
                if(this.options.fade){
                    this.fadeItem(1);
                }else{
                    if(this.css3){
                        $(this.element).css('left', 0);
                    }else{
                        $(this.element).animate({
                            left: 0
                        }, this.options.speed, function() {
                        });
                    }
                }
                cantMoveRight = true;
                this.currentIndex = 1;
            }else{
                this.touchPaneReset();
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
                if(this.css3){
                    $(this.element).css('left', currentLeft + (this.paneWidth * multiplier));
                }else{
                    $(this.element).animate({
                        left: currentLeft + (this.paneWidth * multiplier)
                    }, this.options.speed, function() {
                    }); 
                } 
            }
            this.currentIndex = this.currentIndex - (1 * multiplier)
        }else{

            if(!touch){
                if(this.options.fade){
                    this.fadeItem(this.amountItems);
                }else{
                     if(this.css3){
                        $(this.element).css('left', ( (this.amountItems -1) * this.paneWidth) - (( (this.amountItems - 1) * this.paneWidth) * 2));
                    }else{
                        $(this.element).animate({
                            left: ( (this.amountItems -1) * this.paneWidth) - (( (this.amountItems - 1) * this.paneWidth) * 2)
                        }, this.options.speed, function() {
                        });
                    }
                }
                cantMoveLeft = true;
                this.currentIndex = this.amountItems;
            }else{
                this.touchPaneReset();
            }
        }
    }

    // move active class on thumbs
    if (this.options.thumbnails){

        var currentActiveThumb = $('#'+this.options.thumbnails+' li.active');
        $(currentActiveThumb).removeClass('active');
        $('#'+this.options.thumbnails+' a').eq((this.currentIndex - 1)).parent().addClass('active');

        //thumbnails get clicked on touch move, this messes with the automove functionality for the thumbs
        if (!thumbClick){
            if (cantMoveRight || cantMoveLeft){
                if (cantMoveRight){this.moveThumbs('right');}
                if (cantMoveLeft){this.moveThumbs('left');}
            }else{
                
                var newPaneNumber = 0;
                
                // if the current active thumb is in the active pannel check (auto move the thumbs if not)
                if (this.options.multiRowThumbs){
                    newPaneNumber = Math.ceil(this.currentIndex / (this.colsPerPane * this.rowsPerPane));
                }else{
                    newPaneNumber = Math.ceil(this.currentIndex / this.thumbsPerPane);
                }
                
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
    
    // if we are updating the current page
    if (this.options.currentPage){
        $('#'+this.options.currentPage).text(this.currentIndex+' of '+this.amountItems);
    }
};

/*
 * Function to move the thumbnails
 */
GarethGallery.prototype.moveThumbs = function(direction, touch){
        
    if(typeof(direction)==='undefined') direction = 'right';
    if(typeof(touch)==='undefined') touch = false;

    // Get current left
    var currentLeft = (this.thumbPaneWidth * (this.thumbIndex -1)) * -1;
    
    if(direction == 'right'){

        // check if we can move
        if ( this.thumbIndex < this.amountThumbPanes){
            if(this.css3){
                $('#'+this.options.thumbnails).css('left',  currentLeft - this.thumbPaneWidth );
            }else{
                $('#'+this.options.thumbnails).animate({
                    left: currentLeft - this.thumbPaneWidth
                }, this.options.speed, function() {
                });
            }
            this.thumbIndex ++;
        }else{
            if (touch){
                this.touchPaneReset(true);
            }else{
                if(this.css3){
                    $('#'+this.options.thumbnails).css('left', 0);
                }else{
                    $('#'+this.options.thumbnails).animate({
                        left: 0
                    }, this.options.speed, function(){ 
                    });
                }
                this.thumbIndex = 1;
            }
        }
    }

    if(direction == 'left'){
        // check if we can move
        if ( this.thumbIndex != 1){
            if(this.css3){
                $('#'+this.options.thumbnails).css('left',  currentLeft + this.thumbPaneWidth );
            }else{
                $('#'+this.options.thumbnails).animate({
                    left: currentLeft + this.thumbPaneWidth
                }, this.options.speed, function() {
                });
            }
            this.thumbIndex --;
        }else{
            if (touch){
                this.touchPaneReset(true);
            }else{
                if(this.css3){
                    $('#'+this.options.thumbnails).css('left',  (this.thumbPaneWidth * (this.amountThumbPanes - 1)) * -1 );
                }else{
                    $('#'+this.options.thumbnails).animate({
                    left: (this.thumbPaneWidth * (this.amountThumbPanes - 1)) * -1
                    }, this.options.speed, function() {
                    }); 
                }
                this.thumbIndex = this.amountThumbPanes;
            }
        }
    }
    
    if (this.options.thumbCurrentPage){
        $('#'+this.options.thumbCurrentPage).text( this.thumbIndex  +' of '+this.amountThumbPanes);
    }
};

/*
 * Function to reset the touch pane
 */
GarethGallery.prototype.touchPaneReset = function(thumbs){

    if(typeof(thumbs)==='undefined') thumbs = false;
    
    if (!thumbs){
        if (!this.options.fade){
            // tween pane back to where it was before the finger move!
            if(this.css3){
                $(this.element).css('left', (this.paneWidth * (this.currentIndex - 1)) * -1  );
            }else{
                $(this.element).animate({
                    left: (this.paneWidth * (this.currentIndex - 1)) * -1 
                }, 300);
            }
        }
    }else{
        var moveTo = 0 ;
        if (this.options.multiRowThumbs){
            moveTo = ( this.thumbWidth * (this.thumbIndex - 1)) * -1;
        }else{
            moveTo = ((this.thumbWidth * this.thumbsPerPane) * (this.thumbIndex - 1)) * -1
        }
        
        if(this)
        //double check 
        if (this.options.thumbnails){
            if(this.css3){
                $('#'+this.options.thumbnails).css('left', moveTo);
            }else{
                $('#'+this.options.thumbnails).animate({
                    left: moveTo 
                }, 300);
            }

        } //end if options set
    }// end if flag passed

};

/*
 * Function to stop the timer
 */
GarethGallery.prototype.clearGalleryTimeout = function(){
    if (this.options.autoMove){
        clearInterval(this.galleryTimeout);
        if (this.options.progressBar){
            $("#"+this.options.progressBar).stop();
            $("#"+this.options.progressBar).css('width', '0%');
        }
        this.autoGalleryRunning = false;
    }
};

/*
 * Utils function for getting touch event
 */
function getTouchEvent(e){
    if(e.originalEvent.touches && e.originalEvent.touches.length) {
        e = e.originalEvent.touches[0];
    } else if(e.originalEvent.changedTouches && e.originalEvent.changedTouches.length) {
        e = e.originalEvent.changedTouches[0];
    }   
    return e;
}

/*
 * Utils supports function
 */
var supports = (function(prop) {  
   var div = document.createElement('div'),  
      vendors = 'Ms O Moz Webkit'.split(' '),  
      len = vendors.length;  
   
    if ( prop in div.style ) return true;  
    prop = prop.replace(/^[a-z]/, function(val) {  
        return val.toUpperCase();  
    });  
    while(len--) {  
        if ( vendors[len] + prop in div.style ) {  
        return true;  
        break;
        }  
    }  
    return false;  

});