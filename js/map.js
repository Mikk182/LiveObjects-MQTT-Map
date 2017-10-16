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
	// alert(response[0].value.payload);
	var hex = response[0].value.payload;
	// alert(hex);
	hex = hex.substring(0, hex.length - 1);
	// alert(hex);
	var location = hexToAscii(hex);
	//alert(location);
	
	var locations = location.split(',');
	var lat = locations[0];
	var long = locations[1];
	// alert(lat);
	// alert(long);
	
	return { lat, long };
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

		  console.log("DevEUI:", loraMessage.metadata.source.split(':')[2]);
		  console.log("Timestamp:", loraMessage.timestamp);
		  console.log("Port:", loraMessage.metadata.network.lora.port);
		  console.log("Fcnt:", loraMessage.metadata.network.lora.fcnt);
		  console.log("Payload:", loraMessage.value.payload, "\n");

			var hex = loraMessage.value.payload;
			// alert(hex);
			//hex = hex.substring(0, hex.length - 1);
			// alert(hex);
			var location = hexToAscii(hex);
			
			var locations = location.split(',');
			var lat = locations[0];
			var lng = locations[1];
			
			var newLatLng = new L.LatLng(lat, lng);
			markerList[0].setLatLng(newLatLng); 
		})
}

var markerList= [];
$( document ).ready(function() {
    // var channels = ['SensorsMikk',
        // "Sensor_1Mikk",
        // "Sensor_2Mikk",
        // "Sensor_3Mikk",
        // "Sensor_4Mikk",
        // "Sensor_5Mikk"
        // ];

    // var pn = new PubNub({
        // //Clefs Mick
        // //publishKey: 'pub-c-4c63bcfd-ef3d-49ff-a17a-5db83c247fe0',
        // //subscribeKey: 'sub-c-476b1cce-9904-11e6-bb35-0619f8945a4f',
        // //Clefs Gwendal
        // //publishKey: 'pub-c-9bb7a63d-5821-4343-ad04-7be9e8a221df',
        // subscribeKey: 'sub-c-4b267698-97eb-11e6-82f8-02ee2ddab7fe',
        // ssl: (('https:' == document.location.protocol) ? true : false)
      // });

    // var defaultLayer = 'mapbox.streets-satellite';
	var map = L.map('map').setView([49.488332, 0.122278], 13);
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
		maxZoom: 18,
		id: 'mapbox.satellite',
		accessToken: 'pk.eyJ1IjoibWlrayIsImEiOiJjaXVweDc5MXEwMDNzMnlwazk2c2wxMHM0In0.QyydO2WoRTjolCwYV3ZogA'
	}).addTo(map);
    // var map = eon.map({
        // pubnub: pn,
        // id: 'map',
        // mbId: defaultLayer,
        // mbToken: 'pk.eyJ1IjoibWlrayIsImEiOiJjaXVweDVvaWwwMDBtMnlsOGNsMDU1bWgyIn0.ZrFKwYUj-4oYlTLDXNEtaw',
        // channels: channels,
        // connect: function(){
// //            var lc = L.control.locate().addTo(map);
// //            lc.start();
            // map.setView([49.488332, 0.122278], 13);
        // },
        // transform: function(data){
            // var new_data = {};
            // for (var i = 0; i < data.length; i++) {
                // var key = 'sensor_' + data[i].sensor;
                // $.each(data[i].eon, function(index, gaz){
                    // data[i].eon[index] = (gaz * 100).toFixed(2);
                // });
                // new_data[key] = {
                    // latlng: data[i].latlng,
                    // data: {id : data[i].sensor, gasArray: data[i].eon}
                // }
            // }
            // return new_data;
        // },
        // message: function (data) {
            // $.each(data, function( index, item ) {
                // var marker = markerList.find(x => x.options.id === item.data.id)
                // if(marker){

                    // var markerData = getPopUpText(item.data);

                    // marker.setPopupContent(markerData.popUpText)

                    // marker.options.icon.setColor(markerData.maxGasRate);
                // }
            // });
        // },
        // marker: function (latlng, data) {
            // var icon = createIcon(data.id)
            // var marker = new L.Marker(latlng, {
                // id: data.id,
                // icon: icon,
                // opacity: 0.7,
            // });

            // var markerData = getPopUpText(data);

            // marker.bindPopup(markerData.popUpText);

            // marker.options.icon.setColor(markerData.maxGasRate);

            // markerList.push(marker);

            // icon.animate();

            // return marker;
          // }
      // });

    // map.zoomControl.setPosition('topright');

    $('#toolbar .hamburger').on('click', function() {
        $(this).parent().toggleClass('open');
    });

    $("#menulist ul li").on('click', function(e) {
        e.stopPropagation();
        $(this).children('.content').toggle('slow');
    });

    L.control.layers({
        "streets": L.tileLayer("mapbox.streets"),
        "light": L.tileLayer("mapbox.light"),
        "dark": L.tileLayer("mapbox.dark"),
        "satellite": L.tileLayer("mapbox.satellite"),
        "streets-satellite": L.tileLayer("mapbox.streets-satellite"),
        "wheatpaste": L.tileLayer("mapbox.wheatpaste"),
        "streets-basic": L.tileLayer("mapbox.streets-basic"),
        "comic": L.tileLayer("mapbox.comic"),
        "outdoors": L.tileLayer("mapbox.outdoors"),
        "run-bike-hike": L.tileLayer("mapbox.run-bike-hike"),
        "pencil": L.tileLayer("mapbox.pencil"),
        "pirates": L.tileLayer("mapbox.pirates"),
        "emerald": L.tileLayer("mapbox.emerald"),
        "high-contrast": L.tileLayer("mapbox.high-contrast")
    }, null).addTo(map);


    var icon = createIcon(1)
	
	var location = GetLastLocation();
	
    var marker = new L.Marker(
        [location.lat, location.long],
        {
            id: 1,
            icon: icon,
            opacity: 0.7,
        }
    );

    var popUpText = "<div class='popup'><div class='item'>GESU00589</div><div class='item'>T° : 34 C°</div><div class='item'>Hum : 68 %</div></div>"

    marker.bindPopup(popUpText);

    marker.options.icon.setColor(20);

    markerList.push(marker);

    map.addLayer(marker);

    icon.animate();
	
	subscribe();
	
});
