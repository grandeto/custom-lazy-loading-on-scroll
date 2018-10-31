(function($){

    // Can be used for lazy loading pagination on scroll down of any type of items: products, chats, members and etc. 
    //In this scenario all the coins from the CMC public API are loaded using their API build in pagination with start index and items per request

    //HTML elements example: <div id="itemsContainer" style="background:greenyellow; height:auto; min-height:300px; max-height:500px; overflow: scroll; border:1px solid;"><button id="loadItems">Load Items</button></div>

    var $itemsContainer = $('#itemsContainer'),
        $loadAndClearBtn = $('#loadItems');
        isPaginationAjaxDone = true,
        isInitDone = false,
        isInitStarted = false,
        lastScrollTop = 0,
        itemsPerRequest = 40,
        totalitems = 0,
        url = 'https://api.coinmarketcap.com/v2/ticker/?start=1&limit=' + itemsPerRequest,
        loader = '<div class="loader"><img src="/img/loader.gif"></div>',
        pageStart = 1;

    $loadAndClearBtn.on('click', function(){
        let $self = $(this);

        //prevent multiple clicking
        if (!isInitStarted) {
            isInitStarted = true;

            $self.text('Loading...');
            $self.attr('disabled', 'disabled');

            async function lazy() {
                try {
                    let data = await lazyLoadItems(url);
                    totalitems = data.metadata.num_cryptocurrencies;
                    appendItems(data.data, $itemsContainer);
                    isInitDone = true;
                    $self.text('Clear All');
                    $self.removeAttr('disabled');
                    $self.addClass('opened');
                } catch(err) {
                    console.log('Error', err);
                    if (!isInitDone) {
                        alert('Unable to get items! Error: ' + err.message);
                        $self.text('Load Items');
                        $self.removeAttr('disabled');
                        $self.removeClass('opened');
                        $itemsContainer.children('.item').remove();
                        isInitDone = false;
                        isInitStarted = false;
                    } else {
                        alert('Unable to get more items! Error: ' + err.message);
                    }
                    return;
                }
            }
            lazy();
        } else {
            $self.removeClass('opened');
            $itemsContainer.children('.item').remove();
            isInitDone = false;
            isInitStarted = false;
            $self.text('Load Items');
        }
    });

    $itemsContainer.scroll(function() {
        
        let $self = $(this),
            self = this,
            st = $self.scrollTop(),
            maxLoads,
            visibleItems = $self.children('.item').length;

        if (!isInitDone || totalitems == 0) {
            return;
        }
        
        if ( isPaginationAjaxDone === true && visibleItems >= itemsPerRequest && st > lastScrollTop ) { //start only if previous ajax is done, first items are added to the DOM, and scroll direction is down

            if (($self.scrollTop() + $self.height()) >= (self.scrollHeight * 0.9) && itemsPerRequest < totalitems) { // runn only if scroll bar is 10% before bottom of the items container and the items that should be loaded are more than items that will be get per request

                visibleItems = $self.children('.item').length; //get visible loaded items items
                
                pageStart = visibleItems + 1; // calculate the start index for the next request
                
                if (totalitems > visibleItems) { //runn if the total items that should be loaded are more than already loaded items

                    url = 'https://api.coinmarketcap.com/v2/ticker/?start=' + pageStart + '&limit=' + itemsPerRequest;

                    isPaginationAjaxDone = false; //disable items loading on scroll untill request finishes

                    async function lazy() {
                        try {
                            let data = await lazyLoadItems(url);
                            appendItems(data.data, $itemsContainer);
                        } catch(err) {
                            console.log('Error', err);
                            alert('Unable to get more items! Error: ' + err.message);
                            isPaginationAjaxDone = true;
                        }
                    }
                    lazy();
                }
            }
        }
        lastScrollTop = st; //calculate scroll position
    });

    function lazyLoadItems (url) {
        return new Promise((resolve, reject) => {
            $.when($.ajax(url)).done(function(data, textStatus, jqXHR){
                resolve(data);
            }).fail(function(jqXHR, textStatus, errorThrown) {
                reject(new Error(textStatus));
            });
        });
    }

    function appendItems(items, $itemsContainer) {
        //append the items to the DOM
        let itemsHtml = '';
        for (let i in items) {
            itemsHtml = itemsHtml + '<div class="item" style="min-height:30px">' + items[i].name + '</div>';
        }

        $itemsContainer.append(itemsHtml);

        if (isInitDone) {
            //if first items are loaded, enable on scroll loading
            isPaginationAjaxDone = true;
        }
    }

    //optional add/remove loader
    function addRemoveLoader(action) {
        if (action === "add") {
            // if ($('.loader', $itemsContainer).length === 0) {
            //     $itemsContainer.append(loader);
            // }
        }
        if (action === "remove") {
            // if ($('.loader', $itemsContainer).length) {
            //     $itemsContainer.remove('.loader');
            // }
        }
    }
})(jQuery);
