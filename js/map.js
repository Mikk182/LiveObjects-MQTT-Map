(function(L) {
    L.ExtendedDivIcon = L.DivIcon.extend({
        options: {
            //Options de base
            iconSize: [12, 12],
            html: false,
            bgPos: null,
            className: 'leaflet-div-icon',
            //Options etendues
            id: null,
            htmlId: null
        },
        // Surcharge de la création pour ajouter un id à la div
        createIcon: function(oldIcon) {
            var div = L.DivIcon.prototype.createIcon.call(this, oldIcon);

            if(this.options.id) {
              div.id = this.options.id;
            }

            if(this.options.style) {
              for(var key in this.options.style) {
                div.style[key] = this.options.style[key];
              }
            }

            return div;
        },
        animate: function() {
            var thisIcon = this;
            // TODO : utiliser 'L.DomUtil.get'
            setInterval(function(){
                setTimeout(function(){
                    $("#" + thisIcon.options.htmlId)[0].style.width = '50px'
                    $("#" + thisIcon.options.htmlId)[0].style.height = '50px'
                    $("#" + thisIcon.options.htmlId)[0].style.marginLeft = '-15px'
                    $("#" + thisIcon.options.htmlId)[0].style.marginTop = '-15px'
                }, 1000)

                setTimeout(function(){
                    $("#" + thisIcon.options.htmlId)[0].style.width = '20px'
                    $("#" + thisIcon.options.htmlId)[0].style.height = '20px'
                    $("#" + thisIcon.options.htmlId)[0].style.marginLeft = '0px'
                    $("#" + thisIcon.options.htmlId)[0].style.marginTop = '0px'
                }, 2000)
            }, 2000);
        },
        setColor: function(gasrate){
            var color = "";
            if(gasrate<25){
                color = "green";
            }else if(gasrate < 50){
                color = "yellow";
            }else if(gasrate < 75){
                color = "orange";
            }else if(gasrate < 101){
                color = "red";
            }

            var thisIcon = L.DomUtil.get(this.options.id);
            var thisInnerHtmlIcon = L.DomUtil.get(this.options.htmlId);

            if(thisIcon){
                if(L.DomUtil.hasClass(thisIcon, "green08"))
                    L.DomUtil.removeClass(thisIcon, "green08");

                if(L.DomUtil.hasClass(thisIcon, "yellow08"))
                    L.DomUtil.removeClass(thisIcon, "yellow08");

                if(L.DomUtil.hasClass(thisIcon, "orange08"))
                    L.DomUtil.removeClass(thisIcon, "orange08");

                if(L.DomUtil.hasClass(thisIcon, "red08"))
                    L.DomUtil.removeClass(thisIcon, "red08");

                L.DomUtil.addClass(thisIcon, color + "08");
            }

            if(thisInnerHtmlIcon){
                if(L.DomUtil.hasClass(thisInnerHtmlIcon, "green03"))
                    L.DomUtil.removeClass(thisInnerHtmlIcon, "green03");

                if(L.DomUtil.hasClass(thisInnerHtmlIcon, "yellow03"))
                    L.DomUtil.removeClass(thisInnerHtmlIcon, "yellow03");

                if(L.DomUtil.hasClass(thisInnerHtmlIcon, "orange03"))
                    L.DomUtil.removeClass(thisInnerHtmlIcon, "orange03");

                if(L.DomUtil.hasClass(thisInnerHtmlIcon, "red03"))
                    L.DomUtil.removeClass(thisInnerHtmlIcon, "red03");

                L.DomUtil.addClass(thisInnerHtmlIcon, color + "03");
            }
        }
  });

  L.extendedDivIcon = function(options) {
    return new L.ExtendedDivIcon(options);
  }
})(window.L);

function createIcon(id){
    var icon = L.extendedDivIcon({
        id: "icon_" + id,
        htmlId: "html_icon_" + id,
        iconSize: null,
        iconAnchor: [10, 10],
        popupAnchor: [10, 0],
        shadowSize: [0, 0],
        className: 'icon green08',
        html: "<div id='html_icon_" + id + "' class='animated-icon green03 my-icon-id'></div>",
    });

    return icon;
}

function getPopUpText(item){
    var maxGasRate = 0;
    var popUpText = "<div class='popup'>";
    $.each(item.gasArray, function( key, value ) {
        if(value > maxGasRate){
           maxGasRate = value;
        }
        popUpText = popUpText + "<div class='item'>" + "Taux " + key + " : " + value + "%" + "</div>"
    })
    popUpText = popUpText + "</div>"

    return { maxGasRate : maxGasRate, popUpText : popUpText};
}

function GetLastLocation() {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "https://liveobjects.orange-business.com/api/v0/data/streams/urn:lora:0004A30B001F8799!uplink?limit=1", false);
    xhttp.setRequestHeader("Content-type", "application/json");
	xhttp.setRequestHeader("X-API-Key", "7b0d4da5ca514b7e92c7fe2f04f9e581");
    xhttp.send();
    var response = JSON.parse(xhttp.responseText);
	
	// Location
	var hex = response[0].value.payload;
	hex = hex.substring(0, hex.length - 1);
	var location = hexToAscii(hex);
	var locations = location.split(',');
	var lat = locations[0];
	var lng = locations[1].slice(0,-1);
	// UTC TimeStamp
	var utcTimestamp = response[0].timestamp;
	//devEui
	var devEUI = response[0].metadata.network.lora.devEUI;
	
	return { devEUI, utcTimestamp, lat, lng };
}

