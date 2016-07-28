'use strict';

/* Services */

var stavrServices = angular.module('stavrServices', ['ngResource']);

stavrServices.factory('STDataSer', ['$resource',
  function($resource){
    return $resource('', {}, {
         getInfoTable:{
           method :'GET',
           transformResponse:function (data,headerFn) {
              return data
           }
           
         }
      });
  }]);
stavrServices.factory('UpdateTrajectoryDataSever', ['$http',
    function http($http){
        return $http('', {}, {
            getInfoTable:{
                method :'GET',
                transformResponse:function (data,headerFn) {
                    return data
                }

            }
        });
    },
    function resource($resource){
        return $resource('http://localhost:8080/DataVisualor/ServletJson?TID=:id & TOwner=:own &TNumber=:num &TStartTime= :starTime &TEndTime=:endTime', {}, {});
    }]
);

stavrServices.factory('MapViewerSever', function () {
    var service = {};
    var raster = new ol.layer.Tile({
        source: new ol.source.Stamen({
            layer: 'toner'
        })
    });
    raster.setOpacity(0.5);
    

    var map = new  ol.Map({
            layers: [
                new ol.layer.Tile({
                    //source: new ol.source.MapQuest({layer: 'sat'})
                    // source: new ol.source.OSM({opaque:'false'})
                    //source: new ol.source.Raster()
                    // source: new ol.source.ImageWMS({
                    //     url:'http://demo.opengeo.org/geoserver/wms',
                    //     params:{'LAYERS':'ne:ne'},
                    //     serverType:'geoserver'})
                    //source: new ol.source.CartDB()
                    title:'toner-hybrid',
                    visible: true,
                    source: new ol.source.Stamen({
                        //layer: 'terrain-background'
                        // layer: 'terrain'
                        layer: 'toner-hybrid'
                    }),
                    // source: new ol.source.MapQuest({layer: 'osm'}),
                     opacity:0.3




                    // : {
                    //     extension: 'png',
                    //     opaque: false
                    // },
                    // 'terrain-lines': {
                    //     extension: 'png',
                    //     opaque: false
                    // },
                    // 'toner-background': {
                    //     extension: 'png',
                    //     opaque: true
                    // },
                    // 'toner': {
                    //     extension: 'png',
                    //     opaque: true
                    // },
                    // 'toner-hybrid': {
                    //     extension: 'png',
                    //     opaque: false
                    // },
                    // 'toner-labels': {
                    //     extension: 'png',
                    //     opaque: false
                    // },
                    // 'toner-lines': {
                    //     extension: 'png',
                    //     opaque: false
                    // },
                    // 'toner-lite': {
                    //     extension: 'png',
                    //     opaque: true
                    // },
                    // 'watercolor': {
                    //     extension: 'jpg',
                    //     opaque: true
                    // }



                }),
                //        //        导入GeoJson文件数据
                //       new ol.layer.Vector({
                //         source: new ol.source.Vector({
                //           url: '../data2.geojson',
                //           format: new ol.format.GeoJSON()
                //         })
                // //              设置点的格式"MultiPoint",
                // //              style:
                //       })
                new ol.layer.Tile({
                    title:'MapQuest osm',
                    visible: false,
                    source: new ol.source.MapQuest({layer: 'osm'}),
                    opacity:0.3
                }),
                new ol.layer.Tile({
                    //
                    // source: new ol.source.OSM({opaque:'false'})
                    //source: new ol.source.Raster()
                    // source: new ol.source.ImageWMS({
                    //     url:'http://demo.opengeo.org/geoserver/wms',
                    //     params:{'LAYERS':'ne:ne'},
                    //     serverType:'geoserver'})
                    //source: new ol.source.CartDB()
                    title:'MapQuest sat',
                    visible: false,
                    source: new ol.source.MapQuest({layer: 'sat'}),
                    opacity:0.3
                }),
                new ol.layer.Tile({
                    // source: new ol.source.ImageWMS({
                    //     url:'http://demo.opengeo.org/geoserver/wms',
                    //     params:{'LAYERS':'ne:ne'},
                    //     serverType:'geoserver'})
                    //
                    title:'OSM',
                    visible: false,
                    source: new ol.source.OSM({opaque:'false'}),
                    opacity:0.3
                }),
                new ol.layer.Tile({
                    title:'ImageWMS',
                    visible: false,
                    source: new ol.source.ImageWMS({
                            url:'http://demo.opengeo.org/geoserver/wms',
                            params:{'LAYERS':'ne:ne'},
                            serverType:'geoserver'}),
                    opacity:0.3
                })

            ],
            target: 'map',
            //            controls: ol.control.defaults({
            //                attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
            //                    collapsible: false
            //                })
            //            }),
            //            比例尺
            controls: ol.control.defaults().extend([
                new ol.control.ScaleLine()
            ]),
            view: new ol.View({
                center: ol.proj.transform([114.34500, 30.59389], 'EPSG:4326', 'EPSG:3857'),
                zoom: 11,
                minZoom: 10

            })
        });

    // add layer switcher
    var layerSwitcher = new ol.control.LayerSwitcher({
        tipLabel:'Layer'
    });
    map.addControl(layerSwitcher);





    // a normal select interaction to handle click
    var select = new ol.interaction.Select();
    map.addInteraction(select);
    select.on('select', function(e) {

    });

    var selectedFeatures = select.getFeatures();

    // a DragBox interaction used to select features by drawing boxes
    var dragBox = new ol.interaction.DragBox({
        condition: ol.events.condition.platformModifierKeyOnly
    });

    map.addInteraction(dragBox);

    dragBox.on('boxend', function() {
        // features that intersect the box are added to the collection of
        // selected features, and their names are displayed in the "info"
        // div
        var info = [];
        var extent = dragBox.getGeometry().getExtent();
        // vectorSource.forEachFeatureIntersectingExtent(extent, function(feature) {
        //     selectedFeatures.push(feature);
        //     info.push(feature.get('name'));
        // });
    });

    // clear selection when drawing a new box and when clicking on the map
    dragBox.on('boxstart', function() {
        selectedFeatures.clear();

    });
    map.on('click', function() {
        service.selectedFeatures.clear();
    });





    // trajectory layers
    var trajectoryFeatures = new ol.Collection();
    var trajectoryLayer = new ol.layer.Vector({
        title:'trajectoryLayer',
        source: new ol.source.Vector({features: trajectoryFeatures})
    });
    trajectoryLayer.setMap(map);



    // map.addLayer(trajectoryLayer);
    // var draw;
    // function addInteraction() {
    //     draw = new ol.interaction.Draw({
    //         features: trajectoryFeatures,
    //         type: /** @type {ol.geom.GeometryType} */ "Point"
    //     });
    //     map.addInteraction(draw);
    // }
    // addInteraction();

    //highlight features geometry
    var highlightLayer  = new ol.layer.Vector({
       source: new ol.source.Vector()
    });
    var highllightSource = highlightLayer.getSource();
    highlightLayer.setMap(map);

    



    service.map = map;
    service.trajectoryFeatures = trajectoryFeatures;
    service.trajectoryLayer = trajectoryLayer;
    service.selectedFeatures = selectedFeatures;
    

    service.removeAllLayers = function () {
        var layers = map.getLayers().getArray();
        while(layers.length>1){
            map.removeLayer(layers[1]);
        }
    };
    service.selectLayer = function (name) {
        service.selectedFeatures.clear();
        var layers = map.getLayers().getArray();
        layers.forEach(function (layer) {
            var source =  layer.getSource();
            if(layer.get('name') == name){
                var feature = source.getFeatures();
                feature.forEach(function (f) {
                    service.selectedFeatures.push(f);
                })

            }

        });
    };

    service.selectTrajectoryFeatures = function (name) {
        service.selectedFeatures.clear();
        trajectoryFeatures.getArray().forEach(function (feature) {
            if(feature.get('name') == name){
                service.selectedFeatures.push(feature);
            }
        });
        service.map.render();
    };

    service.selectTrajectoryFeaturesByUTCTime = function(timeRange){
        highllightSource.clear();
        service.trajectoryFeatures.getArray().forEach(function (feature) {
            var geometryCoords = feature.getGeometry().getCoordinates();
            var times = feature.getGeometry().get("times");
            var index = times.map(function(e){
                var t = +e;
                var min = timeRange[0];
                var max = timeRange[1];
                if(t >= min && t <= max) return true;
                else return false;
            });
            var selectedCoords= geometryCoords.map(function(e,i){
                if(index[i]) return e;
            }).filter(function(e){return e!== undefined});



            var hexcolor = feature.get("color");
            var alpColor = ol.color.asArray(hexcolor);
            alpColor = alpColor.slice();
            alpColor[3] = 0.1;
            // feature.getStyle().getImage().getFill().setColor(alpColor);
            feature.setStyle( new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({
                        color: alpColor
                    })
                })
            }));

            var highAlpColor = ol.color.asArray(hexcolor);
            highAlpColor = highAlpColor.slice();
            highAlpColor[3] = 0.9;
            var newFeature = new ol.Feature({
                geometry:new ol.geom.MultiPoint(selectedCoords)
            });
            newFeature.setStyle(new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({
                        color: highAlpColor
                    })
                })
            }));
            highllightSource.addFeature(newFeature);

        });
        service.map.render();
    };

    service.clearHighlightFeatures = function(){
        highllightSource.clear();
    };


    return service


});

