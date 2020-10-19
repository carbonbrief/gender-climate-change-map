/*mapboxgl.accessToken = config.key1;*/

if (!mapboxgl.supported()) {
    alert('Your browser does not support Mapbox GL');
} else {
    mapboxgl.accessToken = 'pk.eyJ1Ijoicm9zcGVhcmNlIiwiYSI6ImNqbGhxaTAwNDFnamYzb25qY2Jha2NrZWgifQ.xZMz-pe7wEEpARooTi6lkw';
    var map = new mapboxgl.Map({
        container: 'map',
        // style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        style: 'mapbox://styles/rospearce/cjskgftrp4a9f1fpfbbgkmtlq',
        center: [8, 20],
        zoom: 1.5,
        maxZoom: 12
    });
}

map.scrollZoom.disable();

let screenWidth = window.innerWidth;

let boundsMobile = [
    [ -100, -70],[120, 85]
]

let boundsLaptop = [
    [ -160, -70],[160, 90]
]

let boundsDesktop = [
    [ -188, -75],[90, 86]
]

let boundsRetina = [
    [ -165, -65],[91, 78]
]

function getBounds () {
    if (screenWidth > 1400) {
        return boundsRetina
    }
    else if (screenWidth > 1024 && screenWidth < 1400) {
        return boundsDesktop
    } 
    else if (1024 > screenWidth && screenWidth > 850) {
        return boundsLaptop
    } else {
        return boundsMobile
    }
}

var bounds = getBounds();

// resize map for the screen
map.fitBounds(bounds, {padding: 10});

var icons = {
    "Death and injury from extreme weather": "fas fa-bolt",
    "Food insecurity": "fas fa-utensils",
    "Infectious disease": "fas fa-plus-circle",
    "Mental illness": "fas fa-user-md",
    "Poor reproductive and maternal health": "fas fa-child",
};

var typeTags = {
    "Death and injury from extreme weather": "extreme",
    "Food insecurity": "food",
    "Infectious disease": "disease",
    "Mental illness": "mental",
    "Poor reproductive and maternal health": "reproductive",
};

var impactTags = {
    "Female": "female",
    "Male": "male",
    "No difference": "nodifference",
}

var popupIcon = {
    "Death and injury from extreme weather": "<i class='fas fa-bolt'></i>",
    "Food insecurity": "<i class='fas fa-utensils'></i>",
    "Infectious disease": "<i class='fas fa-plus-circle'></i>",
    "Mental illness": "<i class='ffas fa-user-md'></i>",
    "Poor reproductive and maternal health": "<i class='fas fa-child'></i>",
}

var colors = {
    "female": "#f4a467",
    "male": "#9600bf",
    "nodifference": "#999999"
}

map.addControl(new mapboxgl.NavigationControl());

