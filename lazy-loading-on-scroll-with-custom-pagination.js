(function($){

    // Can be used for lazy loading pagination on scroll down of any type of items: products, chats, members and etc. 
    //In this scenario all currencies from the nexchange.io public API are loaded using one API call and custom pagination

    //HTML elements example: <div id="itemsContainer" style="background:greenyellow; height:auto; min-height:200px; max-height:200px; overflow: scroll; border:1px solid;"><button id="loadItems">Load Items</button></div>

    var $itemsContainer = $('#itemsContainer'),
        $loadAndClearBtn = $('#loadItems'),
        isPaginationAjaxDone = true,
        isInitDone = false,
        isInitStarted = false,
        lastScrollTop = 0,
        itemsPerScroll = 10,
        allItemsData,
        totalitems = 0,
        url = 'https://api.nexchange.io/en/api/v1/currency/',
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
                    totalitems = data.length; //if data is arr
                    //totalitems = countObjKeys(data); //if data is obj
                    allItemsData = data;
                    appendItems(allItemsData, $itemsContainer);
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
                    }
                    return;
                }
            }
            lazy();
        } else {
            $self.removeClass('opened');
            $itemsContainer.children('.item').remove();
            pageStart = 1;
            isInitDone = false;
            isInitStarted = false;
            $self.text('Load Items');
        }
    });

    $itemsContainer.scroll(function() {
        
        let $self = $(this),
            self = this,
            st = $self.scrollTop(),
            visibleItems = $self.children('.item').length;

        if (!isInitDone || totalitems == 0) {
            return;
        }
        
        if ( isPaginationAjaxDone === true && visibleItems >= itemsPerScroll && st > lastScrollTop ) { //start only if previous ajax is done, first items are added to the DOM, and scroll direction is down

            if (($self.scrollTop() + $self.height()) >= (self.scrollHeight * 0.9) && itemsPerScroll < totalitems) { // runn only if scroll bar is 10% before bottom of the items container and the items that should be loaded are more than items that will be get per request

                visibleItems = $self.children('.item').length; //get visible loaded items items
                
                pageStart = visibleItems + 1; // calculate the start index for the next request
                
                if (totalitems > visibleItems) { //runn if the total items that should be loaded are more than already loaded items

                    isPaginationAjaxDone = false; //disable items loading on scroll untill request finishes

                    appendItems(allItemsData, $itemsContainer);
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
        let itemsHtml = '',
            index = pageStart - 1,
            counter = 0;
        for (let i in items) {
            if (index == totalitems) {
                break;
            }
            itemsHtml = itemsHtml + '<div class="item" style="min-height:30px">' + items[index].name + '</div>';
            index++;
            counter++;
            if (counter == itemsPerScroll) {
                break;
            }
        }

        $itemsContainer.append(itemsHtml);

        if (isInitDone) {
            //if first items are loaded, enable on scroll loading
            isPaginationAjaxDone = true;
        }
    }

    //optional if response is in obj
    function countObjKeys(obj) {
        let counter = 0;
        for (let key in obj) {
            counter++;
        }
        return counter;
        
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
