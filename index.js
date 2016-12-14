var roundStep = 0.5;

function parsePrice(text) {
    text = text+"";
    return parseFloat(text.split(' ')[0].replace(',','.'));
}

function priceToString(price) {
    price = price.toFixed(2) + " TL";
    return price.replace(".", ",");
}

function getPrices() {
    var prices = [];
    var index = 0;

    $(".newPrice").each(function() {
        prices[index] = parsePrice($(this)[0].innerHTML);
        index++;
    });

    return prices;
}

function getCount() {
    var count = [];
    var index = 0;

    $(".tdOrderCount").each(function() {
        count[index] = $(this)[0].innerHTML;
        index++;
    });

    return count;
}

function writePrices(prices) {
    var index = 0;

    $(".newPrice").each(function() {
        $(this).html(priceToString(prices[index]));
        index++;
    });

    return prices;
}

function dropCoin(prices, count) {
    var response = {newPrices: [], residue: 0};
    var newTotal = 0;

    for(var i=0; i<prices.length; i++) {
        if(isNaN(prices[i]) || isNaN(count[i+1])) {
            response.newPrices[i] = NaN;
        } else {
            if(prices[i]%roundStep > roundStep/2) {
                response.newPrices[i] = prices[i] + (roundStep - prices[i]%roundStep);
            } else {
                response.newPrices[i] = prices[i] - prices[i]%roundStep;
            }

            newTotal += count[i+1] * response.newPrices[i];
        }
    }

    response.residue = price - newTotal;

    return response;
}

function isJoker() {
    if($(".checkout-info-joker").length)
        return true;
    else
        return false;
}

// oran hesapla
function run() {
    // yeni fiyatları yaz
    $(".tdOrderPrice").each(function() {
        var result = parsePrice($(this)[0].innerHTML) * ratio;
        
        if(!isNaN(result)) {
            var oldDiv = '<div class="oldPrice">'+ $(this)[0].innerHTML +'</div>'
            $(this).html(oldDiv +'<div class="newPrice">'+priceToString(result)+'</div>');
        }
    });

    var defaultPrices = getPrices();

    // yuvarlama
    var roundOptions = [
        "Küsuratlı bırak",
        "En ucuz ürünle dengele",
        "En pahalı ürünle dengele"
    ];
    function round() {
        var option = $(this).val();
        var prices = defaultPrices ? defaultPrices : getPrices();
        var count = getCount();

        switch(option) {
            case "1":
                var response = dropCoin(prices, count);
                prices = response.newPrices;
                var index = prices.indexOf(Math.min.apply(Math, prices));
                prices[index] += response.residue/count[index+1];
                break;
            case "2":
                var response = dropCoin(prices, count);
                prices = response.newPrices;
                var index = prices.indexOf(Math.max.apply(Math, prices));
                prices[index] += response.residue/count[index+1];
                break;
            default:
                // do nothing
        }
        writePrices(prices);
    }

    var comboBox = $('<select class="roundOptions" />');
    comboBox.change(round);
    for(var i=0; i < roundOptions.length; i++) {
        comboBox.append($('<option />', {text: roundOptions[i], value: i}));
    }

    var roundStepButton = $('<button class="roundStep">Küsurat</button>');
    roundStepButton.click(function() {
        roundStep = window.prompt("Yuvarlarken kullanılacak minimum küsurat aralığı (TL):", roundStep);
    });

    $('.ys-basket h3').append(roundStepButton);
    $(roundStepButton).after(comboBox);
}

// main
var fullPrice = parsePrice( $('.ys-basket .ys-overline')[0].innerHTML );
var price = parsePrice( $('.ys-basket .total')[1].innerHTML );
var ratio = price/fullPrice;

if(isJoker()) {
    run();
}