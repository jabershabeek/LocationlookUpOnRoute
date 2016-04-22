var sourceLat, sourceLng;
var routePolygon;
		var destinationLat, destinationLng;
		function initialize() {

			var directionsDisplay = new google.maps.DirectionsRenderer();
			var directionsService = new google.maps.DirectionsService();
			var map;
			var routeBoxer = new RouteBoxer();
			var distance = 1;
			var cascadiaFault;
			var routeBounds = [];

			var googleMaps2JTS= function googleMaps2JTS(boundaries) {
    var coordinates = [];
    var length = 0;
    if (boundaries && boundaries.getLength) length = boundaries.getLength();
    else if (boundaries && boundaries.length) length = boundaries.length;
    for (var i = 0; i < length; i++) {
        if (boundaries.getLength) coordinates.push(new jsts.geom.Coordinate(
        boundaries.getAt(i).lat(), boundaries.getAt(i).lng()));
        else if (boundaries.length) coordinates.push(new jsts.geom.Coordinate(
        boundaries[i].lat(), boundaries[i].lng()));
    }
    return coordinates;
};

var jsts2googleMaps = function (geometry) {
  var coordArray = geometry.getCoordinates();
  GMcoords = [];
  for (var i = 0; i < coordArray.length; i++) {
    GMcoords.push(new google.maps.LatLng(coordArray[i].x, coordArray[i].y));
  }
  return GMcoords;
}
			var mapOptions = {
				center: new google.maps.LatLng(37.7831,-122.4039),
				zoom: 15,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};

			var map = new google.maps.Map(document.getElementById('map'), mapOptions);

			directionsDisplay.setMap(map);

			var source = new google.maps.places.Autocomplete(document.getElementById('source'));
			var infoWindow = new google.maps.InfoWindow();
			var marker = new google.maps.Marker({
			  map: map
			});

			google.maps.event.addListener(source, 'place_changed', function() {
			  infoWindow.close();
			  var place = source.getPlace();
			  marker.setPosition(place.geometry.location);
			  sourceLat = marker.getPosition().lat();
			  sourceLng = marker.getPosition().lng();
			  infoWindow.setContent('<div><strong>' + place.name + '</strong><br>');
			});

			var destination = new google.maps.places.Autocomplete(document.getElementById('destination'));
			var infoWindow = new google.maps.InfoWindow();
			var marker = new google.maps.Marker({
			  map: map
			});

			google.maps.event.addListener(destination, 'place_changed', function() {
			  infoWindow.close();
			  var place = destination.getPlace();
			  marker.setPosition(place.geometry.location);
			  destinationLat = marker.getPosition().lat();
			  destinationLng = marker.getPosition().lng();
			  infoWindow.setContent('<div><strong>' + place.name + '</strong><br>');

				//Same event, draw route
			    start = new google.maps.LatLng(sourceLat, sourceLng);
				end = new google.maps.LatLng(destinationLat, destinationLng);
				var request = {
					origin: start,
					destination: end,
					travelMode: google.maps.TravelMode.DRIVING
				};
				directionsService.route(request, function(response, status) {
					if (status == google.maps.DirectionsStatus.OK) {
						 directionsDisplay.setDirections(response);
            var overviewPath = response.routes[0].overview_path,
                overviewPathGeo = [];
            for (var i = 0; i < overviewPath.length; i++) {
                overviewPathGeo.push(
                [overviewPath[i].lng(), overviewPath[i].lat()]);
            }

            var distance = (50000 * 0.0001) / 111.12, // Roughly 10km
                geoInput = {
                    type: "LineString",
                    coordinates: overviewPathGeo
                };
            var geoInput = googleMaps2JTS(overviewPath);
            var geometryFactory = new jsts.geom.GeometryFactory();
            var shell = geometryFactory.createLineString(geoInput);
            var polygon = shell.buffer(distance);

            var oLanLng = [];
            var oCoordinates;
            oCoordinates = polygon.shell.points[0];
            for (i = 0; i < oCoordinates.length; i++) {
                var oItem;
                oItem = oCoordinates[i];
                oLanLng.push(new google.maps.LatLng(oItem[1], oItem[0]));
            }
            if (routePolygon && routePolygon.setMap) routePolygon.setMap(null);
            routePolygon = new google.maps.Polygon({
                paths: jsts2googleMaps(polygon),
                map: map
            });
					} else {
						alert("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
					}	
				});
			});

			var customerSource = new google.maps.places.Autocomplete(document.getElementById('customerSource'));
			var infoWindow = new google.maps.InfoWindow();
			var marker = new google.maps.Marker({
			  map: map
			});

			google.maps.event.addListener(customerSource, 'place_changed', function() {
			  infoWindow.close();
			  var place = customerSource.getPlace();
			  marker.setPosition(place.geometry.location);
			  sourceLat = marker.getPosition().lat();
			  sourceLng = marker.getPosition().lng();
			  infoWindow.setContent('<div><strong>' + place.name + '</strong><br>');
			});
			
			google.maps.event.addDomListener(document.getElementById('search'), 'click', function searchLocation() {
				var containsLocation = google.maps.geometry.poly.containsLocation(marker.position, routePolygon);
			  if (containsLocation) {
				document.getElementById('resultDiv').innerHTML="Accepted Since Location within 5Kms(Aprox.)";
			  } else {
				document.getElementById('resultDiv').innerHTML="Rejected Since Location is not within 5Kms(Aprox.)";
			  }
			});

		}
		
		google.maps.event.addDomListener(window, "load", initialize);