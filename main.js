$(document).ready(function () {
    var hostname = window.location.protocol + "//" + window.location.host + "/"
    // when page is loaded, remove the loading
    $('.loading').remove();

    // tooltip
    $('[data-toggle="tooltip"]').tooltip();


    $('#adminOperationLink').click(function (e) {
        $("#mainAdmin").delay(100).fadeIn(100);
        $("#sensorTable").fadeOut(100);
        $("#adminMenu").delay(100).fadeIn(100);
        $("#main").fadeOut(100);
        $("#mainTab").fadeOut(100);
        $("#reportingMenu").fadeOut(100);
        loadStationTable();
        $(this).addClass('active');
        e.preventDefault();
    });

    $('#dashboardLink').click(function (e) {
        $("#mainAdmin").fadeOut(100);
        $("#adminMenu").fadeOut(100);
        $("#main").delay(100).fadeIn(100);
        $("#mainTab").delay(100).fadeIn(100);
        $("#reportingMenu").delay(100).fadeIn(100);


        e.preventDefault();
    });

    $('#displayMainViewButton').click(function (e) {
        initMap();
        reloadTableAndGraphData();


        e.preventDefault();
    });


    $('#adminCityselector').click(function (e) {
        loadStationTable();
        e.preventDefault();
    });





    function initMap() {
        $.ajax({
            //url: 'http://127.0.0.1:8081/data/station.json',
            url: hostname + 'stations/all',
            dataType: 'json',
            success: function (data) {
                getMapData(data);
            },
            error: function (e) {
                console.log(e.responseText);
            }
        });

    }

    function getMapData(result) {
        var cityCoordinates = {
            "cities": [
                {
                    "stationName": "Sacramento",
                    "latitude": "38.5816",
                    "longitude": "-121.4944"
                },
                {
                    "stationName": "San Francisco",
                    "latitude": "37.773972",
                    "longitude": "-122.431297"
                },
                {
                    "stationName": "Santa Clara",
                    "latitude": "37.3541",
                    "longitude": "-121.9552"
                }
            ]
        }

        var selectedCity = $("#cityselector").val();

        for (var i in cityCoordinates.cities) {

            if (cityCoordinates.cities[i].stationName == selectedCity) {
                var location = new google.maps.LatLng(cityCoordinates.cities[i].latitude, cityCoordinates.cities[i].longitude);

            }
        }

        var mapCanvas = document.getElementById('map');
        var mapOptions = {
            center: location,
            zoom: 12,
            panControl: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }
        var map = new google.maps.Map(mapCanvas, mapOptions);
        var image = {
            url: 'marker.png',
            // This marker is 20 pixels wide by 32 pixels high.
            size: new google.maps.Size(50, 50),
            // The origin for this image is (0, 0).
            origin: new google.maps.Point(0, 0),
            // The anchor for this image is the base of the flagpole at (0, 32).
            anchor: new google.maps.Point(0, 32)
        };
        // Shapes define the clickable region of the icon. The type defines an HTML
        // <area> element 'poly' which traces out a polygon as a series of X,Y points.
        // The final coordinate closes the poly by connecting to the first coordinate.
        var shape = {
            coords: [1, 1, 1, 20, 18, 20, 18, 1],
            type: 'poly'
        };
        var markerImage = 'marker.png';
        for (i in result) {
            var station = result[i];

            var stationName = station.stationName;
            var location = new google.maps.LatLng(station.latitude, station.longitude);
            var marker = new google.maps.Marker({
                position: location,
                map: map,
                icon: image,
                shape: shape,
                title: stationName
            });
            var info = "";
            for (i in station.sensors) {
                var status = "Not active"
                if (station.sensors[i].status = true) {
                    status = "Active"

                }

                info = info.concat("<p> Sensor " + station.sensors[i].sensorId + " of type " + station.sensors[i].sensorType + " is " + status + "<p>");
            }
            var contentString = '<div class="info-window">' +
                '<h3>Sensor Information</h3>' +
                '<div class="info-content">' + info

            '</div>' +
                '</div>';

            var infowindow = new google.maps.InfoWindow({
                maxWidth: 400
            });

            google.maps.event.addListener(marker, 'click', (function (marker, contentString, infowindow) {
                return function () {
                    infowindow.setContent(contentString);
                    infowindow.open(map, marker);
                };
            })(marker, contentString, infowindow));



        }
    }

    google.maps.event.addDomListener(window, 'load', initMap);

    $(function () {
        $(".daterangepicker-field").daterangepicker(

            {
                forceUpdate: true,
                callback: function (startDate, endDate, period) {

                    var title = startDate.format('L') + ' – ' + endDate.format('L');
                    $("#peiodHidden").val(period);
                    $(this).val(title);
                    //Fetch the table values
                    $("#mainAdmin").fadeOut(100);
                    $("#main").delay(100).fadeIn(100);
                    $("#mainTab").delay(100).fadeIn(100);
                    reloadTableAndGraphData();

                }
            }
        );
    });

    $(function () {
        reloadTableAndGraphData();

    });


    function reloadTableAndGraphData() {
        var timeRange = $("#timeRange").val();
        var period = $("#peiodHidden").val();
        var startParts = timeRange.split(' – ')[0];
        // Please pay attention to the month (parts[1]); JavaScript counts months from 0:
        // January - 0, February - 1, etc.
        var startDate = new Date(startParts);
        console.log(startDate.toDateString());

        var endParts = timeRange.split(' – ')[1];
        // Please pay attention to the month (parts[1]); JavaScript counts months from 0:
        // January - 0, February - 1, etc.
        var endDate = new Date(endParts);
        console.log(endDate.toDateString());

        var startDateTimeStamp = new Date(startDate).getTime();
        var endDateTimeStamp = new Date(endDate).getTime();
        var citySelected = $("#cityselector").val();
        var urlPart = "?period=" + period + "&" + "city=" + citySelected + "&" + "start=" + startDateTimeStamp + "&" + "end=" + endDateTimeStamp

        var baseURl = hostname
        $.ajax({
            //url: baseURl + "table" + urlPart,
            url: hostname + "data.json",

            dataType: 'json',
            success: function (data) {
                //alert('done');
                $('#clienti').bootstrapTable({
                    data: data
                });
            },
            error: function (e) {
                console.log(e.responseText);
            }
        });

        //Fetch the table graphvalues
        $.ajax({
            //url: baseURl + "graph" + urlPart,
            url: hostname + "polution.json",
            dataType: 'json',
            success: function (data) {
                //alert('done');
                $('#daily-usage .area-chart').highcharts(getChartData(data)

                );
            },
            error: function (e) {
                console.log(e.responseText);
            }
        });
    };

    function getChartData(result) {

        var chartData = {
            chart: {
                zoomType: 'xy'
            },
            title: {
                text: 'Polution report'
            },

            xAxis: [{
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                crosshair: true
            }],
            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value}°C',
                    style: {
                        color: Highcharts.getOptions().colors[2]
                    }
                },
                title: {
                    text: 'Carbon Dioxide',
                    style: {
                        color: Highcharts.getOptions().colors[2]
                    }
                },
                opposite: true

            }, { // Secondary yAxis
                gridLineWidth: 0,
                title: {
                    text: 'Sulphur Dioxide',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                labels: {
                    format: '{value} mm',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                }

            }, { // Tertiary yAxis
                gridLineWidth: 0,
                title: {
                    text: 'Carbon Monoxide',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                labels: {
                    format: '{value} mb',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                opposite: true
            }],
            tooltip: {
                shared: true
            },
            legend: {
                layout: 'vertical',
                align: 'left',
                x: 80,
                verticalAlign: 'top',
                y: 55,
                floating: true,
                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
            },
            series: [{
                name: 'Sulphur Dioxide',
                type: 'column',
                yAxis: 1,
                data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
                tooltip: {
                    valueSuffix: ' mm'
                }

            }, {
                name: 'Carbon Monoxide',
                type: 'spline',
                yAxis: 2,
                data: [1016, 1016, 1015.9, 1015.5, 1012.3, 1009.5, 1009.6, 1010.2, 1013.1, 1016.9, 1018.2, 1016.7],
                marker: {
                    enabled: false
                },
                dashStyle: 'shortdot',
                tooltip: {
                    valueSuffix: ' mb'
                }

            }, {
                name: 'Carbon Dioxide',
                type: 'spline',
                data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6],
                tooltip: {
                    valueSuffix: ' °C'
                }
            }]
        };

        /*chartData.xAxis[0].categories =  ['aan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        chartData.series[0].data =  [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4];
        chartData.series[1].data =  [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4];
        chartData.series[2].data =  [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4];*/

        chartData.xAxis[0].categories = result.xAxis[0].categories;
        chartData.series[0].data = result.series[0].data;
        chartData.series[1].data = result.series[1].data;
        chartData.series[2].data = result.series[2].data;
        return chartData;


    };

    function loadStationTable() {

        $("#stationTable").delay(100).fadeIn(100);

        var station;
        var sensor;
        //Station table

        $("#s").delay(100).fadeIn(100);
        station = $('#stationTable').DataTable({
            destroy: true,
            "ajax": {
                "url": hostname + "stations/all",
                //"url": "http://127.0.0.1:8081/data/table.json",
                "dataSrc": function (json) {
                    var result = [];
                    for (row in json) {
                        var rowResult = [json[row].stationId, json[row].stationName];
                        result.push(rowResult);

                    }

                    var final = { "data": result };
                    return final.data
                }
            },
            "columnDefs": [{
                "targets": -1,
                "data": null,
                "defaultContent":
                '<button class="btn-view" type="button">Station Details</button>'
                + '<button class="btn-delete"  type="button">Delete</button>'
            }

            ]
        });

        // Handle click on "View" button
        $('#stationTable tbody').off('click',  '.btn-view').on('click', '.btn-view', function (e) {
            var data = station.row($(this).parents('tr')).data();
            loadSensorTable(data[0]);

        });


        // Handle click on "Delete" button
        $('#stationTable tbody').off('click', '.btn-delete').on('click', '.btn-delete', function (e) {
            var data = station.row($(this).parents('tr')).data();
            $.ajax({
                //url: 'http://127.0.0.1:8081/station/' + data[0],
                url: hostname + 'stations/' + data[0],

                type: 'DELETE',
                success: function (result) {
                    var table = $('#stationTable').DataTable();
                    if (table) {
                        table.destroy();

                    }
                    loadStationTable();


                }

            });


        });

    }






    //Sensor table
    function loadSensorTable(stationId) {

        $("#sensorTable").delay(100).fadeIn(100);
        var sensorTable = $("#sensorTable").dataTable();
        $(document).ready(function () {
            sensor = $('#sensorTable').DataTable({
                destroy: true,

                "ajax": {
                    //"url": "http://127.0.0.1:8081/data/station1.json",
                     "url": hostname + "stations/" + stationId,

                    "dataSrc": function (json) {
                        var result = [];
                        var stationId = json.stationId;
                        var stationName = json.stationName;
                        for (row in json.sensors) {
                            var status = "Not Active"
                            if (json.sensors[row].status == true) {
                                status = "Active"
                            }
                            var rowResult = [stationId, stationName, json.sensors[row].sensorId, json.sensors[row].sensorType, status];
                            result.push(rowResult);

                        }

                        var final = { "data": result };
                        return final.data
                    }
                },
                type: 'GET',
                "columnDefs": [{
                    "targets": -1,
                    "data": null,
                    "defaultContent": "<button>Delete</button>"
                }
                ]
            });

            $('#sensorTable tbody').off('click').on('click', 'button', function () {
                var data = sensor.row($(this).parents('tr')).data();
                $.ajax({
                    url: hostname + 'stations/' + data[0] + "/sensors/" + data[2],
                    //url: 'http://127.0.0.1:8081/station/' + data[0] + "/sensor/" + data[2],
                    type: 'DELETE',
                    success: function (result) {
                        clearAndRedrawSensorTable(stationId);

                    },
                    error: function () {
                    }


                });


            })
        });
    }


    $("button#stationSubmit").on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var formData = {
            'stationName': $('input[name=stationName]').val(),
            'longitude': $('input[name=longitude]').val(),
            'latitude': $('input[name=latitude]').val()
        };
        $.ajax({
            type: "POST",
            url: hostname + "stations",
            data: JSON.stringify(formData),
            dataType: "json",
            contentType: "application/json",
            success: function (msg) {
                var table = $('#stationTable').DataTable();
                if (table) {
                    table.destroy();

                }
                loadStationTable();
                $("#sensorTable").dataTable().fnClearTable();
            },
            error: function () {
                var table = $('#stationTable').DataTable();
                if (table) {
                    table.destroy();

                }
                loadStationTable();
                $("#sensorTable").dataTable().fnClearTable();
            }
        });

    });

    $('button#sensorSubmit').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var stationID = $('input[name=sensorStationId]').val();
        var formData = {
            'sensorId': $('input[name=sensorId]').val(),
            'type': $('input[name=type]').val()
        };
        $.ajax({
            type: "POST",
            url: hostname + "stations/" + stationID + "/sensors",
            data: JSON.stringify(formData),
            dataType: "json",
            contentType: "application/json",
            success: function (msg) {
                $("#sensorTable").dataTable().fnClearTable();

            },
            error: function () {
                $("#sensorTable").dataTable().fnClearTable();
            }
        });
    });

    function clearAndRedrawStationTable() {
        var stationDataTable = $("#stationTable").dataTable();

        $.ajax({
            "url": hostname + "stations/all",
           // "url": "http://127.0.0.1:8081/data/table.json",
            dataType: 'json',
            success: function (data) {

                stationDataTable.fnClearTable();
                stationDataTable.fnAddData(loadStationTableData(data));
                stationDataTable.fnDraw();

            },
            error: function (e) {

                console.log(e.responseText);
            }
        });


    }

    function loadStationTableData(json) {

        var result = [];
        for (row in json) {
            var rowResult = [json[row].stationId, json[row].stationName];
            result.push(rowResult);

        }

        var final = { "data": result };
        return final.data

    }



    function clearAndRedrawSensorTable(stationId) {
        var sensorDataTable = $("#sensorTable").dataTable();
        $.ajax({
            //"url": "http://127.0.0.1:8081/data/station1.json",
            "url": hostname + "stations/" + stationId ,
            dataType: 'json',
            success: function (data) {

                sensorDataTable.fnClearTable();
                sensorDataTable.fnAddData(loadSensorTableData(data));
                sensorDataTable.fnDraw();

            },
            error: function (e) {

                console.log(e.responseText);
            }
        });


    }

    function loadSensorTableData(json) {

        var result = [];
        var stationId = json.stationId;
        var stationName = json.stationName;
        for (row in json.sensors) {
            var status = "Not Active"
            if (json.sensors[row].status == true) {
                status = "Active"
            }
            var rowResult = [stationId, stationName, json.sensors[row].sensorId, json.sensors[row].sensorType, status];
            result.push(rowResult);

        }

        var final = { "data": result };
        return final.data
    }


});