stavrServices.factory('StopEventlayerSever',function () {
    var number = 0;

    return function(){
        number +=1;
        var d3Color = d3.scale.category20();
        var width = 80,
            height = 80,
            radius = Math.min(width, height) / 2,
            innerRadius = 0.3 * radius,
            idName = "marker_" + number;

        var pie = d3.layout.pie()
            .sort(null)
            .value(function(d) { return d.width; });

        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([0, 0])
            .html(function(d) {
                return d.data.label + ": <span style='color:orangered'>" + d.data.score + "</span>";
            });

        var arc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(function (d) {
                return (radius - innerRadius) * (d.data.score / 100.0) + innerRadius;
            });

        var outlineArc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(radius);

        //var svg = document.createElement("svg")
        var svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("id",idName)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        svg.call(tip);

        d3.csv('aster_data.csv', function(error, data) {

            data.forEach(function(d) {
                d.id     =  d.id;
                d.order  = d.order;
                d.color  =  d.color;
                d.weight = +d.weight;
                d.score  = +d.score;
                d.width  = +d.weight;
                d.label  =  d.label;
            });
            // for (var i = 0; i < data.score; i++) { console.log(data[i].id) }

            var path = svg.selectAll(".solidArc")
                .data(pie(data))
                .enter().append("path")
                .attr("fill", function(d) { return d3Color(d.data.order); })
                .attr("class", "solidArc")
                .attr("stroke", "gray")
                .attr("d", arc)
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);

            // calculate the weighted mean score
            var score =
                data.reduce(function(a, b) {
                    //console.log('a:' + a + ', b.score: ' + b.score + ', b.weight: ' + b.weight);
                    return a + (b.score * b.weight);
                }, 0) /
                data.reduce(function(a, b) {
                    return a + b.weight;
                }, 0);

            svg.append("svg:text")
                .attr("class", "aster-score")
                .attr("dy", ".35em")
                .attr("text-anchor", "middle") // text-align: right
                .text(score);

        });

        return idName;
    };
});
stavrServices.factory('RelationGraphSever',function(){
    
});
stavrServices.factory('StackBarDataSever',function(){

});