map.on('load', function() {

    map.addSource("geojson", {
        "type": "geojson",
        "data": geojson
    });

    geojson.features.forEach(function(feature) {

        let type = feature.properties['Climate change impact'];
        let symbol = icons[type];

        // create class names to use as tags for filtering
        let typeTag = typeTags[type];
        //let year = feature.properties['year'];
        /*let occurrence = feature.properties['year']*/
        let impact = feature.properties['Gender most affected'];
        let impactTag = impactTags[impact];
        //let sType = feature.properties['studyType'];
        //let studyType = studyTypes[sType];
        //let tooltipStudy = feature.properties['studyType'];
        //let ttStudy = tooltipStudyTypes[tooltipStudy];

        // replace hash marks with smart quotes
        let summary = feature.properties['Blurb'];
        //summary = summary.substr(1, summary.length-2);
        summary = "\u201c" + summary + "\u201d";

        let url = feature.properties['URL'];
        let citation1 = feature.properties['Citation'];
        let substr = "pdf";

        //if (url.indexOf(substr) !== -1) {
         //   citation1 = citation1 + " [pdf]";
        //}

        // create a HTML element for each feature
        var el = document.createElement('div');
        el.className = "marker" + " " + typeTag + " " + impactTag;

        // inner symbol
        if (typeTag == "drought" || typeTag =="coral") {
            el.innerHTML = "<img class='marker-icon' src='img/" + typeTag + ".svg'></img>";
        } else {
            el.innerHTML = '<i class="' + symbol + '"></i>';
        }

        // make a marker for each feature and add to the map
        new mapboxgl.Marker(el)
        .setLngLat(feature.geometry.coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 10, closeButton: false }) // add popups
        .setHTML('<h3>' + feature.properties['Title'] + '</h3> <h4 style="padding-bottom: 4px; border-bottom: 2px solid ' + colors[impactTag] + ';">' + feature.properties['Location'] /*+ ", " + feature.properties['year']*/ + '</h4><ul class="list-group list-tooltip"><li>' 
        + popupIcon[type] + " "  + type + '</li>' 
        + '<li><div class="tooltip ' + impactTag + '" style="margin-right: 5px;"></div>' + impact + '</li></ul><p class="summary">' + summary + '</p><p class="citation"><a href="'
        + url + '" target="_blank">' + citation1 + "</a>"))
        .addTo(map);

        //console.log(el)

    });

    $(".list-group-item").click(function(e) {

        // CHANGE CLICK CHECKBOX
        let $tc = $(this).find('input:checkbox');
        // checks what the current status of the checkbox is
        let tv = $tc.attr('checked');
        // applies the opposite
        $tc.attr('checked', !tv);

        // UPDATE STYLE
        // tv is the previous value
        if (tv == "checked") {
            $(this).addClass("unselected");
        } else {
            $(this).removeClass("unselected");
        }

        filterMap();

        });


    $("#select").click(function(e) {

        $(".impact input:checkbox").each(function() {
            if(this.checked) {
                // do nothing
            } else {
                $(this).attr('checked', 'checked');
                // unselected = greyed out
                $(this).parent('li').removeClass('unselected');
            }
        });

        filterMap();

    });

    $("#deselect").click(function(e) {

        $(".impact input:checkbox").each(function() {
            if(this.checked) {
                $(this).attr('checked', false);
                // unselected = greyed out
                $(this).parent('li').addClass('unselected');
            } else {
                // do nothing
            }
        });

        filterMap();

    });

    let yearValue = "all";

    //document.getElementById('selectorYear').addEventListener('change', function(e) {
       // yearValue = e.target.value;
       // filterMap();
    //});

function filterMap () {

    //if (yearValue != "all") {
          //  $(".marker.trend").css("visibility", "hidden");
          //  $("li#trend.list-group-item").addClass("unselected");
          //  $("li#trend.list-group-item input:checkbox").attr('checked', false);
    //    } else if (yearValue == "all") {
            /*$("li#trend.list-group-item").removeClass("unselected");*/
            
    //    };

        // GATHER DATA ON CHECKBOXES
        let checkboxes = ["female", "male", "nodifference", "extreme", "food", "disease", "mental", "reproductive"];

        let selected = [];
        $('input:checked').each(function() {
            selected.push($(this).attr('name'));
        });

        // create array of checkboxes that aren't selected
        let unselected = checkboxes.filter(i => selected.indexOf(i) === -1);

        // make all map markers visible
        $(".marker").css("visibility", "visible");

        //let years = ["2019", "2018", "2017", "2016", "2015", "2014", "2013", "2012", "2011", "2010"];
        
        // hide each of the unselected classes in turn

        if (yearValue == "all") {
            for (i = 0; i < unselected.length; i++) {
                $("." + unselected[i]).css("visibility", "hidden");
            }
        } else {
            // filter both
            for (i = 0; i < years.length; i++) {
                if (yearValue !== years[i]) {
                    $("." + years[i]).css("visibility", "hidden");
                }
            }

            for (i = 0; i < unselected.length; i++) {
                $("." + unselected[i]).css("visibility", "hidden");
            }

        };


                console.log(filterMap)


            let markers = [];


        $(".marker").each(function() {
            if (window.getComputedStyle(this).visibility === "visible") {
                markers.push($(this));
            }
        });

        $("#studies").text(markers.length);

    }

});

// reset dropdown on window reload

$(document).ready(function () {
    $("select").each(function () {
        $(this).val($(this).find('option[selected]').val());
    });
})

// TOGGLE BUTTON

$(".toggle").click(function() {
    $("#console").toggleClass('console-close console-open');
    $('.arrow-right-hidden').toggleClass('arrow-right');
    $('.arrow-left').toggleClass('arrow-left-hidden');
});


