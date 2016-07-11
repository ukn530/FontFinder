// 選択したいフォント名の一部
var searchFontName = "W3";



var doc = context.document;
var page = doc.currentPage();
var artboard = doc.currentPage().currentArtboard()
var includedLayered = artboard.layers().count();
var count = 1;
var switchOfSearch = 0;
var includedFontName = [];
var userInput;
var fontNames;


makeUserInterface();


function userInterfaceLoop() {

    var uiResponse = NOT_READY;

    while (uiResponse === NOT_READY) {

        // Creatte the interface
        var modal = createUserInterface();

        // Show it and process the form
        uiResponse = processButtonClick(modal, modal.runModal());

        // Process the response
        switch (uiResponse) {

            // Reload the interface
            case NOT_READY:
                alert("Find or replace cannot be blank");
                break;

            // Let's go
            case READY_TO_SEARCH:
                doFindAndReplace();
                break;

            // Cancelled
            case CANCELLED:
                [document showMessage: "Cancelled"];
                break;
        }
    }
}


function makeUserInterface() {

    featureSearchFontName();

    // JS Style
    userInput = COSAlertWindow.new();

    //ダイアログタイトル
    userInput.setMessageText( 'このページに含まれるフォント' );

    for (var i = 0; i < includedFontName.length; i++) {
        var checkbox = NSButton.alloc().initWithFrame( NSMakeRect( 0, i * 24, 300, 18 ) );
        checkbox.setButtonType( NSSwitchButton );
        checkbox.setTitle(includedFontName[i]);
        checkbox.setTag( 'value' );
        checkbox.setState( false );
        userInput.addAccessoryView( checkbox );
    }

    // ボタン
    userInput.addButtonWithTitle('選択する');
    userInput.addButtonWithTitle('キャンセル');

    // 実行
    userInput.runModal();
}



function featureSearchFontName () {
    switchOfSearch = 1;
    searchInLayer(page);
    log(includedFontName);
}



function featureSelectSpecificFontTextLayer () {
    switchOfSearch = 2;
    log(searchFontName + 'をフォント名に含むテキストレイヤーを選択しました。\n');
    searchInLayer(page);
}




function showFontName(layer) {
    var isExistFont = false;

    for (var i = 0; i < includedFontName.length; i++) {
        if (includedFontName[i] == layer.fontPostscriptName()) {
            isExistFont = true;
        }
    }

    if (!isExistFont) {
        includedFontName.push(layer.fontPostscriptName());
        fontNames += layer.fontPostscriptName();
    }
}


// 特定のフォント名のレイヤーを選択
function selectTextLayer(layer) {
    if (layer.fontPostscriptName().match(searchFontName)) {
        log(count + '. ' + layer.stringValue());
        layer.select_byExpandingSelection(true, true);
        count++;
    }
}


function searchInLayer(layer) {

    // Determine the type of layer we're looking at
    switch ([layer class]) {

        // Text layer - this is the important one
        case MSTextLayer:
            //log(layer.stringValue());
            if (switchOfSearch == 1) {
                showFontName(layer);
            } else if (switchOfSearch == 2) {
                selectTextLayer(layer);
            }

            break;

        // If we've started our search at the document root, loop through the pages
        case MSDocument:
            var documentPages = [layer pages];
            for (var i = 0; i < [documentPages count]; i++) {
                var documentPage = [documentPages objectAtIndex:i];
                searchInLayer(documentPage);
            }
            break;

        // Otherwise everything below that is an alias for layers anyway so we can treat them the same and loop through any sublayers
        case MSPage:
        case MSLayerGroup:
        case MSArtboardGroup:
            var sublayers = [layer layers];
            for (var i = 0; i < [sublayers count]; i++) {
                var sublayer = [sublayers objectAtIndex: i];
                searchInLayer(sublayer);
            }
            break;
    }

}