/**
 *  provide the Instance to manage the data to analysis
 */
stavrServices.factory('ActiveDataFactory',function ($http,$q) {
    var service = {};

    service.startDate = "2013-1-1";
    service.endDate = "2013-12-12";
    service.dataObj = {};
    service.selectData = [];

    var traTableJsonSevletUrl = 'http://localhost:8080/DataVisualor/TraTableJsonSevlet';

    service.setDateRange =function (startDate,endDate){
        service.startDate =startDate;
        service.endDate = endDate;
    };

    service.getDateRange = function () {
        var dateRange ={};
        dateRange.startDate =  this.startDate;
        dateRange.endDate =  this.endDate;
        return dateRange;
    }


    // set typeFeature
    service.setTypeFeature = function(typeFeature){
        service.typeFeature = typeFeature;
    };

    service.getTrajUrlByCarNumber = function (carNumber,typeFeature) {

        var tStartTime = service.startDate;
        var tEndTime = service.endDate;
        var url = "http://localhost:8080/DataVisualor/ServletJson?"+
                    "TID=&"+
                    "TOwner=&"+
                    "TNumber="+carNumber+"&"+
                    "TStartTime="+tStartTime+"&"+
                    "TEndTime=" + tEndTime+"&"+
                    "Type="+typeFeature;

        service.trajUrl = url;

        return url;
    };

    service.getEventsJsonUrlSet = function () {

        var tStartTime = this.startDate;
        var tEndTime = this.endDate;

        var urlSet = [];

        for(var i=0;i<this.selectData.length;i++){
            var carNumber = this.selectData[i][0];

            var url = "http://localhost:8080/DataVisualor/EventServletJson?"+
            "TID=&"+
            "TOwner=&"+
            "TNumber="+carNumber+"&"+
            "TStartTime="+tStartTime+"&"+
            "TEndTime=" + tEndTime;

            urlSet[i] = url;
        }

        return urlSet;
    };


    service.setInfoDataTable  = function () {

    };

    service.setUrl = function (url) {
        service.url = url;
    };

    service.getUrl = function (url) {
        return service.url;
    };


    service.setSelectData = function (data) {
        if(service.selectData == data) {
            return;
        }else{
            service.selectData = data;
            service.isMapUpdate = true;
        }

    };

    service.getSelectData = function () {
        return service.selectData;
    };

    service.getSelectDataCarNumberStr = function () {
        var carNumberStr ="";
        for(var j=0;j<this.selectData.length;j++){
            var carNumber = this.selectData[j][0];
            carNumberStr += carNumber + ";";
        }
        return carNumberStr
    };





    service.isSelectDataExist = function () {

        return service.selectData && service.selectData.length > 0;
    };

    service.isMapUpdate = false;

    service.callDatabase = function () {

        var deferred = $q.defer();

        $http.get(traTableJsonSevletUrl,{cache:true}).success(function (data) {
            service.dataObj = angular.fromJson(data);
            var object = service.dataObj;
            var head = object.tableHead;
            var rowData = object.tableData;
            var htmlStr = "<thead ><tr>";
            for(var i=0 ; i < head.length;i++)
            {
                htmlStr += "<th>" +
                    head[i] +
                    "</th>";
            }
            htmlStr +="</tr></thead>";
            htmlStr +="<tbody>";
            for(var i=0 ; i < rowData.length;i++)
            {
                var rowObject = angular.fromJson(rowData[i]);
                htmlStr += "<tr>"+
                    "<td>"+rowObject.Num+"</td>"+
                    "<td>"+rowObject.Own+"</td>"+
                    "<td>"+rowObject.Time+"</td>" +
                    "</tr>";
            }
            htmlStr +="</tbody>";
            deferred.resolve(htmlStr);
        }).error(function () {
            deferred.reject('There was an error');
        });
        return deferred.promise;
    };

    service.callTrajectoryData = function (carNumber,typeFeature) {


        var tStartTime = service.startDate;
        var tEndTime = service.endDate;
        var url = "http://localhost:8080/DataVisualor/ServletJson?"+
            "TID=&"+
            "TOwner=&"+
            "TNumber="+carNumber+"&"+
            "TStartTime="+tStartTime+"&"+
            "TEndTime=" + tEndTime+"&"+
            "Type="+typeFeature;


        var deferred = $q.defer();

        $http.get(url,{cache:true}).success(function (data) {
            deferred.resolve(data);
        }).error(function () {
            deferred.reject('There was an error');
        });
        return deferred.promise;
    };

    service.callEventData = function () {

        var geoJsonFileSet = this.getEventsJsonUrlSet();

        var deferred = $q.defer();

        var urlCalls = [];

        angular.forEach(geoJsonFileSet, function(url) {
            urlCalls.push($http.get(url,{cache:true}));
        });

        // they may, in fact, all be done, but this
        // executes the callbacks in then, once they are
        // completely finished.

        $q.all(urlCalls)
            .then(
                function(results) {
                    deferred.resolve(JSON.stringify(results));
                },
                function(errors) {
                    deferred.reject(errors);
                },
                function(updates) {
                    deferred.update(updates);
                });

        return deferred.promise;

    };

    service.callSelectedDataTable = function(){
        if(this.selectData.length==0) return "";
        var dataObjHead = this.dataObj.tableHead;
        var tableHTMLStr = "<table class='table'><thead><tr>";
        for(var i=0 ; i < dataObjHead.length;i++)
        {
            tableHTMLStr += "<th>" +
                dataObjHead[i] +
                "</th>";
        }
        tableHTMLStr += "</tr></thead><tbody>";
        for(var j=0;j<this.selectData.length;j++){

            var carNumber = this.selectData[j][0];
            var carOwner  = this.selectData[j][1];
            var carTime   = this.selectData[j][2];
            tableHTMLStr += "<tr><td>" + carNumber + "</td><td>";
            tableHTMLStr += carOwner + "</td><td>";
            tableHTMLStr += carTime + "</td></tr>";
        }
        tableHTMLStr += "</tbody></table>";
        return tableHTMLStr
    };

    return service;

});
