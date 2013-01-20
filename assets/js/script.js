/* 
 * Examples of how to use a very awesome plugin!
 * 
 * @author Gareth Fuller
 */

$(window).load(function() {

    // Example one
    var galleryOne = new GarethGallery({'element':'gallery-inner'});
    galleryOne.start();
    
    //Example two, thumbs
    var galleryTwo = new GarethGallery({    'element'       : 'gallery-thumbs-inner',
                                            'leftButton'   : 'previous-button-thumbs',
                                            'rightButton'  : 'next-button-thumbs',
                                            'thumbnails'   : 'thumbnails-inner',
                                            'thumbLeft'    : 'previous-button-thumbs-icons',
                                            'thumbRight'   : 'next-button-thumbs-icons'
                                        });
   galleryTwo.start();
                                            
    // Example three, thumbs with fade
    var galleryThree = new GarethGallery({  'element'       : 'gallery-thumbs-fade-inner',
                                            'leftButton'   : 'previous-button-thumbs-fade',
                                            'rightButton'  : 'next-button-thumbs-fade',
                                            'thumbnails'   : 'thumbnails-inner-fade',
                                            'thumbLeft'    : 'previous-button-thumbs-icons-fade',
                                            'thumbRight'   : 'next-button-thumbs-icons-fade',
                                            'fade'         : true
                                        });
    galleryThree.start();

    // Example four, a more complex gallery structure
   var galleryFour = new GarethGallery({'element'       : 'gallery-complex-inner',
                                           'leftButton'   : 'previous-button-complex',
                                            'rightButton'  : 'next-button-complex',
                                            'thumbnails'   : 'thumbnails-inner-complex',
                                            'thumbLeft'    : 'previous-button-icons-complex',
                                            'thumbRight'   : 'next-button-icons-complex',
                                            'swapImages'   : true,
                                            'progressBar'  : 'status'
                                        });
    galleryFour.start();
    
    // Example with multi line thumbnails
    var galleryFive = new GarethGallery({'element'       : 'gallery-multi-inner',
                                           'leftButton'   : 'previous-button-multi',
                                           'rightButton'  : 'next-button-multi',
                                           'thumbnails'   : 'thumbnails-inner-multi',
                                           'thumbLeft'    : 'previous-button-icons-multi',
                                           'thumbRight'   : 'next-button-icons-multi',
                                           'swapImages'   : true,
                                           'progressBar'  : 'status-multi',
                                           'multiRowThumbs' : true,
                                           'autoMove'     : false,
                                           'thumbCurrentPage' : 'pageNumThumbs',
                                           'currentPage'   : 'pageNum',
                                           'advancedTouch' :true
                                        });
    galleryFive.start();
    
    $('#thumbnails-wrapper-multi').hide();
    
    // simple toggle function
    function toggleThumbs(){
        $('#thumbnails-wrapper-multi').slideToggle();
        galleryFive.clearGalleryTimeout();
        if( $('#view-thumbs').text() == 'View thumbs'){
            $('#view-thumbs').text('Hide thumbs');
        }else{
            $('#view-thumbs').text('View thumbs');
        }
    }
    
    // some custom functionality for the multi thumbs
    $('#view-thumbs').click(function(e){
        e.preventDefault();
        toggleThumbs();
    });
    
    
    $('#thumbnails-inner-multi a').click(function(e){
        toggleThumbs();
    })
    
    
    
});