function hexToAscii(str){
    hexString = str;
    strOut = '';
        for (x = 0; x < hexString.length; x += 2) {
            strOut += String.fromCharCode(parseInt(hexString.substr(x, 2), 16));
        }
    return strOut;    
}

function subscribe(){
	//const url = "mqtt://liveobjects.orange-business.com:1883"
		const url = "ws://liveobjects.orange-business.com:80/mqtt"
		const apiKey = "7b0d4da5ca514b7e92c7fe2f04f9e581"


		/** Subscription for one specific device (pub sub) **/
		const mqttTopic = "router/~event/v1/data/new/urn/lora/0004A30B001F8799/#"

		/** Subscription for all devices (pub sub) **/
		// const mqttTopic = "router/~event/v1/data/new/urn/lora/#"

		/** Subscription for a fifo (persisted) **/
		//const mqttTopic = "fifo/default"

		/** connect **/
		console.log("MQTT::Connecting to ");
		var client  = mqtt.connect(url, {username:"payload", password:apiKey, keepAlive:30})

		/** client on connect **/
		client.on("connect", function() {
		  console.log("MQTT::Connected");

		  client.subscribe(mqttTopic)
		  console.log("MQTT::Subscribed to topic:", mqttTopic);
		})

		/** client on error **/
		client.on("error", function(err) {
		  console.log("MQTT::Error from client --> ", err);
		})

		client.on("message", function (topic, message) {

			console.log("MQTT::New message\n");
			var loraMessage = JSON.parse(message)

		  
			var devEUI = loraMessage.metadata.source.split(':')[2];
			var utcTimestamp = loraMessage.timestamp;
			
			console.log("DevEUI:", devEUI);
			console.log("Timestamp:", utcTimestamp);
			console.log("Port:", loraMessage.metadata.network.lora.port);
			console.log("Fcnt:", loraMessage.metadata.network.lora.fcnt);
			console.log("Payload:", loraMessage.value.payload, "\n");

			var hex = loraMessage.value.payload;
			var location = hexToAscii(hex);
			
			var locations = location.split(',');
			var lat = locations[0];
			var lng = locations[1].slice(0, -1);
			
			var newLatLng = new L.LatLng(lat, lng);
			markerList[0].setLatLng(newLatLng); 
			
			var popUpText = "<div class='popup'><div class='item'>"+devEUI+"</div><div class='item'>"+utcTimestamp+"</div><div class='item'>Lat : "+lat+"</div><div class='item'>Long : "+lng+"</div></div>"

			markerList[0].bindPopup(popUpText);
		})
}

var markerList= [];
$( document ).ready(function() {
    	
	L.mapbox.accessToken = 'pk.eyJ1IjoibWlrayIsImEiOiJjaXVweDc5MXEwMDNzMnlwazk2c2wxMHM0In0.QyydO2WoRTjolCwYV3ZogA';
	var map = L.mapbox.map('map').setView([49.488332, 0.122278], 13);
	
    $('#toolbar .hamburger').on('click', function() {
        $(this).parent().toggleClass('open');
    });

    $("#menulist ul li").on('click', function(e) {
        e.stopPropagation();
        $(this).children('.content').toggle('slow');
    });
	
	L.control.layers({
		'Streets': L.mapbox.tileLayer('mapbox.streets'),
		'Light': L.mapbox.tileLayer('mapbox.light'),
		"Dark": L.mapbox.tileLayer("mapbox.dark").addTo(map),
        "Satellite": L.mapbox.tileLayer("mapbox.satellite"),
        "Streets-satellite": L.mapbox.tileLayer("mapbox.streets-satellite"),
        "Wheatpaste": L.mapbox.tileLayer("mapbox.wheatpaste"),
        "Streets-basic": L.mapbox.tileLayer("mapbox.streets-basic"),
        "Comic": L.mapbox.tileLayer("mapbox.comic"),
        "Outdoors": L.mapbox.tileLayer("mapbox.outdoors"),
        "Run-bike-hike": L.mapbox.tileLayer("mapbox.run-bike-hike"),
        "Pencil": L.mapbox.tileLayer("mapbox.pencil"),
        "Pirates": L.mapbox.tileLayer("mapbox.pirates"),
        "Emerald": L.mapbox.tileLayer("mapbox.emerald"),
        "High-contrast": L.mapbox.tileLayer("mapbox.high-contrast")
	}).addTo(map);

	
    var icon = createIcon(1)
	
	var location = GetLastLocation();
	
	var marker = L.marker(
		[location.lat, location.lng], 
		{
			// id=1,
			icon: icon,
			opacity: 0.7
		}
	);

	marker.addTo(map);
	
    var popUpText = "<div class='popup'><div class='item'>"+location.devEUI+"</div><div class='item'>"+location.utcTimestamp+"</div><div class='item'>Lat : "+location.lat+"</div><div class='item'>Long : "+location.lng+"</div></div>"

    marker.bindPopup(popUpText).openPopup();

    marker.options.icon.setColor(20);

    markerList.push(marker);

    icon.animate();
	
	subscribe();
});
